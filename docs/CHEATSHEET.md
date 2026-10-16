# What-if cheat sheet

Everything needed to write one film. It replaces reading the reference films and `lib/` sources: don't `cat`
whole films or library files. If you need one specific technique, `grep -n` for it and `sed -n` just those lines.
Every token you read is re-sent on every later step of the session.

## Layout (run every command from the repo root)
```
films/<id>/      one film: index.tsx + scenes/art/timeline, thumb.tsx, score.py → score.wav, narration.json → mix_<lang>.wav, assets, meta.json, out/, session/
engine/          Root (registers films), kit/ (theme, kit, lang, globe), assets/ (NASA Earth textures)
tools/           stills.mjs, render.mjs, thumb.mjs, score.sh, voice.sh
docs/            BRIEF.md (the rules), this file, examples/ (two older full scores)
```
- `films/<id>/index.tsx` exporting `Video` + `TOTAL` (+ `LANGS`) is auto-registered: composition `<id>` is Chinese,
  `<id>-en` is English. Frames inside a version are identical; only `t()` text and sizes differ.
- `films/<id>/thumb.tsx` exporting `Thumb: React.FC` is registered as `<id>-thumb` / `<id>-thumb-en` (silent, 2 s, same
  languages as the film). Build it from the film's own art + `<Line at={0}>` text; see `films/archive/w1015-0dhj/thumb.tsx`.
- `films/<id>/score.wav` is added under every version by the engine, replaced per language by `mix_<lang>.wav` (narration over the ducked score, from `tools/voice.sh`). Don't put an `<Audio>` in the film.
- Assets: put files in the film folder and import them: `import land from './land.png'` gives a URL (png, jpg, svg, webp, wav, mp3).
- 1080×1920, 30 fps.

## Kit (`../../engine/kit/theme`, `kit`, `lang`, `globe`)
- `theme`: `FPS`=30, `W`, `H`, `s(sec)` → frames, fonts `SANS` (Noto Sans TC 400/700/900), `SANS_EN` (Inter 400/600/700/800/900),
  `NUM` (Inter, for numbers). `C` = `{bg #0C0D10, bg2 #15171C, ink #F4F1EC, dim #8C9099, faint #2A2D34, red #FF3B30,
  redDeep #B3161C, green #34C77B, amber #FFB020}`. `BEAT` (15 f) belongs to the CPR film; define your own tempo in `timeline.ts`.
- `lang`: `const t = useT()` then `t('中文', 'English')` or `t(96, 80)` picks the value for the version being rendered;
  `useLang()` returns `'zh' | 'en'`. Both are hooks: call them at the top of a component.
- `kit`: `clamp` (interpolate options), `useIn(at, damping=18, mass=.7)` spring 0→1 from local frame `at`,
  `useOut(end, len=8)` 1→0 over the frames before `end`,
  `<Line at y size=72 weight=700 color font out tracking align='center' x lift=36>` absolutely positioned text, `top=y`,
  60 px side margins, rises + fades in, font follows the language; `<Count from to at dur decimals>` count-up;
  `<Pill>` (font follows the language); `<Num size color>`.
- `globe`: `<Globe size t state={{rot, flat, drain, bands, clouds, equator, tilt?}} />` NASA Blue Marble on canvas
  (credit NASA). Night-lights variant: `films/blackout/nightglobe.tsx`.

