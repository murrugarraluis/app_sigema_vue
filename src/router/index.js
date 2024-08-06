import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'app',
            component: AppLayout,
            meta: {
                requiresAuth: true
            },
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/pages/CustomDashboard.vue')
                },
                {
                    path: '/machines',
                    name: 'machines',
                    component: () => import('@/views/pages/Machines.vue')
                },
                {
                    path: '/employees',
                    name: 'employees',
                    component: () => import('@/views/pages/Employees.vue')
                },
                {
                    path: '/attendance-sheet',
                    name: 'attendance-sheet',
                    component: () => import('@/views/pages/AttendanceSheet.vue')
                },
                {
                    path: '/new-attendance-control/:id',
                    name: 'new-attendance-control',
                    component: () => import('@/views/pages/NewAttendanceControl.vue')
                },
                {
                    path: '/article-types',
                    name: 'article-types',
                    component: () => import('@/views/pages/ArticleTypes.vue')
                },
                {
                    path: '/articles',
                    name: 'articles',
                    component: () => import('@/views/pages/Articles.vue')
                },
                {
                    path: '/suppliers',
                    name: 'suppliers',
                    component: () => import('@/views/pages/Suppliers.vue')
                },
                {
                    path: '/users',
                    name: 'users',
                    component: () => import('@/views/pages/Users.vue')
                },
                {
                    path: '/roles',
                    name: 'roles',
                    component: () => import('@/views/pages/Roles.vue')
                },

                {
                    path: '/maintenance-sheet',
                    name: 'maintenance-sheet',
                    component: () => import('@/views/pages/MaintenanceSheet.vue')
                },
                {
                    path: '/new-maintenance-sheet/:id?',
                    name: 'new-maintenance-sheet',
                    component: () => import('@/views/pages/NewMaintenanceSheet.vue')
                },

                {
                    path: '/work-sheet',
                    name: 'work-sheet',
                    component: () => import('@/views/pages/WorkSheet.vue')
                },

                {
                    path: '/new-work-start/:id?',
                    name: 'new-work-start',
                    component: () => import('@/views/pages/NewWorkStart.vue')
                },
                {
                    path: '/r-maintenances',
                    name: 'r-maintenances',
                    component: () => import('@/views/pages/R-Maintenances.vue')
                },
                {
                    path: '/r-attendances',
                    name: 'r-attendances',
                    component: () => import('@/views/pages/R-Attendances.vue')
                }
            ]
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/pages/LoginCustom.vue')
        },
        {
            path: '/:catchAll(.*)',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        }
    ]
});

function hasAccess(name) {
    // console.log(name)
    let permissions = [];
    const permissions_list = JSON.parse(localStorage.getItem('userLogged')).permissions;
    permissions_list.map((permission) => permissions.push(permission.name));
    switch (name) {
        // case 'app':
        //     return true
        /*case 'dashboard':
            return true*/
        case 'users':
            return permissions.includes('users');

        case 'employees':
            return permissions.includes('employees');

        case 'attendance-sheet':
            return permissions.includes('attendance-sheets');

        case 'new-attendance-control':
            return permissions.includes('attendance-sheets');

        case 'r-attendances':
            return permissions.includes('attendance-sheets');

        case 'suppliers':
            return permissions.includes('suppliers');

        case 'articles':
            return permissions.includes('articles');

        case 'machines':
            return permissions.includes('machines');

        case 'dashboard':
            return permissions.includes('dashboard');

        case 'maintenance-sheet':
            return permissions.includes('maintenance-sheets');

        case 'new-maintenance-sheet':
            return permissions.includes('maintenance-sheets');

        case 'r-maintenances':
            return permissions.includes('maintenance-sheets');

        case 'work-sheet':
            return permissions.includes('working-sheets');

        case 'new-work-start':
            return permissions.includes('working-sheets');

        case 'article-types':
            return permissions.includes('article-types');

        case 'roles':
            return permissions.includes('roles');

        default:
            return false;
    }
}

router.beforeEach((to, from, next) => {
    // A Logged-in user can't go to login page again
    if (to.name === 'login' && localStorage.getItem('token')) {
        next({ name: 'dashboard' });
        return;
        // the route requires authentication
    } else if (to.meta.requiresAuth) {
        // console.log(localStorage.getItem('token'))
        if (!localStorage.getItem('token')) {
            // user not logged in, send them to login page
            next({ name: 'login' });
            return;
        } else if (to.name === 'app') {
            next({ name: 'dashboard' });
        } else if (!hasAccess(to.name)) {
            next('notfound');
            return;
        }
    }
    next();
});

export default router;
