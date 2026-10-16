import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Line} from '../../engine/kit/kit';
import {useT} from '../../engine/kit/lang';
import {C} from '../../engine/kit/theme';
import {HookArt, P} from './art';

// Cover: the hook's ledge (pigeon + pigeon-sized mosquito), lowered so the question sits above it.
// The teaser asks about the bite; it doesn't give the bag-of-blood answer or the malaria twist.
export const Thumb: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: P.sky1}}>
			<AbsoluteFill style={{transform: 'translateY(185px)'}}>
				<HookArt t={0} moon={[912, 52]} />
			</AbsoluteFill>
			<Line at={0} y={t(300, 290)} size={t(172, 128)} weight={900}>
				{t('如果蚊子\n跟鴿子\n一樣大？', 'What if\nmosquitoes\nwere as big\nas pigeons?')}
			</Line>
			<Line at={0} y={t(975, 975)} size={t(76, 66)} weight={700} color={C.amber}>
				{t('叮一口，要你多少血？', 'How much blood per bite?')}
			</Line>
		</AbsoluteFill>
	);
};
