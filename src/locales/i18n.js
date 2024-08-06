import { createI18n } from 'vue-i18n';
import en from './en.json';
import es from './es.json';

const messages = {
    en,
    es
};

const i18n = createI18n({
    legacy: false,
    locale: 'en', // set locale
    fallbackLocale: 'en', // set fallback locale
    messages
});

export default i18n;
