import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Line} from '../../engine/kit/kit';
import {useT} from '../../engine/kit/lang';
import {C} from '../../engine/kit/theme';
import {Bubble, BUBBLE} from './art';

// Cover: the hook's typing bubble under the hook question. Teases the Shakespeare twist, never the 4,300-novel answer.
export const Thumb: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 40%, #171A20 0%, #0C0D10 60%, #08090B 100%)'}} />
			{/* g = 6: the first dot is mid-bounce, so the bubble reads as "someone is typing" */}
			<Bubble g={6} y={1300 - BUBBLE.cy} scale={1.1} />
			<Line at={0} y={t(300, 290)} size={t(164, 124)} weight={900}>
				{t('如果把\n一生的話\n印成書？', 'What if\nevery word\nyou said\ngot printed?')}
			</Line>
			<Line at={0} y={t(975, 950)} size={t(80, 70)} weight={700} color={C.amber}>
				{t('會比莎士比亞還多嗎？', 'More than Shakespeare?')}
			</Line>
		</AbsoluteFill>
	);
};
