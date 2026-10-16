// Local copy of tools/render.mjs (concurrency capped at the core count). node films/w1015-0dhj/render.mjs <id> [--lang zh,en]
//   → films/<id>/out/<lang>.mp4 for every language version of the film (or only those given with --lang),
//     plus films/<id>/out/<lang>_sheet.jpg (a frame every 2.5 s). Prints duration and loudness of each file.
// Bundles once for all languages.
import {renderMedia} from '@remotion/renderer';
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {browserExecutable, langArg, openFilm, ROOT} from '../../tools/film.mjs';

const [langs, [id]] = langArg(process.argv.slice(2));
if (!id) {
	console.error('usage: node tools/render.mjs <id> [--lang zh,en]');
	process.exit(1);
}
const out = path.join(ROOT, 'films', id, 'out');
fs.mkdirSync(out, {recursive: true});
const {serveUrl, versions} = await openFilm(id, langs);
for (const {lang, composition} of versions) {
	const file = path.join(out, `${lang}.mp4`);
	let shown = -1;
	await renderMedia({
		serveUrl,
		composition,
		inputProps: {lang},
		codec: 'h264',
		crf: 16,
		x264Preset: 'slow',
		pixelFormat: 'yuv420p',
		audioCodec: 'aac',
		audioBitrate: '320k',
		concurrency: Math.min(12, os.availableParallelism()),
		browserExecutable,
		logLevel: 'error',
		outputLocation: file,
		onProgress: ({progress}) => {
			const q = Math.floor(progress * 4);
			if (q > shown) {
				shown = q;
				console.log(`${lang}: ${q * 25}%`);
			}
		},
	});
	const duration = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim();
	const sheet = path.join(out, `${lang}_sheet.jpg`);
	execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-vf', 'fps=1/2.5,scale=180:-1,tile=12x2', '-frames:v', '1', sheet]);
	console.log(`${path.relative(process.cwd(), file)}  ${(+duration).toFixed(2)} s  ${loudness(file)}  sheet ${path.relative(process.cwd(), sheet)}`);
}

/** Integrated loudness from ffmpeg's ebur128 summary (printed on stderr). */
function loudness(file) {
	const r = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'ebur128', '-f', 'null', '-'], {encoding: 'utf8'});
	const m = [...String(r.stderr).matchAll(/^\s+I:\s+(-?[\d.]+) LUFS/gm)].pop();
	return m ? `${m[1]} LUFS` : 'loudness ?';
}