## Film skeleton
`timeline.ts`
```ts
import {s} from '../../engine/kit/theme';

// 120 BPM 4/4 → bar = 2 s. Every cut is on a bar line; keep in sync with score.py.
export const T = {
	hook: [0, 6],
	beat1: [6, 16],
	end: [16, 24], // payoff 16.3, closing line 18.6–20.5, button 21, ring and settle to 24 (docs/BRIEF.md "Ending")
} as const;

export const TOTAL = s(T.end[1]);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);
```
`index.tsx`
```tsx
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {Lang} from '../../engine/kit/lang';
import {C, s} from '../../engine/kit/theme';
import {Beat1, End, Hook} from './scenes';
import {T, TOTAL} from './timeline';

export {TOTAL};
export const LANGS: Lang[] = ['zh', 'en'];

const SCENES: [keyof typeof T, React.FC][] = [
	['hook', Hook],
	['beat1', Beat1],
	['end', End],
];

// No fade from black: frame 0 already shows the opening image, and the ending settles back into it.
export const Video: React.FC = () => {
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 40%, #171A20 0%, #0C0D10 60%, #08090B 100%)'}} />
			{SCENES.map(([k, Comp]) => (
				<Sequence key={k} from={s(T[k][0])} durationInFrames={s(T[k][1]) - s(T[k][0])} name={k}>
					<Comp />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
```
`scenes.tsx` (frames inside a scene are local: 0 = scene start)
```tsx
import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Line, useIn, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, NUM, SANS, SANS_EN} from '../../engine/kit/theme';
import {dur} from './timeline';

// Fades the whole scene out over its last `fade` frames.
const Exit: React.FC<{len: number; fade?: number; children: React.ReactNode}> = ({len, fade = 10, children}) => (
	<AbsoluteFill style={{opacity: useOut(len, fade)}}>{children}</AbsoluteFill>
);
const Kicker: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => (
	<Line at={at} y={y} size={40} weight={700} color={C.amber} tracking={6} lift={14}>
		{children}
	</Line>
);
const Note: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => (
	<Line at={at} y={y} size={32} weight={400} color={C.dim} lift={10}>
		{children}
	</Line>
);
const N: React.FC<{size: number; color?: string; children: React.ReactNode}> = ({size, color = C.ink, children}) => (
	<span style={{fontFamily: NUM, fontWeight: 900, fontSize: size, color, letterSpacing: -size * 0.03, fontVariantNumeric: 'tabular-nums'}}>{children}</span>
);
// The opening image. Hook shows it from frame 0 (no fade-in); End brings it back so the replay is seamless.
const HookArt: React.FC = () => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
		<circle cx={540} cy={1120} r={180} fill={C.green} />
	</svg>
);
const Z: React.FC<{size: number; color?: string; weight?: number; children: React.ReactNode}> = ({size, color = C.ink, weight = 900, children}) => (
	<span style={{fontFamily: useLang() === 'en' ? SANS_EN : SANS, fontWeight: weight, fontSize: size, color}}>{children}</span>
);

export const Hook: React.FC = () => {
	const t = useT();
	return (
		<Exit len={dur('hook')}>
			<HookArt />
			<Line at={10} y={560} size={72} color={C.dim}>
				{t('如果……', 'What if…')}
			</Line>
			<Line at={30} y={670} size={t(110, 96)} weight={900}>
				{t('會怎樣？', 'what would happen?')}
			</Line>
		</Exit>
	);
};

// One number per screen: kicker → number pops in → source note. Slow camera push on the whole scene.
export const Beat1: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame: f - 20, fps, config: {damping: 12, mass: 0.6, stiffness: 180}});
	const zoom = interpolate(f, [0, dur('beat1')], [1, 1.06], {...clamp, easing: Easing.inOut(Easing.cubic)});
	return (
		<Exit len={dur('beat1')}>
			<AbsoluteFill style={{transform: `scale(${zoom})`}}>
				<Kicker at={0} y={420}>
					{t('小標題', 'KICKER')}
				</Kicker>
				<div style={{position: 'absolute', top: 620, left: 0, right: 0, textAlign: 'center', opacity: Math.min(1, pop * 1.4), transform: `scale(${1.25 - 0.25 * pop})`}}>
					<N size={220} color={C.amber}>
						27
					</N>
					<Z size={t(110, 90)}>{t(' 年', ' years')}</Z>
				</div>
				<Note at={60} y={1000}>
					{t('出處 · 年份', 'Source · year')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// The ending: the opening image comes back, the payoff answers the hook in headline size, the closing line lands
// under it (frame 78 = 18.6 s, when narration.json says it), the button hits at 21 s. The text is fully gone 6 frames before the end
// (`useOut` eases, so ending the fade on the last frame leaves a ghost), so the final frames are the hook's frame 0.
// No fade to black.
export const End: React.FC = () => {
	const t = useT();
	const D = dur('end');
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: useIn(0)}}>
				<HookArt />
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: useOut(D - 6, 20)}}>
				<Line at={8} y={420} size={t(110, 96)} weight={900}>
					{t('答案一句話', 'The answer, in one line.')}
				</Line>
				<Line at={78} y={720} size={t(68, 64)} weight={900} color={C.amber}>
					{t('收尾的一句', 'The closing line.')}
				</Line>
				<div style={{position: 'absolute', left: 60, right: 60, top: 1360, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontSize: 32, lineHeight: 1.6, color: C.dim, opacity: useIn(60)}}>
					{t('資料：來源 A · 來源 B', 'Data: Source A · Source B')}
					<br />
					{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music samples: VSCO 2 CE, VCSL (CC0)')}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
```

