import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Line} from '../../engine/kit/kit';
import {useT} from '../../engine/kit/lang';
import {C} from '../../engine/kit/theme';
import {frontY, Robot, TaiwanMap} from './art';
import {TW_START} from './taiwan';

// Cover: the hook's dusty Taiwan with the robot parked at the north end (drawn big so it reads in the feed), a sliver
// already swept behind it. Asks the hook question and hints at the pyramid twist; never gives the 14,000 years.
export const Thumb: React.FC = () => {
	const t = useT();
	const top = 1120; // where the map's north tip sits
	const k = 1.3;
	const fy = frontY(0.025);
	const bx = 540 + (TW_START.x - 540) * k;
	const by = top + (fy - 960) * k;
	const R = 78;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 40%, #171A20 0%, #0C0D10 60%, #08090B 100%)'}}>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
				<g transform={`translate(540 ${top}) scale(${k}) translate(-540 -960)`}>
					<TaiwanMap id="th" clean={0.025} />
				</g>
				<circle cx={bx} cy={by} r={R * 1.45} fill="none" stroke={C.amber} strokeWidth={6} opacity={0.75} />
				<g transform={`translate(${bx} ${by}) rotate(90)`}>
					<Robot r={R} brush={20} />
				</g>
			</svg>
			<Line at={0} y={t(300, 290)} size={t(160, 124)} weight={900}>
				{t('如果讓\n掃地機器人\n掃完台灣？', 'What if a\nrobot vacuum\ncleaned all\nof Taiwan?')}
			</Line>
			<Line at={0} y={t(925, 930)} size={t(80, 68)} weight={800} color={C.amber}>
				{t('比金字塔還要久？', 'Longer than the pyramids?')}
			</Line>
		</AbsoluteFill>
	);
};
