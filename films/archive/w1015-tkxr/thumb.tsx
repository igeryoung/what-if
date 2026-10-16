import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Line} from '../../engine/kit/kit';
import {useT} from '../../engine/kit/lang';
import {C} from '../../engine/kit/theme';
import {HookArt} from './art';

// Cover: the hook's image (person and a cockroach as tall as them on the kitchen wall) under the hook question.
// Sells the premise, not the answer: no speed, no "you can't".
export const Thumb: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 40%, #1A1715 0%, #0D0C0E 60%, #08080A 100%)'}}>
			<AbsoluteFill style={{transform: `translateY(${t(150, 180)}px)`}}>
				<HookArt grow={1} f={0} />
			</AbsoluteFill>
			<Line at={0} y={300} size={t(156, 130)} weight={900}>
				{t('如果蟑螂\n跟人一樣大？', 'What if a\nroach were\nyour size?')}
			</Line>
			<Line at={0} y={t(720, 806)} size={t(80, 70)} weight={900} color={C.amber}>
				{t('你跑得掉嗎？', 'Could you outrun it?')}
			</Line>
		</AbsoluteFill>
	);
};
