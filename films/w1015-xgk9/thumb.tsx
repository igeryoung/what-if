import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Line} from '../../engine/kit/kit';
import {useT} from '../../engine/kit/lang';
import {C} from '../../engine/kit/theme';
import {BG, HookArt} from './art';

// Cover: the hook's eye, just starting a blink, under the hook question. Teases, doesn't answer.
export const Thumb: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{background: BG}} />
			<HookArt lid={0.18} look={-0.15} />
			<Line at={0} y={t(300, 290)} size={t(152, 124)} weight={900}>
				{t('如果一輩子的\n眨眼加起來？', 'What if\nyou added up\nevery blink?')}
			</Line>
			<Line at={0} y={t(720, 820)} size={t(76, 68)} weight={700} color={C.amber}>
				{t('比你想的還要久？', 'Longer than you think?')}
			</Line>
		</AbsoluteFill>
	);
};
