import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Line} from '../../engine/kit/kit';
import {useT} from '../../engine/kit/lang';
import {C} from '../../engine/kit/theme';
import {HookArt} from './art';

// Cover: the hook's receipt in its glow, under the shortened hook question. The teaser asks how long it takes;
// it never gives the 90,000 years or the 4 days.
export const Thumb: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 40%, #171A20 0%, #0C0D10 60%, #08090B 100%)'}} />
			<HookArt />
			<Line at={0} y={t(320, 300)} size={t(176, 124)} weight={900}>
				{t<React.ReactNode>(
					<>
						如果靠發票
						<br />中<span style={{color: C.amber}}>千萬</span>？
					</>,
					<>
						What if you
						<br />
						won <span style={{color: C.amber}}>NT$10M</span>
						<br />
						with receipts?
					</>,
				)}
			</Line>
			<Line at={0} y={t(800, 800)} size={t(76, 72)} weight={700} color={C.amber}>
				{t('每天 3 張，要等多久？', 'How long at 3 a day?')}
			</Line>
		</AbsoluteFill>
	);
};
