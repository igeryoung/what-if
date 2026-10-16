// node tools/render.mjs <id> [--lang zh,en]
//   → films/<id>/out/<lang>.mp4 for every language version of the film (or only those given with --lang),
//     plus films/<id>/out/<lang>_sheet.jpg (24 frames spread over the whole film) and films/<id>/out/<lang>_ends.jpg
//     (top row: the last 6 s ending on the very last frame, bottom row: the first 6 s from frame 0, 2 frames/s each;
//     the replay jumps from the top row's end to the bottom row's start). Prints duration and loudness of each file.
// Bundles once for all languages.
import {renderMedia} from '@remotion/renderer';
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {browserExecutable, langArg, openFilm, ROOT} from './film.mjs';

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
		concurrency: Math.min(12, os.availableParallelism()), // Remotion rejects more than the core count
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
	execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-vf', `fps=${(24 / +duration).toFixed(6)},scale=180:-1,tile=12x2`, '-frames:v', '1', sheet]);
	const ends = path.join(out, `${lang}_ends.jpg`);
	const N = composition.durationInFrames;
	const step = Math.round(composition.fps / 2);
	const pick = (frames) => `select='${frames.map((n) => `eq(n,${n})`).join('+')}',scale=180:-1,tile=12x1,setpts=0`;
	const last = Array.from({length: 12}, (_, k) => N - 1 - step * (11 - k)); // ends on the very last frame
	const first = Array.from({length: 12}, (_, k) => step * k); // starts on frame 0
	execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-filter_complex', `[0:v]split[x][y];[x]${pick(last)}[a];[y]${pick(first)}[b];[a][b]vstack`, '-frames:v', '1', ends]);
	const rel = (f) => path.relative(process.cwd(), f);
	console.log(`${rel(file)}  ${(+duration).toFixed(2)} s  ${loudness(file)}  sheet ${rel(sheet)}  ends ${rel(ends)}`);
}

/** Integrated loudness from ffmpeg's ebur128 summary (printed on stderr). */
function loudness(file) {
	const r = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'ebur128', '-f', 'null', '-'], {encoding: 'utf8'});
	const m = [...String(r.stderr).matchAll(/^\s+I:\s+(-?[\d.]+) LUFS/gm)].pop();
	return m ? `${m[1]} LUFS` : 'loudness ?';
}
