import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Line} from '../../engine/kit/kit';
import {useT} from '../../engine/kit/lang';
import {C} from '../../engine/kit/theme';
import {World} from './world';

// Cover: the hook's first frame (the phone falling toward the sea under a night sky), a little closer and lower,
// under the hook question. Teases the descent; never shows the answer.
export const Thumb: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{transform: 'translateY(170px) scale(1.2)', transformOrigin: '540px 1180px'}}>
				<World sec={0} />
			</AbsoluteFill>
			<Line at={0} y={t(290, 290)} size={t(150, 124)} weight={900}>
				{t('如果手機掉進\n馬里亞納\n海溝？', 'What if your\nphone fell into\nthe Mariana\nTrench?')}
			</Line>
			<Line at={0} y={t(910, 935)} size={t(78, 66)} weight={800} color={C.amber}>
				{t('要沉多久才會到底？', 'How long until\nit hits bottom?')}
			</Line>
		</AbsoluteFill>
	);
};
