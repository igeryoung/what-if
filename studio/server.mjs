// What-if Studio: a prompt box that turns a topic into a 60 s vertical film (Chinese + English) via headless Claude Code.
//   node studio/server.mjs            → http://127.0.0.1:8787   (PORT / HOST / MAX_RUNNING env to change)
// Each topic is a film folder films/<id>/; the studio keeps its run log in films/<id>/session/{session.json, events.jsonl, raw.log}.
// The film itself is built by `claude -p` in the repo root following docs/BRIEF.md.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {spawn, execFile} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..'); // repo root: cwd of every claude run
const FILMS = path.join(ROOT, 'films');
const LANGS = ['zh', 'en'];
const PORT = +(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
const MAX_RUNNING = +(process.env.MAX_RUNNING || 2);
const CLAUDE = process.env.CLAUDE_BIN || 'claude';
fs.mkdirSync(FILMS, {recursive: true});

const TOPICS = JSON.parse(fs.readFileSync(path.join(HERE, 'topics.json'), 'utf8'));

// ── session store ───────────────────────────────────────────────────────────
const dir = (id) => path.join(FILMS, id, 'session');
const load = (id) => JSON.parse(fs.readFileSync(path.join(dir(id), 'session.json'), 'utf8'));
const save = (s) => {
	s.updatedAt = Date.now();
	fs.writeFileSync(path.join(dir(s.id), 'session.json'), JSON.stringify(s, null, 1));
	return s;
};
const all = () =>
	fs
		.readdirSync(FILMS)
		.filter((d) => fs.existsSync(path.join(dir(d), 'session.json')))
		.map(load)
		.sort((a, b) => b.createdAt - a.createdAt);
const pushEvent = (id, ev) => fs.appendFileSync(path.join(dir(id), 'events.jsonl'), JSON.stringify({t: Date.now(), ...ev}) + '\n');
const events = (id, n = 80) => {
	const p = path.join(dir(id), 'events.jsonl');
	if (!fs.existsSync(p)) return [];
	return fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).slice(-n).map((l) => JSON.parse(l));
};
const videoOf = (s, lang = 'zh') => path.join(FILMS, s.id, 'out', `${lang}.mp4`);
/** {lang: mtime} of the rendered versions, Chinese first. */
const videosOf = (s) => {
	const v = {};
	for (const lang of LANGS) if (fs.existsSync(videoOf(s, lang))) v[lang] = fs.statSync(videoOf(s, lang)).mtimeMs;
	return v;
};
const metaOf = (s) => {
	try {
		const m = JSON.parse(fs.readFileSync(path.join(FILMS, s.id, 'meta.json'), 'utf8'));
		// older films: {title, summary, sources, notes} = Chinese only
		return m.zh || m.en ? m : {zh: {title: m.title, summary: m.summary}, sources: m.sources, notes: m.notes};
	} catch {
		return null;
	}
};
const view = (s) => {
	const videos = videosOf(s);
	const first = Object.keys(videos)[0];
	return {...s, videos, hasVideo: !!first, videoMtime: first ? videos[first] : 0, meta: metaOf(s)};
};

// mark sessions that were running when the server died
for (const s of all()) if (s.status === 'running' || s.status === 'queued') save({...s, status: 'interrupted'});

// ── film ids ────────────────────────────────────────────────────────────────
const newId = () => {
	const d = new Date();
	const stamp = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
	for (;;) {
		const id = `w${stamp}-${Math.random().toString(36).slice(2, 6)}`;
		if (!fs.existsSync(path.join(FILMS, id))) return id;
	}
};

// ── runner ──────────────────────────────────────────────────────────────────
const procs = new Map(); // id → child
const queue = [];

const firstPrompt = (s) =>
	[
		`FILM_ID: ${s.id}`,
		`TOPIC: ${s.topic}`,
		'',
		'Make this what-if short in Traditional Chinese and English. Follow docs/BRIEF.md exactly (read it first).',
		'Work autonomously to the end: research/verify facts, write the film, score it, render both languages, check frames, write meta.json (with the YouTube title/description/tags for both languages).',
	].join('\n');
const revisePrompt = (id, fb) =>
	[
		`修改意見（FILM_ID ${id}）：${fb}`,
		'',
		'先重讀 docs/BRIEF.md（專案結構和規則可能在你上次執行後更新過，以它為準），再照 Revisions 段落處理：改好、重新 render、更新 meta.json。',
	].join('\n');

