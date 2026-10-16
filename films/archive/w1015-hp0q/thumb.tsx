import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Line} from '../../engine/kit/kit';
import {useT} from '../../engine/kit/lang';
import {C} from '../../engine/kit/theme';
import {City, Flakes, Rain, WIDE} from './art';

// Cover: the hook's rainy Taipei street (same camera as frame 0), the rain turning to snowflakes as it falls.
// Asks the question and raises the stakes (how many floors?) without showing the snow pile or the answer.
const shadow = '0 6px 30px rgba(0,0,0,0.75)';

export const Thumb: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill>
			<City cam={WIDE} snow={0} />
			<AbsoluteFill style={{WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 38%, transparent 56%)', maskImage: 'linear-gradient(to bottom, #000 0%, #000 38%, transparent 56%)'}}>
				<Rain g={0} o={1} />
			</AbsoluteFill>
			<AbsoluteFill style={{WebkitMaskImage: 'linear-gradient(to bottom, transparent 36%, #000 54%)', maskImage: 'linear-gradient(to bottom, transparent 36%, #000 54%)'}}>
				<Flakes g={40} o={1} />
			</AbsoluteFill>
			<div style={{textShadow: shadow}}>
				<Line at={0} y={t(290, 330)} size={t(160, 124)} weight={900}>
					{t('如果台北\n一年的雨\n變成雪？', 'What if a year\nof Taipei’s rain\nfell as snow?')}
				</Line>
				<Line at={0} y={t(960, 860)} size={t(88, 76)} weight={900} color={C.amber}>
					{t('會堆到幾樓高？', 'How many floors high?')}
				</Line>
			</div>
		</AbsoluteFill>
	);
};
