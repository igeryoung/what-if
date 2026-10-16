// Shared by stills.mjs and render.mjs: bundle the project once and find a film's compositions (one per language).
import {bundle} from '@remotion/bundler';
import {getCompositions} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
// vendor/ holds a pinned headless Chrome; without it Remotion downloads its own on first use.
const vendorChrome = path.join(ROOT, 'vendor/chrome-headless-shell-linux64/chrome-headless-shell');
export const browserExecutable = fs.existsSync(vendorChrome) ? vendorChrome : null;

/** Bundles the project and returns {serveUrl, versions: [{lang, composition}]} for film `id`, Chinese first. */
export async function openFilm(id, langs) {
	if (!/^[a-z0-9-]+$/.test(id) || !fs.existsSync(path.join(ROOT, 'films', id, 'index.tsx'))) throw new Error(`no film films/${id}/index.tsx`);
	const serveUrl = await bundle({entryPoint: path.join(ROOT, 'engine/index.ts'), rootDir: ROOT});
	const all = await getCompositions(serveUrl, {browserExecutable, logLevel: 'error'});
	const versions = all
		.map((composition) => ({composition, lang: composition.id === id ? 'zh' : composition.id.startsWith(`${id}-`) ? composition.id.slice(id.length + 1) : null}))
		.filter((v) => v.lang && (v.lang === 'zh' || /^[a-z]{2}$/.test(v.lang)) && (!langs || langs.includes(v.lang)))
		.sort((a, b) => (a.lang === 'zh' ? -1 : b.lang === 'zh' ? 1 : a.lang.localeCompare(b.lang)));
	if (!versions.length) throw new Error(`film ${id} has no composition${langs ? ` for ${langs.join(',')}` : ''} (does index.tsx export Video and TOTAL?)`);
	return {serveUrl, versions};
}

/** Parses `--lang zh,en` out of argv; returns [langs|undefined, rest]. */
export function langArg(argv) {
	const i = argv.indexOf('--lang');
	if (i < 0) return [undefined, argv];
	return [argv[i + 1].split(','), [...argv.slice(0, i), ...argv.slice(i + 2)]];
}