function startRun(s, prompt) {
	const args = ['-p', prompt, '--output-format', 'stream-json', '--verbose', '--permission-mode', 'acceptEdits', '--allowedTools', 'Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'WebSearch', 'WebFetch'];
	if (s.claudeSession) args.push('--resume', s.claudeSession);
	const raw = fs.createWriteStream(path.join(dir(s.id), 'raw.log'), {flags: 'a'});
	const child = spawn(CLAUDE, args, {cwd: ROOT, env: {...process.env, FORCE_COLOR: '0'}, stdio: ['ignore', 'pipe', 'pipe']});
	procs.set(s.id, child);
	save({...load(s.id), status: 'running', startedAt: Date.now(), error: null});
	pushEvent(s.id, {kind: 'status', text: s.claudeSession ? '開始修改' : '開始製作'});

	let buf = '';
	child.stdout.on('data', (d) => {
		raw.write(d);
		buf += d;
		let i;
		while ((i = buf.indexOf('\n')) >= 0) {
			const line = buf.slice(0, i);
			buf = buf.slice(i + 1);
			if (line.trim()) onStreamLine(s.id, line);
		}
	});
	child.stderr.on('data', (d) => raw.write(d));
	child.on('close', (code) => {
		raw.end();
		procs.delete(s.id);
		const cur = load(s.id);
		const ok = code === 0 && fs.existsSync(videoOf(cur));
		const status = cur.status === 'cancelled' ? 'cancelled' : ok ? 'done' : 'failed';
		save({...cur, status, finishedAt: Date.now(), error: ok || status === 'cancelled' ? null : `claude exited ${code}${fs.existsSync(videoOf(cur)) ? '' : ', no video produced'}`});
		pushEvent(s.id, {kind: 'status', text: status === 'done' ? '完成' : status === 'cancelled' ? '已取消' : `失敗（exit ${code}）`});
		pump();
	});
}

function onStreamLine(id, line) {
	let m;
	try {
		m = JSON.parse(line);
	} catch {
		return;
	}
	if (m.type === 'system' && m.subtype === 'init' && m.session_id) {
		const s = load(id);
		if (!s.claudeSession) save({...s, claudeSession: m.session_id});
	} else if (m.type === 'assistant' && m.message?.content) {
		for (const b of m.message.content) {
			if (b.type === 'text' && b.text.trim()) pushEvent(id, {kind: 'text', text: b.text.trim().slice(0, 600)});
			if (b.type === 'tool_use') pushEvent(id, {kind: 'tool', text: describeTool(b)});
		}
	} else if (m.type === 'result') {
		const s = load(id);
		// total_cost_usd is the running total of the whole Claude session (it carries over --resume and is repeated on
		// every result, e.g. after a background task wakes the run), so keep the latest per session instead of adding.
		const costs = {...s.costs, [m.session_id || s.claudeSession || 'unknown']: m.total_cost_usd || 0};
		const cost = Object.values(costs).reduce((a, b) => a + b, 0);
		const u = m.usage || {};
		const tokens = (s.tokens || 0) + (u.input_tokens || 0) + (u.output_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
		save({...s, cost, costs, tokens, turns: (s.turns || 0) + (m.num_turns || 0), result: (m.result || '').slice(0, 4000)});
	}
}

function describeTool(b) {
	const i = b.input || {};
	const short = (x, n = 140) => String(x || '').replace(/\s+/g, ' ').slice(0, n);
	switch (b.name) {
		case 'Bash':
			return `$ ${short(i.description || i.command)}`;
		case 'Write':
			return `寫入 ${short(path.relative(ROOT, i.file_path || ''))}`;
		case 'Edit':
			return `修改 ${short(path.relative(ROOT, i.file_path || ''))}`;
		case 'Read':
			return `讀取 ${short(path.relative(ROOT, i.file_path || ''))}`;
		case 'WebSearch':
			return `搜尋 ${short(i.query)}`;
		case 'WebFetch':
			return `查證 ${short(i.url)}`;
		default:
			return `${b.name} ${short(JSON.stringify(i), 100)}`;
	}
}

function enqueue(id, prompt) {
	const s = load(id);
	save({...s, status: 'queued'});
	pushEvent(id, {kind: 'status', text: '排隊中'});
	queue.push({id, prompt});
	pump();
}
function pump() {
	while (procs.size < MAX_RUNNING && queue.length) {
		const {id, prompt} = queue.shift();
		const s = load(id);
		if (s.status !== 'queued') continue;
		startRun(s, prompt);
	}
}

// ── posters ─────────────────────────────────────────────────────────────────
function poster(s, cb) {
	const lang = Object.keys(videosOf(s))[0];
	if (!lang) return cb(null);
	const v = videoOf(s, lang);
	const p = path.join(dir(s.id), 'poster.jpg');
	if (fs.existsSync(p) && fs.statSync(p).mtimeMs >= fs.statSync(v).mtimeMs) return cb(p);
	execFile('ffmpeg', ['-v', 'error', '-y', '-ss', String(s.posterAt ?? 8), '-i', v, '-frames:v', '1', '-vf', 'scale=360:-1', '-q:v', '3', p], (err) => cb(err ? null : p));
}

// ── http ────────────────────────────────────────────────────────────────────
const send = (res, code, body, type = 'application/json; charset=utf-8') => {
	res.writeHead(code, {'content-type': type, 'cache-control': 'no-store'});
	res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};
const readBody = (req) =>
	new Promise((ok) => {
		let b = '';
		req.on('data', (d) => (b += d));
		req.on('end', () => {
			try {
				ok(JSON.parse(b || '{}'));
			} catch {
				ok({});
			}
		});
	});
const exists = (id) => /^[a-z0-9-]+$/.test(id) && fs.existsSync(path.join(dir(id), 'session.json'));

function streamFile(req, res, file, type) {
	const size = fs.statSync(file).size;
	const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
	if (range) {
		const start = range[1] ? +range[1] : 0;
		const end = range[2] ? +range[2] : size - 1;
		res.writeHead(206, {'content-type': type, 'content-range': `bytes ${start}-${end}/${size}`, 'accept-ranges': 'bytes', 'content-length': end - start + 1});
		fs.createReadStream(file, {start, end}).pipe(res);
	} else {
		res.writeHead(200, {'content-type': type, 'content-length': size, 'accept-ranges': 'bytes'});
		fs.createReadStream(file).pipe(res);
	}
}

http
	.createServer(async (req, res) => {
		const url = new URL(req.url, 'http://x');
		const p = url.pathname.split('/').filter(Boolean);
		try {
			if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) return send(res, 200, fs.readFileSync(path.join(HERE, 'index.html')), 'text/html; charset=utf-8');
			if (req.method === 'GET' && url.pathname === '/api/dice') {
				const used = new Set(all().map((s) => s.topic));
				const pool = TOPICS.filter((t) => !used.has(t));
				const list = pool.length ? pool : TOPICS;
				return send(res, 200, {topic: list[Math.floor(Math.random() * list.length)]});
			}
			if (req.method === 'GET' && url.pathname === '/api/sessions') return send(res, 200, all().map(view));
			if (req.method === 'POST' && url.pathname === '/api/sessions') {
				const {topic} = await readBody(req);
				const t = String(topic || '').trim().slice(0, 300);
				if (!t) return send(res, 400, {error: 'topic required'});
				const id = newId();
				fs.mkdirSync(dir(id), {recursive: true});
				const s = save({id, topic: t, createdAt: Date.now(), status: 'queued', revisions: []});
				enqueue(id, firstPrompt(s));
				return send(res, 201, view(load(id)));
			}
			if (p[0] === 'api' && p[1] === 'sessions' && p[2]) {
				const id = p[2];
				if (!exists(id)) return send(res, 404, {error: 'no such session'});
				if (req.method === 'GET' && !p[3]) return send(res, 200, {...view(load(id)), events: events(id), running: procs.has(id)});
				if (req.method === 'POST' && p[3] === 'revise') {
					const {feedback} = await readBody(req);
					const fb = String(feedback || '').trim().slice(0, 2000);
					const s = load(id);
					if (!fb) return send(res, 400, {error: 'feedback required'});
					if (procs.has(id) || s.status === 'queued') return send(res, 409, {error: 'still running'});
					if (s.legacy) return send(res, 409, {error: 'this film was made outside the studio and cannot be revised here'});
					save({...s, revisions: [...(s.revisions || []), {t: Date.now(), feedback: fb}]});
					pushEvent(id, {kind: 'user', text: fb});
					const prompt = s.claudeSession
						? revisePrompt(id, fb)
						: `${firstPrompt(s)}\n\nThe previous attempt was interrupted; continue from whatever exists in films/${id}/. Extra feedback: ${fb}`;
					enqueue(id, prompt);
					return send(res, 200, view(load(id)));
				}
				if (req.method === 'POST' && p[3] === 'cancel') {
					const c = procs.get(id);
					const s = load(id);
					if (s.status === 'queued') save({...s, status: 'cancelled'});
					if (c) {
						save({...s, status: 'cancelled'});
						c.kill('SIGTERM');
					}
					return send(res, 200, view(load(id)));
				}
			}
			if (req.method === 'GET' && p[0] === 'video' && p[1] && exists(p[1])) {
				const lang = p[2] || 'zh';
				if (!LANGS.includes(lang)) return send(res, 404, {error: 'no such language'});
				const v = videoOf(load(p[1]), lang);
				if (!fs.existsSync(v)) return send(res, 404, {error: 'no video yet'});
				return streamFile(req, res, v, 'video/mp4');
			}
			if (req.method === 'GET' && p[0] === 'poster' && p[1] && exists(p[1])) {
				return poster(load(p[1]), (f) => (f ? streamFile(req, res, f, 'image/jpeg') : send(res, 404, {error: 'no poster'})));
			}
			send(res, 404, {error: 'not found'});
		} catch (e) {
			send(res, 500, {error: String(e?.message || e)});
		}
	})
	.listen(PORT, HOST, () => console.log(`What-if Studio → http://${HOST}:${PORT}`));
