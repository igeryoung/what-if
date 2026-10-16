import React, {createContext, useContext} from 'react';

export type Lang = 'zh' | 'en';

const Ctx = createContext<Lang>('zh');

export const LangProvider: React.FC<{lang: Lang; children: React.ReactNode}> = ({lang, children}) => <Ctx.Provider value={lang}>{children}</Ctx.Provider>;

/** The language being rendered: 'zh' for composition <id>, 'en' for <id>-en. */
export const useLang = () => useContext(Ctx);

/** Returns t(zh, en), which picks the value for the language being rendered: t('如果……', 'What if…'), t(96, 80). */
export const useT = () => {
	const lang = useLang();
	return <A,>(zh: A, en: A): A => (lang === 'en' ? en : zh);
};
