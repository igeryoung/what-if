import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import type {Lang} from '../../engine/kit/lang';
import {C, FPS, s} from '../../engine/kit/theme';
import {BagArt, BagText, BottomArt, BottomText, DarkArt, DarkText, EndText, EverestArt, EverestText, HookText, LimitArt, LimitText, TitanicArt, TitanicText} from './scenes';
import {camAt, T, TOTAL} from './timeline';
import {Hud, World} from './world';

export {TOTAL};
export const LANGS: Lang[] = ['zh', 'en'];

// [scene, art under the camera (or null), text on top]
const SCENES: [keyof typeof T, React.FC | null, React.FC][] = [
	['hook', null, HookText],
	['limit', LimitArt, LimitText],
	['dark', DarkArt, DarkText],
	['titanic', TitanicArt, TitanicText],
	['everest', EverestArt, EverestText],
	['bottom', BottomArt, BottomText],
	['bag', BagArt, BagText],
	['end', null, EndText],
];

const at = (k: keyof typeof T) => ({from: s(T[k][0]), durationInFrames: s(T[k][1]) - s(T[k][0])});

// One continuous dive: the world layer (water, phone, seabed) is a pure function of film time, so the ending can
// rewind it to exactly frame 0. No fade from black and no fade to black.
export const Video: React.FC = () => {
	const sec = useCurrentFrame() / FPS;
	const cam = camAt(sec);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{transform: `scale(${cam.z})`, transformOrigin: `${cam.x}px ${cam.y}px`}}>
				<World sec={sec} />
				{SCENES.map(([k, Art]) =>
					Art ? (
						<Sequence key={k} {...at(k)} name={`${k}-art`}>
							<Art />
						</Sequence>
					) : null,
				)}
			</AbsoluteFill>
			<Hud sec={sec} />
			{SCENES.map(([k, , Text]) => (
				<Sequence key={k} {...at(k)} name={k}>
					<Text />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
