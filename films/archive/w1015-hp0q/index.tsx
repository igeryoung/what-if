import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {Lang} from '../../engine/kit/lang';
import {C} from '../../engine/kit/theme';
import {Aomori, End, Fluff, Hook, RainYear, Record, Rise, Twist} from './scenes';
import {dur, from, T, TOTAL} from './timeline';

export {TOTAL};
export const LANGS: Lang[] = ['zh', 'en'];

const SCENES: [keyof typeof T, React.FC][] = [
	['hook', Hook],
	['rain', RainYear],
	['fluff', Fluff],
	['rise', Rise],
	['aomori', Aomori],
	['record', Record],
	['twist', Twist],
	['end', End],
];

// No fade from black: frame 0 already shows the rainy street, and the ending melts back into it.
export const Video: React.FC = () => {
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 40%, #141A26 0%, #0C0D10 60%, #08090B 100%)'}} />
			{SCENES.map(([k, Comp]) => (
				<Sequence key={k} from={from(k)} durationInFrames={dur(k)} name={k}>
					<Comp />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
