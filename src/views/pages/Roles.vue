<script>
import { FilterMatchMode } from '@primevue/core/api';
import RolesService from '@/service/RolesService';
import PermissionsService from '@/service/PermissionsService';

export default {
    data() {
        return {
            roles: null,
            //products: null,
            role: {
                name: null,
                permissions: []
            },
            permission: {
                id: null,
                name: null
            },
            productDialog: false,
            deleteProductDialog: false,
            deleteProductsDialog: false,
            product: {},
            selectedProducts: null,
            filters: {},
            checkboxValue: [],
            submitted: false,
            statuses: [
                { label: 'INSTOCK', value: 'instock' },
                { label: 'LOWSTOCK', value: 'lowstock' },
                { label: 'OUTOFSTOCK', value: 'outofstock' }
            ],

            permissionItem: null,
            permissionItems: null,
            loadingRoles: true,

            selectedPermissions: [],
            isView: false
        };
    },
    //productService: null,
    roleService: null,
    permissionsService: null,
    created() {
        this.roleService = new RolesService();
        this.permissionsService = new PermissionsService();
        this.initFilters();
    },
    mounted() {
        this.loading = true;
        this.roleService.getAll().then((data) => {
            this.roles = data;
            this.loadingRoles = false;
        });
        this.permissionsService.getAll().then((data) => (this.permissionItems = data));
        console.log(this.permissionItems);
        this.loading = false;
    },
    methods: {
        formatCurrency(value) {
            if (value)
                return value.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                });
            return;
        },
        openNew() {
            this.isView = false;
            this.defaultObjects();
            this.submitted = false;
            this.productDialog = true;
        },
        hideDialog() {
            this.productDialog = false;
            this.submitted = false;
        },
        saveProduct() {
            this.submitted = true;
            if (this.validateForRole()) {
                if (this.role.id) {
                    const payload = this.role;
                    //UPDATE
                    this.roleService.update(this.role.id, payload).then((data) => {
                        this.roles[this.findIndexById(data.data.id)] = data.data;
                        this.$toast.add({
                            severity: 'success',
                            summary: this.$t('successful'),
                            detail: this.$t('role') + ' ' + this.$t('updated'),
                            life: 3000
                        });
                    });
                } else {
                    // CREATE
                    const payload = this.role;
                    this.roleService.create(payload).then((data) => {
                        this.roles.unshift(data.data);
                        this.$toast.add({
                            severity: 'success',
                            summary: this.$t('successful'),
                            detail: this.$t('role') + ' ' + this.$t('created'),
                            life: 3000
                        });
                    });
                }
                this.hideDialog();
                //this.defaultObjects();
            }
        },
        validateForRole() {
            return this.role.name && this.role.permissions.length > 0;
            //this.machine.serie_number && this.machine.name;
        },
        viewProduct(role) {
            this.isView = true;
            this.role = { ...role };
            this.productDialog = true;
        },
        editProduct(role) {
            this.isView = false;
            this.role = { ...role };
            this.productDialog = true;
        },
        confirmDeleteProduct(role) {
            this.role = role;
            this.deleteProductDialog = true;
        },
        deleteProduct() {
            this.deleteProductDialog = false;
            this.roleService.delete(this.role.id).then(() => {
                this.roles = this.roles.filter((val) => val.id !== this.role.id);
                this.defaultObjects();
                this.$toast.add({
                    severity: 'success',
                    summary: this.$t('successful'),
                    detail: this.$t('role') + ' ' + this.$t('deleted'),
                    life: 3000
                });
            });
        },
        findIndexById(id) {
            let index = -1;
            for (let i = 0; i < this.roles.length; i++) {
                if (this.roles[i].id === id) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        createId() {
            let id = '';
            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (var i = 0; i < 5; i++) {
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return id;
        },
        exportCSV() {
            this.$refs.dt.exportCSV();
        },
        confirmDeleteSelected() {
            this.deleteProductsDialog = true;
        },
        deleteSelectedProducts() {
            this.products = this.products.filter((val) => !this.selectedProducts.includes(val));
            this.deleteProductsDialog = false;
            this.selectedProducts = null;
            this.$toast.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Products Deleted',
                life: 3000
            });
        },
        defaultObjects() {
            this.role = {
                name: null,
                permissions: []
            };
        },
        initFilters() {
            this.filters = {
                global: { value: null, matchMode: FilterMatchMode.CONTAINS }
            };
        }
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button :label="$t('new')" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="roles"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} roles"
                    responsiveLayout="scroll"
                    :loading="loadingRoles"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">{{ $t('roles') }}</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" :placeholder="$t('search')" />
                            </span>
                        </div>
                    </template>

                    <Column field="name" :header="$t('name')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <div style="display: flex; justify-content: end">
                                <Button icon="pi pi-eye" class="p-button-rounded p-button-info mr-2" @click="viewProduct(slotProps.data)" />
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-warning mr-2" @click="editProduct(slotProps.data)" />
                                <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDeleteProduct(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" :header="!role.id ? $t('new_role') : !isView ? $t('edit_role') : $t('inf_role')" :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="name">{{ $t('name') }}</label>
                        <InputText id="name" v-model.trim="role.name" required="true" autofocus :readonly="isView" :class="{ 'p-invalid': submitted && !role.name }" />
                        <small class="p-invalid" v-if="submitted && !role.name">{{ $t('name_alert') }}</small>
                    </div>

                    <div class="card">
                        <h5>{{ $t('select_permissions') }}</h5>
                        <div class="grid">
                            <div class="col-12" v-show="submitted && !role.permissions.length > 0">
                                <InlineMessage severity="error">{{ $t('select_permissions_alert') }} </InlineMessage>
                            </div>
                            <div class="col-12">
                                <div v-for="permission of permissionItems" :key="permission.id" class="field-checkbox">
                                    <Checkbox v-model="role.permissions" name="permission" :value="permission" :disabled="isView" />
                                    <label :for="permission.id">{{ permission.name }}</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <Button :label="$t('cancel')" icon="pi pi-times" class="p-button-text p-button-danger" @click="hideDialog" />
                        <Button v-if="!isView" :label="$t('save')" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product"
                            >{{ $t('delete') }} <b>{{ role.name }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false" />
                        <Button :label="$t('yes')" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete the selected products?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/badges.scss';
</style>
