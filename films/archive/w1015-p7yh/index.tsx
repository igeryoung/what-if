import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {Lang} from '../../engine/kit/lang';
import {C, s} from '../../engine/kit/theme';
import {Bard, End, Hook, Novel, Talk, TowerScene, Um} from './scenes';
import {T, TOTAL} from './timeline';

export {TOTAL};
export const LANGS: Lang[] = ['zh', 'en'];

const SCENES: [keyof typeof T, React.FC][] = [
	['hook', Hook],
	['talk', Talk],
	['novel', Novel],
	['bard', Bard],
	['tower', TowerScene],
	['um', Um],
	['end', End],
];

// No fade from black: frame 0 already shows the speech bubble, and the ending settles back into it.
export const Video: React.FC = () => {
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill
				style={{
					background: 'radial-gradient(120% 70% at 50% 40%, #171A20 0%, #0C0D10 60%, #08090B 100%)',
				}}
			/>
			{SCENES.map(([k, Comp]) => (
				<Sequence key={k} from={s(T[k][0])} durationInFrames={s(T[k][1]) - s(T[k][0])} name={k}>
					<Comp />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
