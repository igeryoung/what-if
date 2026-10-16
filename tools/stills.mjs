// node tools/stills.mjs <id> sec1 sec2 … [--lang zh,en]
//   → films/<id>/out/stills/<lang>_<sec>.jpg (half size) and one contact sheet per language: films/<id>/out/stills/sheet_<lang>.jpg
// Bundles once and renders every language version of the film (or only those given with --lang).
import {renderStill} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {browserExecutable, langArg, openFilm, ROOT} from './film.mjs';

const [langs, [id, ...secs]] = langArg(process.argv.slice(2));
if (!id || !secs.length) {
	console.error('usage: node tools/stills.mjs <id> sec1 sec2 … [--lang zh,en]');
	process.exit(1);
}
const out = path.join(ROOT, 'films', id, 'out', 'stills');
fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(out, {recursive: true});
const {serveUrl, versions} = await openFilm(id, langs);
for (const {lang, composition} of versions) {
	const files = [];
	for (const s of secs) {
		const file = path.join(out, `${lang}_${s}.jpg`);
		const frame = Math.min(composition.durationInFrames - 1, Math.round(+s * composition.fps));
		await renderStill({serveUrl, composition, frame, output: file, imageFormat: 'jpeg', jpegQuality: 85, browserExecutable, scale: 0.5, logLevel: 'error'});
		files.push(file);
	}
	const sheet = path.join(out, `sheet_${lang}.jpg`);
	const ins = files.flatMap((f) => ['-i', f]);
	execFileSync('ffmpeg', ['-v', 'error', '-y', ...ins, '-filter_complex', files.length > 1 ? `hstack=inputs=${files.length}` : 'null', sheet]);
	console.log('sheet', path.relative(process.cwd(), sheet));
}
