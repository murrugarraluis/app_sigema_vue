<script setup>
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';
import { useConfirm } from 'primevue/useconfirm';
import AuthService from '@/service/AuthService';
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import NotificationService from '@/service/NotificationService';

const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();
const confirm = useConfirm();
const authService = new AuthService();
const router = useRouter();
const numberDontView = ref(null);
const notifications = ref([]);
const popover = ref(null);
const player = ref(new Audio()); // Ruta al archivo de sonido
const user = ref(null);
const confirmSignOut = () => {
    confirm.require({
        message: 'Do you want to close session?',
        header: 'Sign out',
        icon: 'pi pi-info-circle',
        rejectLabel: 'Cancel',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Yes',
            severity: 'danger'
        },
        accept: () => {
            logout();
        }
    });
};
const notificationService = new NotificationService();
const logout = () => {
    router.push({ name: 'login' });
    localStorage.removeItem('userLogged');
    localStorage.removeItem('token');
    authService.logout();
};
const toggleNotification = (event) => {
    popover.value.toggle(event);
    numberDontView.value = null;
    notificationService.check();
};
const fetchNotifications = async () => {
    try {
        notifications.value = await notificationService.getAll();
        updateNumberDontView();
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
};
const updateNumberDontView = () => {
    const length = notifications.value.filter((notification) => !notification.is_view).length;
    numberDontView.value = length > 0 ? length : null;
};
const setupAudioPlayer = () => {
    player.value.src = '/sounds/notification.mp3'; // Ruta al archivo de sonido
    player.value.volume = 0.5;
};
const setupPusher = () => {
    const channel = pusher.subscribe('notifications');
    channel.bind('App\\Events\\NewNotification', (data) => {
        console.log(user.value.permissions);
        const myUser = user.value;
        const hasListenNotification = myUser.permissions.some((item) => item.name === 'notifications');
        console.log(myUser && hasListenNotification);
        if (myUser && hasListenNotification) {
            console.log(data);
            notifications.value.unshift(data.data);
            updateNumberDontView();
            player.value.play();
        }
    });
};
onMounted(async () => {
    user.value = JSON.parse(localStorage.getItem('userLogged'));
    await fetchNotifications();
    setupAudioPlayer();
    setupPusher();
});
</script>

<template>
    <ConfirmDialog></ConfirmDialog>
    <Popover ref="popover" appendTo="body" :showCloseIcon="false" style="width: 25rem">
        <ScrollPanel style="width: 100%; height: 300px">
            <p v-if="!(notifications.length > 0)" class="text-center text-gray-500">{{ $t('not_notifications_text') }}</p>
            <div class="flex flex-col gap-4 p-2">
                <Card v-for="(item, index) in notifications" :key="index">
                    <template #title>{{ item.machine.name + ' / ' + item.machine.serie_number }}</template>
                    <template #content>
                        <p class="text-700">
                            {{ $t(item.message) }}
                        </p>
                        <p class="text-700">
                            {{ item.date_send_notification }}
                        </p>
                    </template>
                </Card>
            </div>
        </ScrollPanel>
    </Popover>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <span>SIGEMA</span>
            </router-link>
        </div>
        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>
            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>
            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action" @click="toggleNotification">
                        <OverlayBadge id="notificationBadge" :value="numberDontView">
                            <i class="pi pi-bell mt-1"></i>
                        </OverlayBadge>
                        <span>Notifications</span>
                    </button>
                    <button type="button" class="layout-topbar-action layout-topbar-action-signout" @click="confirmSignOut()">
                        <i class="pi pi-sign-out"></i>
                        <span>Sign out</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.p-card {
    border: 1px solid var(--primary-color);
}
</style>