## Techniques in the finished films (look up only what you need)
| Need | Where |
|---|---|
| Keyframed camera (y / zoom over time) | `films/blackout/index.tsx` `cam(t)`: `interpolate(t, keys, values, {easing: Easing.inOut(Easing.cubic), ...clamp})` |
| Zoom across scales (mm → Moon), log camera | `films/paper/world.tsx` `World`, `films/paper/timeline.ts` `foldsAt` |
| Thousands of moving particles on canvas, seeded `rng` | `films/ants/art.tsx` `Swarm`, `rng` |
| Load an image to pixels (`delayRender`/`continueRender`) | `films/ants/scenes.tsx` `loadLand` / `WorldDots` |
| Balance scale, world dot map, count-up to huge numbers | `films/ants/scenes.tsx` `Scale`, `Where`, `Count` |
| Story clock / hour counter | `films/blackout/index.tsx` `CLOCK`, `Clock` |
| SVG icons: traffic light, elevator, train, tower, battery, card, cash, fridge, tap, hospital, generator, house, torch, power bank, water | `films/blackout/icons.tsx` |
| Moon, sun, stars, eye, sleeper, dolphin | `films/w1014-sxd5/art.tsx` |
| Person with hair, hair-curtain path | `films/w1013-s1h5/art.tsx` |
| Person, bird, elephant, whale, big ant | `films/ants/art.tsx` |
| Glow without CSS blur (static SVG `<filter>`) | `films/paper/world.tsx` `pp-glow` |

These older films are Chinese-only: their text isn't wrapped in `t()` yet.

