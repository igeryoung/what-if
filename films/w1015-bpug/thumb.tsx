import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Line} from '../../engine/kit/kit';
import {useT} from '../../engine/kit/lang';
import {C} from '../../engine/kit/theme';
import {Baseball, BG, Drop, Streaks} from './art';

// Cover: the hook's picture (a baseball-sized raindrop next to a baseball) under the hook question.
// The teaser raises the stakes; it doesn't reveal that such a drop can't exist.
export const Thumb: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: BG}}>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
				<Streaks />
				<Drop x={330} y={1325} R={178} shape={{tear: 1}} />
				<Baseball x={745} y={1325} R={178} />
			</svg>
			<Line at={0} y={t(290, 280)} size={t(150, 116)} weight={900}>
				{t(
					<>
						如果雨滴{'\n'}跟<span style={{color: C.amber}}>棒球</span>{'\n'}一樣大？
					</>,
					<>
						What if{'\n'}raindrops were{'\n'}as big as{'\n'}
						<span style={{color: C.amber}}>baseballs</span>?
					</>,
				)}
			</Line>
			<Line at={0} y={t(872, 888)} size={t(76, 68)} weight={700} color={C.amber}>
				{t('會把人砸昏嗎？', 'Could one knock you out?')}
			</Line>
		</AbsoluteFill>
	);
};
