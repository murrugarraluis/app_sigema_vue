<script setup>
import { ref, onMounted } from 'vue';
import DashboardService from '@/service/DashboardService';
import { useRouter } from 'vue-router';

const dashboard = ref({
    machines: { count: null },
    working_sheets: { count_today: null },
    maintenance_sheets: { count_today: null },
    employees: { count: null },
    attendance_sheets: { count_today: null },
    suppliers: { count: null },
    articles: { count: null },
    users: { count: null }
});
const router = useRouter();

const dashboardService = new DashboardService();

const pageMachines = () => {
    router.push('/machines');
};

const pageWorkSheets = () => {
    router.push('/work-sheet');
};

const pageMaintenancesSheets = () => {
    router.push('/maintenance-sheet');
};

const pageEmployees = () => {
    router.push('/employees');
};

const pageAttendancesSheets = () => {
    router.push('/attendance-sheet');
};

const pageSuppliers = () => {
    router.push('/suppliers');
};

const pageInventory = () => {
    router.push('/articles');
};

const pageUsers = () => {
    router.push('/users');
};

onMounted(() => {
    dashboardService.getAll().then((data) => {
        dashboard.value = data;
    });
});
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div
                class="card mb-0 cursor-pointer transform transition-transform duration-300 ease-in-out hover:scale-105 flex flex-col h-full"
                @click="pageMachines">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">{{ $t('d_machines') }}</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                            {{ dashboard.machines.count }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-th-large text-blue-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ $t('note') }}</span>
                <span class="text-muted-color">{{ $t('d_n_machines') }}</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div
                class="card mb-0 cursor-pointer transform transition-transform duration-300 ease-in-out hover:scale-105 flex flex-col h-full"
                @click="pageWorkSheets">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">{{ $t('d_workSheets') }}</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                            {{ dashboard.working_sheets.count_today }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-cog text-orange-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ $t('note') }}</span>
                <span class="text-muted-color">{{ $t('d_n_workSheets') }}</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div
                class="card mb-0 cursor-pointer transform transition-transform duration-300 ease-in-out hover:scale-105 flex flex-col h-full"
                @click="pageMaintenancesSheets">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">{{ $t('d_maintenanceSheets') }}</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                            {{ dashboard.maintenance_sheets.count_today }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-sliders-h text-cyan-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ $t('note') }}</span>
                <span class="text-muted-color">{{ $t('d_n_maintenancesSheets') }}</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div
                class="card mb-0 cursor-pointer transform transition-transform duration-300 ease-in-out hover:scale-105 flex flex-col h-full"
                @click="pageEmployees">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">{{ $t('d_employees') }}</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                            {{ dashboard.employees.count }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-purple-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ $t('note') }}</span>
                <span class="text-muted-color">{{ $t('d_n_employees') }}</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div
                class="card mb-0 cursor-pointer transform transition-transform duration-300 ease-in-out hover:scale-105 flex flex-col h-full"
                @click="pageAttendancesSheets">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">{{ $t('d_attendanceSheets') }}</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                            {{ dashboard.attendance_sheets.count_today }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-check-square text-purple-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ $t('note') }}</span>
                <span class="text-muted-color">{{ $t('d_n_attendanceSheets') }}</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div
                class="card mb-0 cursor-pointer transform transition-transform duration-300 ease-in-out hover:scale-105 flex flex-col h-full"
                @click="pageSuppliers">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">{{ $t('d_suppliers') }}</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                            {{ dashboard.suppliers.count }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-briefcase text-green-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ $t('note') }}</span>
                <span class="text-muted-color">{{ $t('d_n_suppliers') }}</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div
                class="card mb-0 cursor-pointer transform transition-transform duration-300 ease-in-out hover:scale-105 flex flex-col h-full"
                @click="pageInventory">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">{{ $t('d_inventory') }}</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                            {{ dashboard.articles.count }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-wallet text-cyan-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ $t('note') }}</span>
                <span class="text-muted-color">{{ $t('d_n_inventory') }}</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div
                class="card mb-0 cursor-pointer transform transition-transform duration-300 ease-in-out hover:scale-105 flex flex-col h-full"
                @click="pageUsers">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">{{ $t('d_users') }}</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ dashboard.users.count
                            }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-red-100 dark:bg-red-400/10 rounded-border"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-user text-red-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ $t('note') }}</span>
                <span class="text-muted-color">{{ $t('d_n_users') }}</span>
            </div>
        </div>
    </div>
</template>
