import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Line} from '../../engine/kit/kit';
import {useT} from '../../engine/kit/lang';
import {C} from '../../engine/kit/theme';
import {LEAF, rng, Tree} from './art';

// Cover: the hook's forest, vanishing from left to right, under the hook question. Teases the twist, doesn't answer it.
const FOREST = (() => {
	const r = rng(7);
	const rows = [
		{y: 1360, n: 11, h: [190, 260]},
		{y: 1450, n: 9, h: [240, 320]},
		{y: 1545, n: 7, h: [300, 390]},
	];
	return rows.flatMap((row, ri) =>
		Array.from({length: row.n}, (_, i) => {
			const x = -30 + ((i + 0.5) / row.n) * 1140 + (r() - 0.5) * 50;
			return {x, y: row.y + (r() - 0.5) * 14, h: row.h[0] + r() * (row.h[1] - row.h[0]), kind: Math.floor(r() * 3), color: LEAF[Math.floor(r() * 4)], seed: 100 + ri * 20 + i};
		}),
	);
})();

export const Thumb: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 40%, #141A17 0%, #0C0D10 60%, #08090B 100%)'}}>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
				<rect x={0} y={1560} width={1080} height={360} fill="#120F0C" />
				<rect x={0} y={1560} width={1080} height={4} fill="#2B2219" />
				{FOREST.map((tr, i) => {
					const gone = Math.min(1, Math.max(0, (tr.x - 380) / 420));
					return <Tree key={i} x={tr.x} y={tr.y} h={tr.h} kind={tr.kind} color={tr.color} gone={gone} ghost={0.9 * gone} seed={tr.seed} />;
				})}
			</svg>
			<Line at={0} y={t(330, 320)} size={t(170, 132)} weight={900}>
				{t('如果樹\n全部消失？', 'What if\nevery tree\nvanished?')}
			</Line>
			<Line at={0} y={t(820, 900)} size={t(76, 68)} weight={700} color={C.amber}>
				{t('我們會窒息嗎？', 'Would we suffocate?')}
			</Line>
		</AbsoluteFill>
	);
};
