<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import AuthService from '@/service/AuthService';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');

const submitted = ref(false);
const loadingButton = ref(false);
const invalidCredential = ref(false);

const authService = new AuthService();

const router = useRouter();

function login() {
    submitted.value = true;
    loadingButton.value = true;

    const payload = {
        email: email.value,
        password: password.value
    };

    authService.login(payload).then((data) => {
        if (data.token) {
            // TODO: SET DATA
            authService.setUserLogged({ ...data.data });
            authService.setToken(data.token);
            router.push({ name: 'dashboard' });
        } else {
            invalidCredential.value = true;
        }
        loadingButton.value = false;
    });
}
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <div class="w-full flex items-center justify-center mb-8">
                            <img src="/logo.png" alt="Logo JEX Technologies" width="280" />
                        </div>
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Welcome to SIGEMA</div>
                        <span class="text-muted-color font-medium">Machinery Management System</span>
                    </div>

                    <div>
                        <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                        <InputText id="email1" type="text" placeholder="Email address" class="w-full md:w-[30rem] mb-8" v-model="email" />

                        <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                        <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                        <Button label="Sign In" class="w-full" @click="login" :loading="loadingButton"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
