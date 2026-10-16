// node tools/thumb.mjs <id> [--lang zh,en]
//   → films/<id>/out/thumb_<lang>.jpg (1080×1920, the cover to upload) from films/<id>/thumb.tsx, rendered at the last
//     frame of composition <id>-thumb / <id>-thumb-en, plus films/<id>/out/thumb_small.jpg: every language side by side
//     at feed size (~240 px wide), to check the hook still reads when it is that small.
import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {browserExecutable, langArg, ROOT} from './film.mjs';

const MAX_BYTES = 2 * 1024 * 1024; // YouTube's limit for a custom thumbnail

const [langs, [id]] = langArg(process.argv.slice(2));
if (!id) {
	console.error('usage: node tools/thumb.mjs <id> [--lang zh,en]');
	process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(id) || !fs.existsSync(path.join(ROOT, 'films', id, 'thumb.tsx'))) throw new Error(`no films/${id}/thumb.tsx`);
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'engine/index.ts'), rootDir: ROOT});
const all = await getCompositions(serveUrl, {browserExecutable, logLevel: 'error'});
const prefix = `${id}-thumb`;
const versions = all
	.map((composition) => ({composition, lang: composition.id === prefix ? 'zh' : composition.id.startsWith(`${prefix}-`) ? composition.id.slice(prefix.length + 1) : null}))
	.filter((v) => v.lang && /^[a-z]{2}$/.test(v.lang) && (!langs || langs.includes(v.lang)))
	.sort((a, b) => (a.lang === 'zh' ? -1 : b.lang === 'zh' ? 1 : a.lang.localeCompare(b.lang)));
if (!versions.length) throw new Error(`no ${prefix} composition (does thumb.tsx export Thumb, and index.tsx export Video and TOTAL?)`);

const out = path.join(ROOT, 'films', id, 'out');
fs.mkdirSync(out, {recursive: true});
const files = [];
for (const {lang, composition} of versions) {
	const file = path.join(out, `thumb_${lang}.jpg`);
	await renderStill({serveUrl, composition, frame: composition.durationInFrames - 1, output: file, imageFormat: 'jpeg', jpegQuality: 92, browserExecutable, logLevel: 'error'});
	const size = fs.statSync(file).size;
	console.log('thumb', path.relative(process.cwd(), file), `${Math.round(size / 1024)} KB${size > MAX_BYTES ? '  ← over 2 MB, YouTube will reject it' : ''}`);
	files.push(file);
}
const small = path.join(out, 'thumb_small.jpg');
const ins = files.flatMap((f) => ['-i', f]);
const filter =
	files.length > 1
		? `${files.map((_, i) => `[${i}]scale=240:-1[s${i}]`).join(';')};${files.map((_, i) => `[s${i}]`).join('')}hstack=inputs=${files.length}`
		: '[0]scale=240:-1';
execFileSync('ffmpeg', ['-v', 'error', '-y', ...ins, '-filter_complex', filter, small]);
console.log('small', path.relative(process.cwd(), small));
