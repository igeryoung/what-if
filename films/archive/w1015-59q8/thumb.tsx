import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Line} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, SANS, SANS_EN} from '../../engine/kit/theme';
import {Cam, World} from './art';

// Cover: the hook's 3-story cup beside the 3-story house, pearls ringed at the bottom, under the hook question.
// Teases the pearls (can you reach them?), never the answer (1 m with lungs, ~10 m with a vacuum).
// The cup + house are re-centred and scaled so the pearls sit above the feed's title overlay (bottom ~350 px).
const CAM: Cam = {wx: 608, wy: 1700, sx: 540, sy: 1560, z: 0.86};

export const Thumb: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 40%, #171A20 0%, #0C0D10 60%, #08090B 100%)'}}>
			<World cam={CAM} ring={1} />
			<div style={{position: 'absolute', left: 60, right: 60, top: t(330, 290), textAlign: 'center', whiteSpace: 'pre-wrap', fontFamily: useLang() === 'en' ? SANS_EN : SANS, fontWeight: 900, fontSize: t(150, 120), lineHeight: t(1.15, 1.08), color: C.ink}}>
				{t('如果手搖飲\n有3層樓高？', 'What if\nbubble tea\nwere 3\nstories tall?')}
			</div>
			<Line at={0} y={t(735, 840)} size={t(80, 68)} weight={800} color={C.amber}>
				{t('吸得到杯底的珍珠嗎？', 'Could you sip the pearls?')}
			</Line>
		</AbsoluteFill>
	);
};
