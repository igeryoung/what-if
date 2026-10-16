import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Line} from '../../engine/kit/kit';
import {useT} from '../../engine/kit/lang';
import {C} from '../../engine/kit/theme';
import {HOOK, HookArt} from './art';
import {BG} from './index';

// Cover: the hook's giant face and paw, the mug already teetering on the table edge. Sells the question, not the answer.
export const Thumb: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: BG}}>
			<HookArt pawX={800} mug={{x: 960, base: HOOK.mugBase, rot: 8}} look={[26, 12]} />
			<Line at={0} y={t(300, 300)} size={t(160, 124)} weight={900}>
				{t('如果貓跟\n老虎一樣大？', 'What if\nyour cat was\ntiger-sized?')}
			</Line>
			<Line at={0} y={t(740, 790)} size={t(76, 72)} weight={700} color={C.amber}>
				{t('你的杯子還保得住嗎？', 'Is your mug safe?')}
			</Line>
		</AbsoluteFill>
	);
};
