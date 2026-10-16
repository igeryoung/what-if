import React from 'react';
import {Audio, Composition} from 'remotion';
import {type Lang, LangProvider} from './kit/lang';
import {FPS, H, W} from './kit/theme';

// Every films/<id>/index.tsx that exports {Video, TOTAL} becomes composition <id> (Chinese). If it also exports
// LANGS containing 'en', it becomes <id>-en too. films/<id>/score.wav, when present, is the soundtrack of every version,
// unless films/<id>/mix_<lang>.wav (narration over the ducked score, from tools/voice.sh) exists for that language.
// films/<id>/thumb.tsx exporting Thumb becomes <id>-thumb (+ <id>-thumb-en): the cover image, a silent 2 s composition
// whose last frame tools/thumb.mjs renders (so kit animations have settled).
type Film = {Video?: React.FC; TOTAL?: number; LANGS?: Lang[]};
type Context = {keys(): string[]; (k: string): unknown};
declare const require: {context: (dir: string, deep: boolean, re: RegExp) => Context};
const films = require.context('../films', true, /^\.\/[a-z0-9-]+\/index\.tsx$/);
const scores = require.context('../films', true, /^\.\/[a-z0-9-]+\/score\.wav$/);
const mixes = require.context('../films', true, /^\.\/[a-z0-9-]+\/mix_[a-z]{2}\.wav$/);
const thumbs = require.context('../films', true, /^\.\/[a-z0-9-]+\/thumb\.tsx$/);

const idOf = (k: string) => k.split('/')[1];
const urlOf = (m: unknown) => (typeof m === 'string' ? m : (m as {default: string}).default);
const SCORE = new Map(scores.keys().map((k) => [idOf(k), urlOf(scores(k))]));
const MIX = new Map(mixes.keys().map((k) => [`${idOf(k)}:${k.slice(-6, -4)}`, urlOf(mixes(k))])); // './<id>/mix_en.wav' → '<id>:en'
const THUMB = new Map(thumbs.keys().map((k) => [idOf(k), (thumbs(k) as {Thumb?: React.FC}).Thumb]));
const THUMB_FRAMES = 2 * FPS;

const FILMS = films
	.keys()
	.map((k) => ({id: idOf(k), m: films(k) as Film}))
	.filter(({m}) => m.Video && (m.TOTAL ?? 0) > 0)
	.map(({id, m}) => {
		const Video = m.Video!;
		const score = SCORE.get(id);
		const Version: React.FC<{lang: Lang}> = ({lang}) => {
			const audio = MIX.get(`${id}:${lang}`) ?? score;
			return (
				<LangProvider lang={lang}>
					<Video />
					{audio && <Audio src={audio} />}
				</LangProvider>
			);
		};
		const Thumb = THUMB.get(id);
		const Cover: React.FC<{lang: Lang}> | null = Thumb
			? ({lang}) => (
					<LangProvider lang={lang}>
						<Thumb />
					</LangProvider>
				)
			: null;
		return {id, total: m.TOTAL!, langs: m.LANGS ?? (['zh'] as Lang[]), Version, Cover};
	});

export const Root: React.FC = () => (
	<>
		{FILMS.flatMap(({id, total, langs, Version}) =>
			langs.map((lang) => (
				<Composition key={`${id}:${lang}`} id={lang === 'zh' ? id : `${id}-${lang}`} component={Version} defaultProps={{lang}} durationInFrames={total} fps={FPS} width={W} height={H} />
			)),
		)}
		{FILMS.flatMap(({id, langs, Cover}) =>
			Cover
				? langs.map((lang) => (
						<Composition key={`${id}:thumb:${lang}`} id={lang === 'zh' ? `${id}-thumb` : `${id}-thumb-${lang}`} component={Cover} defaultProps={{lang}} durationInFrames={THUMB_FRAMES} fps={FPS} width={W} height={H} />
					))
				: [],
		)}
	</>
);
