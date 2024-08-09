import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';
import '@/assets/tailwind.css';
import i18n from '@/locales/i18n';

const app = createApp(App);
const pusherOptions = {
    apiKey: import.meta.env.VITE_APP_PUSHER_KEY,
    cluster: import.meta.env.VITE_APP_PUSHER_CLUSTER
};
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(i18n);
app.mount('#app');
