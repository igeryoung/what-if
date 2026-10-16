import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Line} from '../../engine/kit/kit';
import {useT} from '../../engine/kit/lang';
import {C} from '../../engine/kit/theme';
import {P, Party, PARTY} from './art';

const SC = 0.85; // the party, scaled from the bottom centre so the hat clears the teaser
const TABLE_Y = 1920 - (1920 - PARTY.tableY) * SC;

// Cover: the hook's birthday Lab with its single candle, under the hook question. Asks, doesn't answer.
export const Thumb: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 45%, #1D1813 0%, #0E0D0E 60%, #09090A 100%)'}}>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
				<rect x={0} y={TABLE_Y} width={1080} height={1920 - TABLE_Y} fill={P.table} />
				<rect x={0} y={TABLE_Y} width={1080} height={5} fill={P.tableEdge} />
			</svg>
			<AbsoluteFill style={{transform: `scale(${SC})`, transformOrigin: '50% 100%'}}>
				<Party tick={0} n={1} />
			</AbsoluteFill>
			<Line at={0} y={t(290, 300)} size={t(156, 124)} weight={900}>
				{t('如果狗用\n狗年齡\n過生日？', 'What if dogs\nhad birthdays\nin dog years?')}
			</Line>
			<Line at={0} y={t(895, 810)} size={t(78, 72)} weight={800} color={C.amber}>
				{t('要插幾根蠟燭？', 'How many candles?')}
			</Line>
		</AbsoluteFill>
	);
};
