import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Line} from '../../engine/kit/kit';
import {useT} from '../../engine/kit/lang';
import {C} from '../../engine/kit/theme';
import {Lego101, LEGO_BASE_Y} from './art';

// Cover: the hook's LEGO Taipei 101 with its bottom 2×2 brick lit, under the hook question.
// Asks whether that brick holds; never says it does (no 3.5 km, no 7×).
const SCALE = 0.82;
const BASE_Y = 1500; // keeps the red brick above the feed's title overlay

export const Thumb: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 40%, #171A20 0%, #0C0D10 60%, #08090B 100%)'}}>
			<AbsoluteFill style={{transform: `translateY(${BASE_Y - LEGO_BASE_Y}px) scale(${SCALE})`, transformOrigin: `540px ${LEGO_BASE_Y}px`}}>
				<Lego101 ring={0.3} heroGlow={1} />
			</AbsoluteFill>
			<Line at={0} y={t(300, 280)} size={t(170, 124)} weight={900}>
				{t('如果用樂高\n蓋 101？', 'What if\nTaipei 101\nwere LEGO?')}
			</Line>
			<Line at={0} y={t(760, 770)} size={t(76, 68)} weight={700} color={C.amber}>
				{t('最底下那塊撐得住嗎？', 'Can the bottom brick hold?')}
			</Line>
		</AbsoluteFill>
	);
};
