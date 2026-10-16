import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Line} from '../../engine/kit/kit';
import {useT} from '../../engine/kit/lang';
import {C} from '../../engine/kit/theme';
import {Gecko, Glass, Person} from './art';

// Cover: the hook's glass wall, a big gecko and the person at the foot of the wall, under the hook question.
// Teases the cost of climbing, doesn't give the 40%.
export const Thumb: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<Glass />
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
				<rect x={0} y={1760} width={1080} height={160} fill="#090B0E" />
				<rect x={0} y={1758} width={1080} height={4} fill="#2A2F38" />
				<Gecko x={770} y={1340} rot={-12} scale={1.25} />
				<Person id="thumb" x={330} y={1760} k={2.7} pose="up" view="back" />
			</svg>
			<Line at={0} y={t(290, 280)} size={t(168, 128)} weight={900}>
				{t('如果人類\n能像壁虎\n爬牆？', 'What if\nhumans could\nclimb like\ngeckos?')}
			</Line>
			<Line at={0} y={t(960, 960)} size={t(76, 68)} weight={700} color={C.amber}>
				{t('代價是什麼？', 'What would it cost you?')}
			</Line>
		</AbsoluteFill>
	);
};
