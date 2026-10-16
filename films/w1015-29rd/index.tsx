import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {Lang} from '../../engine/kit/lang';
import {C, s} from '../../engine/kit/theme';
import {Dna, End, Food, Hook, Lap, Litter, Push} from './scenes';
import {T, TOTAL} from './timeline';

export {TOTAL};
export const LANGS: Lang[] = ['zh', 'en'];

const SCENES: [keyof typeof T, React.FC][] = [
	['hook', Hook],
	['lap', Lap],
	['food', Food],
	['litter', Litter],
	['push', Push],
	['dna', Dna],
	['end', End],
];

export const BG = 'radial-gradient(120% 70% at 50% 40%, #1A1C22 0%, #0E0F12 60%, #08090B 100%)';

// No fade from black: frame 0 already shows the opening image, and the ending settles back into it.
export const Video: React.FC = () => {
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{background: BG}} />
			{SCENES.map(([k, Comp]) => (
				<Sequence key={k} from={s(T[k][0])} durationInFrames={s(T[k][1]) - s(T[k][0])} name={k}>
					<Comp />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
