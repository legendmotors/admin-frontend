const cookieObj = typeof window === 'undefined' ? require('next/headers') : require('universal-cookie');

import en from './public/locales/en.json';
import ar from './public/locales/ae.json';
import es from './public/locales/es.json';
import fr from './public/locales/fr.json';
import ru from './public/locales/ru.json';
import zhCn from './public/locales/zh.json';
const langObj: any = { en, ar, es, fr, ru, 'zh-CN': zhCn, };

const getLang = () => {
    let lang = null;
    if (typeof window !== 'undefined') {
        const cookies = new cookieObj.default(null, { path: '/' });
        lang = cookies.get('i18nextLng');
    } else {
        const cookies = cookieObj.cookies();
        lang = cookies.get('i18nextLng')?.value;
    }
    return lang;
};

export const getTranslation = () => {
    const lang = getLang();
    const data: any = langObj[lang || 'en'];

    const t = (key: string) => {
        if (!data) {
            console.warn(`No translation object found for language "${lang}". Falling back to key: ${key}`);
            return key;
        }

        if (!data[key]) {
            console.warn(`Key "${key}" not found in translation file for language "${lang}".`);
            return key;
        }

        return data[key];
    };

    const initLocale = (themeLocale: string) => {
        const lang = getLang();
        i18n.changeLanguage(lang || themeLocale);
    };

    const i18n = {
        language: lang,
        changeLanguage: (lang: string) => {
            const cookies = new cookieObj.default(null, { path: '/' });
            cookies.set('i18nextLng', lang);
        },
    };

    return { t, i18n, initLocale };
};
