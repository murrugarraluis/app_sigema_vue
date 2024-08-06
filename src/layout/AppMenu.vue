<script setup>
import { onMounted, ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const model = ref([]);
const getPermissions = async () => {
    let permissions = [];
    const permissionsList = JSON.parse(localStorage.getItem('userLogged')).permissions;
    permissionsList.map((permission) => permissions.push(permission.name));
    return permissions;
};
const setMenuModel = async (permissions) => {
    model.value = [
        {
            label: t('home'),
            items: [
                {
                    label: t('principal'),
                    icon: 'pi pi-fw pi-home',
                    to: '/dashboard',
                    visible: permissions.includes('dashboard')
                }
            ]
        },
        {
            label: t('pages'),
            //label: '$t("pages")',
            icon: 'pi pi-fw pi-search',
            items: [
                {
                    label: t('machines'),
                    icon: 'pi pi-th-large',
                    to: '/machines',
                    visible: permissions.includes('machines')
                },

                {
                    label: t('employees'),
                    icon: 'pi pi-users',
                    visible: permissions.includes('employees') || permissions.includes('attendance-sheets'),
                    items: [
                        {
                            label: t('employees_form'),
                            icon: 'pi pi-fw pi-user-edit',
                            to: '/employees',
                            visible: permissions.includes('employees')
                        },
                        {
                            label: t('attendance_control'),
                            icon: 'pi pi-fw pi-list',
                            to: '/attendance-sheet',
                            visible: permissions.includes('attendance-sheets')
                        }
                    ]
                },
                {
                    label: t('operations'),
                    icon: 'pi pi-slack',
                    visible: permissions.includes('maintenance-sheets') || permissions.includes('working-sheets'),
                    items: [
                        {
                            label: t('maintenance'),
                            icon: 'pi pi-sliders-h',
                            to: '/maintenance-sheet',
                            visible: permissions.includes('maintenance-sheets')
                        },
                        {
                            label: t('worked'),
                            icon: 'pi pi-cog',
                            to: '/work-sheet',
                            visible: permissions.includes('working-sheets')
                        }
                    ]
                },
                {
                    label: t('inventory_min'),
                    icon: 'pi pi-wallet',
                    to: '/articles',
                    visible: permissions.includes('articles')
                },
                {
                    label: t('article_type'),
                    icon: 'pi pi-bars',
                    to: '/article-types',
                    visible: permissions.includes('article-types')
                },
                {
                    label: t('suppliers'),
                    icon: 'pi pi-briefcase',
                    to: '/suppliers',
                    visible: permissions.includes('suppliers')
                },
                {
                    label: t('user_management'),
                    icon: 'pi pi-fw pi-desktop',
                    visible: permissions.includes('roles') || permissions.includes('users'),
                    items: [
                        {
                            label: t('roles'),
                            icon: 'pi pi-check-square',
                            to: '/roles',
                            visible: permissions.includes('roles')
                        },
                        {
                            label: t('users'),
                            icon: 'pi pi-user',
                            to: '/users',
                            visible: permissions.includes('users')
                        }
                    ]
                },
                {
                    label: t('reports'),
                    icon: 'pi pi-folder-open',
                    items: [
                        {
                            label: t('maintenances'),
                            icon: 'pi pi-fw pi-file',
                            to: '/r-maintenances',
                            visible: permissions.includes('maintenance-sheets')
                        },
                        {
                            label: t('r_attendances'),
                            icon: 'pi pi-fw pi-file',
                            to: '/r-attendances',
                            visible: permissions.includes('attendance-sheets')
                        }
                    ]
                }
            ]
        }
    ];
};
onMounted(async () => {
    const list = await getPermissions();
    await setMenuModel(list);
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
