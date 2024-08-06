import { createI18n } from 'vue-i18n'
import en from './en.json';
import es from './es.json';

const i18n = createI18n({
    legacy: false, // Usa la nueva API de Vue I18n
    locale: 'es', // Establece el idioma predeterminado
    fallbackLocale: 'es', // Establece el idioma de respaldo
    messages: {
        en,
        es
    }
});

export default i18n;