## Layout rules
- Text inside y≈200–1500; keep the right ~120 px clear (platform UI). `Line` already keeps 60 px side margins.
- Sizes: headline 84–120, body 52–72, kicker 40, notes and credits 32 (never smaller), in both languages.
- One idea per screen; hold lines ~6–8 Chinese chars per second, which is also enough for ~3 English words per second.
- English is up to ~1.8× wider: use `t(zhSize, enSize)` and check the English stills for wraps and clipping.
- Credits on the end card inside y ≤ 1500, 32 px. (The ants end card puts 26 px credits at y 1560; don't copy that.)

## Remotion pitfalls
- `interpolate` input ranges must be strictly increasing. A computed range like `[a, b]` with `b <= a` crashes the
  render ("inputRange must be strictly monotonically increasing"); this broke stills in w1013.
- Never animate CSS `filter: blur()`. Static SVG `<filter>`/`feGaussianBlur` is fine.
- No `Math.random()`: use a seeded `rng` (frames render in parallel and must be deterministic).
- `useIn`, `useOut`, `useT`, `useLang` are hooks: call them unconditionally (not inside `if`, or in loops whose length changes).

## Music (`films/<id>/score.py`)
Skeleton (cuts in the docstring must match `timeline.ts`):
```python
"""Score for <title>. 120 BPM 4/4 → beat 0.5 s, bar 2 s. Cuts (= timeline.ts): 0 6 16 24."""
import sys, os
import numpy as np, soundfile as sf

LIB = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'lib'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add

S.seed(11)
DUR, BEAT, BAR = 24.0, 0.5, 2.0
E = []                                          # note events
bus = np.zeros((int(DUR * SR), 2), np.float32)  # sfx bus

CH = {  # bass root (contrabass range F#1–B3), pad triad
    'Am': ('A1', ['C4', 'E4', 'A4']),
    'F': ('F2', ['C4', 'F4', 'A4']),
    'C': ('C2', ['C4', 'E4', 'G4']),
    'G': ('G1', ['D4', 'G4', 'B4']),
}


def pad(t, ch, d, vel=.3, inst='violas', gain=.5):
    for i, p in enumerate(CH[ch][1]):
        E.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=vel, pan=(-.4, 0, .4)[i], attack=.5, gain=gain))


def low(t, ch, d, vel=.45):
    E.append(dict(t=t, inst='contrabass', pitch=CH[ch][0], dur=d, vel=vel, pan=.1, attack=.2, gain=.6))


def hit(t, v=1.0):  # put these on scene cuts
    E.append((t, 'timpani', 'A2', 2.0, .9 * v, 0, .9))
    E.append((t, 'gran_cassa', None, None, .8 * v, 0, .8))


prog = ['Am', 'F', 'C', 'G']
for i in range(int(16 / BAR)):                  # hook + beats; bar 7 is G, so 16 s lands as a G → Am cadence
    t = i * BAR
    ch = prog[i % 4]
    pad(t, ch, BAR + .2)
    low(t, ch, BAR + .1)
    for b in range(4):
        E.append((t + b * BEAT, 'marimba', CH[ch][1][b % 3], .4, .4, (-.3, .3)[b % 2], .35))
for t in (6, 16):
    hit(t, .7)
add(bus, X.whoosh(1.0, .6), 15.0, .5)  # riser: starts ~1 s before the cut it lands on
# ending (16–24): the cadence lands on the payoff and rings under the closing line (18.6–20.5); the button lands
# on its last word (21), then the Am rings out to the cut. No pickup bar.
pad(16, 'Am', 5.0, vel=.35)
low(16, 'Am', 5.0, vel=.5)
E.append((16.0, 'tubular_bells', 'A4', 5.0, .4, 0, .4))
hit(21.0, .75)
E.append((21.0, 'contrabass_pizz', 'A1', .6, .65, .1, .75))
for k, p in enumerate(['A3', 'C4', 'E4', 'A4']):
    E.append((21.0 + k * .012, 'violins_pizz', p, .4, .5, (-.3, -.1, .1, .3)[k], .4))
for k, p in enumerate(['A5', 'A6']):
    E.append((21.0, 'glockenspiel', p, 1.5, .42, (-.2, .2)[k], .33))

mix = S.render(E, dur=DUR, master=False)
mix = S.room(mix, size=.6, mix=.22)
n = min(len(mix), len(bus))
mix = mix[:n] + bus[:n]
f = int(0.3 * SR)
mix[-f:] *= np.linspace(1, 0, f)[:, None]  # 0.3 s declick only: the button is the ending, not a fade
mix = mix / max(1e-9, np.abs(mix).max()) * .9  # tools/score.sh sets loudness and true peak
out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
sf.write(out, mix.astype(np.float32), SR)
print('wrote', out, f'{n / SR:.2f}s', sorted({e['inst'] if isinstance(e, dict) else e[1] for e in E}))
```
API (`S` = sampler, `X` = sfx):
- Events: tuple `(t, inst, pitch, dur, vel, pan, gain)` or `dict(t=, inst=, pitch=, dur=, vel=, pan=, gain=, attack=, release=)`.
  `pan` −1..1 (automate panning by varying it per event). For unpitched percussion `pitch` is a variant name or `None`, `dur` `None`.
- `S.render(E, dur=, master=False)` → stereo (N,2); `S.room(x, size=0..1, mix=)` reverb; `S.note(inst, pitch, dur, vel, attack=)`,
  `S.hit(inst, variant, vel)`, `S.chord(inst, pitches, dur, vel, strum=)` return mono arrays; `S.seed(n)`.
- `add(bus, mono, at_sec, gain, pan)` mixes a mono array into a stereo buffer.
- SFX (mono): `X.whoosh(d, v)`, `X.rumble(d, v)`, `X.ignite(v)`, `X.roar(d, v)`, `X.heartbeat(v)`, `X.thump(v, f)`,
  `X.ding(v)`, `X.pop(v)`, `X.step(v)`, `X.creak(v)`, `X.quindar(v)`, `X.click(p, v)` / `X.clack(p, v)` / `X.crash(v)` (plastic blocks, not cymbals),
  `X.radio(x)` (walkie-talkie filter).
- Notes outside an instrument's range get transposed far and sound wrong; stay inside these ranges.

Installed instruments (sustained unless noted; `dec` = decaying):
- Strings: `violins` G3–D6, `violins_trem`, `violins_pizz`/`violins_spic` (dec), `violin` G3–C7 (solo), `violas` C3–D6 (+`_pizz`),
  `cellos` C2–F5 (+`_pizz`, `_spic`), `contrabass` F#1–B3 (+`_pizz`), `harp` D#1–F7 (dec).
- Woodwinds: `flute` C4–C7, `piccolo` G5–G7, `clarinet` D3–F#6, `oboe` A#3–F6, `bassoon` A#1–D#5 (each has `_stac` except piccolo),
  `recorder` F4–E6, `ocarina` A4–C#6, `tenor_sax` A#2–D6, `harmonica` C3–C7.
- Brass: `trumpet` F3–C6 (+`_stac`, `_mute`), `horn` G#1–F5, `trombone` A#1–F4, `tuba` E1–D4 (each +`_stac`).
- Keys & mallets (dec): `upright` C1–G7 (use this for piano), `honky_tonk`, `harpsichord`, `glockenspiel` G5–C8,
  `xylophone` G4–C8, `marimba` F2–C7, `vibraphone` F3–E6 (+`_hard`; `vibraphone_bowed` sustained), `tubular_bells` C4–E5,
  `hand_chimes` C4–C7, `kalimba` F3–C#5, `mbira`, `hang` A3–D5, `glass` A#4–F6. Sustained: `organ`, `organ_soft`, `organ_pedal`, `accordion`.
- Plucked (dec): `guitar_nylon` G1–C6, `ukulele`, `electric_guitar`, `electric_bass` E1–D#2, `strumstick`, `dan_tranh` (+`_trem`). `bagpipe`.
- Percussion (variant names): `timpani` F2–F#3 (`drum1`–`drum5`), `gran_cassa` (`hit roll roll_fast cresc rub`), `bass_drum`,
  `snare` (`on off roll roll_off`), `snare2`, `toms` (`high low high_mallet low_mallet roll`), `crash`, `clash` (`crash short`),
  `sus_cymbal` (`hit stick bell roll cresc bow scrape`), `gong`, `gong2` (`big small scrape`), `triangle` (`open muted semi roll`),
  `woodblock` (`a b c`), `tambourine`, `claves`, `cowbell`, `sleighbells`, `log_drum` (`hi lo`), `frame_drum`, `hihat` (`closed open loose pedal`),
  `cajon`, `conga`, `claps` (`group solo`), `shaker`, `nepal_bells`, `world_perc`, `drum_kit`.
- Not installed: `piano`, `alto_sax`, `jazz_bass`, `erhu`, `erhu_stac`.
- Credit lines: `音樂採樣：VSCO 2 CE、VCSL（CC0）` / `Music samples: VSCO 2 CE, VCSL (CC0)` (or print `S.credits(names)`).

## Tools (from the repo root)
- `npx tsc -p .` type-checks everything.
- `node tools/stills.mjs <id> 2 9 17 …` renders half-size frames of every language version into `films/<id>/out/stills/`
  and one contact sheet per language: `sheet_zh.jpg`, `sheet_en.jpg`. It bundles once per call, so pass every second in
  one call (`--lang en` renders one language only). Read the sheets first; open a single `<lang>_<sec>.jpg` only to inspect a problem.
- `sh tools/score.sh <id>` renders `films/<id>/score.py` and normalizes it in two passes to `films/<id>/score.wav`.
  It prints the result; expect `I: -14.1 LUFS` and `Peak: -1.5 dBFS`. Don't hand-roll loudnorm.
- `sh tools/voice.sh <id> [--lang zh]` reads `films/<id>/narration.json`, fetches the voices (cached in `films/<id>/voice/`),
  prints one cue table per language (start, length, end, room before the next line) and writes `films/<id>/mix_zh.wav` /
  `mix_en.wav` at −14 LUFS. It exits 1 without writing a language whose lines overlap. Needs the network.
- `node tools/render.mjs <id>` writes `films/<id>/out/zh.mp4` and `en.mp4` (one bundle for both), prints duration and
  loudness, and writes `out/<lang>_sheet.jpg` (24 frames over the whole film) and `out/<lang>_ends.jpg` (top row: the last
  6 s, bottom row: the first 6 s, 2 frames/s; check the ending holds and its last frame matches the first). `--lang en`
  renders one language only.
- `node tools/thumb.mjs <id>` renders the last frame of `<id>-thumb` / `<id>-thumb-en` to `films/<id>/out/thumb_zh.jpg`
  and `thumb_en.jpg` (1080×1920, warns over YouTube's 2 MB), plus `thumb_small.jpg` (all languages at feed size, 240 px wide).
  Takes a few seconds; it doesn't touch the mp4s.
- Python for ad-hoc audio checks: `lib/.venv/bin/python -I` (numpy, scipy, soundfile). Don't use the system `python3`.
