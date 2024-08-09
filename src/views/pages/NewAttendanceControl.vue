<script>
import { FilterMatchMode } from '@primevue/core/api';
//import ProductService from "../service/ProductService";
import AttendanceService from '@/service/AttendanceService';
import moment from 'moment';

export default {
    data() {
        return {
            //products: null,
            employeesList: null,
            justifyDialog: false,
            missedReason: null,
            missedDescription: null,
            deleteProductDialog: false,
            deleteProductsDialog: false,
            product: {},
            selectedProducts: [],
            filters: {},
            submitted: false,
            statuses: [
                { label: 'INSTOCK', value: 'instock' },
                { label: 'LOWSTOCK', value: 'lowstock' },
                { label: 'OUTOFSTOCK', value: 'outofstock' }
            ],
            disabledButtonCheckIn: false,
            disabledButtonCheckOut: false,
            disabledButtonClose: false
        };
    },
    sheetListService: null,
    //productService: null,
    created() {
        //this.productService = new ProductService();
        this.sheetListService = new AttendanceService();
        this.initFilters();
    },
    mounted() {
        // console.log(this.$route.params);
        let sheet = this.$route.params;

        //this.productService.getProducts().then((data) => (this.products = data));

        this.sheetListService.getOne(sheet.id).then((data) => {
            if (!data.is_open) {
                this.disabledButtonCheckIn = true;
                this.disabledButtonCheckOut = true;
                this.disabledButtonClose = true;
            }
            this.employeesList = data.employees;
        });
    },
    methods: {
        backPage() {
            this.$router.push(`/attendance-sheet`);
        },
        checkIn() {
            if (this.selectedProducts.length > 0) {
                let now = moment().format('YYYY-MM-DD HH:mm:ss');
                let attendance_sheet = this.$route.params;
                let selectedEmployees = JSON.parse(JSON.stringify(this.selectedProducts));
                selectedEmployees.map((employee) => {
                    employee.check_in = now;
                });
                let payload = {
                    employees: selectedEmployees
                };
                // console.log(payload)
                this.sheetListService.checkIn(attendance_sheet.id, payload).then((data) => {
                    if (data.data) {
                        this.employeesList = data.data.employees;
                        this.selectedProducts = [];
                        this.$toast.add({
                            severity: 'success',
                            summary: this.$t('successful'),
                            detail: this.$t('attendance_sheet') + ' ' + this.$t('updated_a'),
                            life: 3000
                        });
                    } else {
                        this.$toast.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: data.message,
                            life: 3000
                        });
                    }
                });
            } else {
                this.$toast.add({
                    severity: 'error',
                    summary: this.$t('warning'),
                    detail: this.$t('toast_attendance'),
                    life: 3000
                });
            }
        },
        checkOut() {
            if (this.selectedProducts.length > 0) {
                let now = moment().format('YYYY-MM-DD HH:mm:ss');
                let attendance_sheet = this.$route.params;
                let selectedEmployees = JSON.parse(JSON.stringify(this.selectedProducts));
                selectedEmployees.map((employee) => {
                    employee.check_out = now;
                });
                let payload = {
                    employees: selectedEmployees
                };
                // console.log(payload)
                this.sheetListService.checkOut(attendance_sheet.id, payload).then((data) => {
                    if (data.data) {
                        this.employeesList = data.data.employees;
                        this.selectedProducts = [];
                        this.$toast.add({
                            severity: 'success',
                            summary: this.$t('successful'),
                            detail: this.$t('attendance_sheet') + ' ' + this.$t('updated_a'),
                            life: 3000
                        });
                    } else {
                        this.$toast.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: data.message,
                            life: 3000
                        });
                    }
                });
            } else {
                this.$toast.add({
                    severity: 'error',
                    summary: this.$t('warning'),
                    detail: this.$t('toast_attendance'),
                    life: 3000
                });
            }
        },

        checkJustify() {
            this.submitted = true;
            if (this.validateFormJustify()) {
                this.justifyDialog = true;
                let attendance_sheet = this.$route.params;
                // let employees = JSON.parse(JSON.stringify(this.employeesList));
                let selectedEmployees = JSON.parse(JSON.stringify(this.selectedProducts));
                selectedEmployees.map((employee) => {
                    employee.missed_reason = this.missedReason;
                    employee.missed_description = this.missedDescription;
                });
                let payload = {
                    employees: selectedEmployees
                };
                this.sheetListService.justifiedAbsence(attendance_sheet.id, payload).then((data) => {
                    if (data.data) {
                        this.employeesList = data.data.employees;
                        this.selectedProducts = [];
                        this.$toast.add({
                            severity: 'success',
                            summary: this.$t('successful'),
                            detail: this.$t('attendance_sheet') + ' ' + this.$t('updated_a'),
                            life: 3000
                        });
                    } else {
                        this.$toast.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: data.message,
                            life: 3000
                        });
                    }
                });
                this.justifyDialog = false;
                this.defaultObjects();
            } /*else {
        this.$toast.add({
          severity: "error",
          summary: this.$t("warning"),
          detail: this.$t("toast_attendance"),
          life: 3000,
        });
      }*/
        },

        closeSheet() {
            let attendance_sheet = this.$route.params;
            this.sheetListService.closed(attendance_sheet.id).then((data) => {
                this.employeesList = data.data.employees;
                this.selectedProducts = [];
                this.$toast.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: data.message,
                    life: 3000
                });
                this.$router.push(`/attendance-sheet`);
            });
        },

        formatCurrency(value) {
            if (value)
                return value.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                });
            return;
        },
        openNew() {
            this.product = {};
            this.submitted = false;
            this.justifyDialog = true;
        },
        openJustify() {
            this.defaultObjects();
            if (this.selectedProducts.length > 0) {
                this.submitted = false;
                this.justifyDialog = true;
            } else {
                this.$toast.add({
                    severity: 'error',
                    summary: this.$t('warning'),
                    detail: this.$t('toast_attendance'),
                    life: 3000
                });
            }
        },
        hideDialog() {
            this.defaultObjects();
            this.justifyDialog = false;
            this.submitted = false;
        },
        defaultObjects() {
            (this.missedReason = null), (this.missedDescription = null);
        },
        validateFormJustify() {
            return this.missedReason && this.missedDescription;
        },
        saveProduct() {
            this.submitted = true;
            if (this.product.name.trim()) {
                if (this.product.id) {
                    this.product.inventoryStatus = this.product.inventoryStatus.value ? this.product.inventoryStatus.value : this.product.inventoryStatus;
                    this.products[this.findIndexById(this.product.id)] = this.product;
                    this.$toast.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Product Updated',
                        life: 3000
                    });
                } else {
                    this.product.id = this.createId();
                    this.product.code = this.createId();
                    this.product.image = 'product-placeholder.svg';
                    this.product.inventoryStatus = this.product.inventoryStatus ? this.product.inventoryStatus.value : 'INSTOCK';
                    this.products.push(this.product);
                    this.$toast.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Product Created',
                        life: 3000
                    });
                }
                this.justifyDialog = false;
                this.product = {};
            }
        },
        editProduct(product) {
            this.product = { ...product };
            this.justifyDialog = true;
        },
        confirmDeleteProduct(product) {
            this.product = product;
            this.deleteProductDialog = true;
        },
        deleteProduct() {
            this.products = this.products.filter((val) => val.id !== this.product.id);
            this.deleteProductDialog = false;
            this.product = {};
            this.$toast.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Product Deleted',
                life: 3000
            });
        },
        findIndexById(id) {
            let index = -1;
            for (let i = 0; i < this.products.length; i++) {
                if (this.products[i].id === id) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        findIndexEmployeesById(id) {
            let index = -1;
            for (let i = 0; i < this.employeesList.length; i++) {
                if (this.employeesList[i].id === id) {
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
        initFilters() {
            this.filters = {
                global: { value: null, matchMode: FilterMatchMode.CONTAINS }
            };
        }
    }
};
</script>

<template>
    <div>
        <div class="col-12">
            <div class="col-12">
                <Button icon="pi pi-arrow-left" class="p-button-rounded mr-2 mb-2" @click="backPage" />
            </div>
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="flex flex-row gap-4">
                            <Button :label="$t('check_in')" icon="pi pi-sign-in" severity="success" @click="checkIn" :disabled="disabledButtonCheckIn" />
                            <Button :label="$t('check_out')" icon="pi pi-sign-out" severity="danger" @click="checkOut" :disabled="disabledButtonCheckOut" />
                            <Button :label="$t('justify')" icon="pi pi-check-square" severity="warn" @click="openJustify" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button :label="$t('close_record')" severity="info" @click="closeSheet" :disabled="disabledButtonClose"></Button>
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="employeesList"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="25"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} employees"
                    responsiveLayout="scroll"
                >
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h5 class="font-bold text-xl text-primary m-0">{{ $t('assist_control') }}</h5>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" :placeholder="$t('search')" />
                            </IconField>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

                    <Column field="name" :header="$t('names')" :sortable="true" headerStyle="width:30%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.name }}
                        </template>
                    </Column>

                    <Column field="lastname" :header="$t('last_names')" :sortable="true" headerStyle="width:30%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.lastname }}
                        </template>
                    </Column>

                    <Column field="check_in" :header="$t('check_in_time')" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.check_in }}
                        </template>
                    </Column>
                    <Column field="check_out" :header="$t('check_out_time')" :sortable="true" headerStyle="width:20%; min-width:1rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.check_out }}
                        </template>
                    </Column>

                    <Column field="status_working" header="Status" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <Tag
                                :value="slotProps.data.status_working"
                                :severity="(slotProps.data.status_working === 'started working' ? 'success' : slotProps.data.status_working === 'justified absence' ? 'warn' : slotProps.data.status_working === 'finished work' ? 'info' : 'danger')" />
                        </template>
                    </Column>
                </DataTable>

            </div>
            <Dialog v-model:visible="justifyDialog" :style="{ width: '450px' }" :header="$t('justification')" :modal="true" class="p-fluid">
                <div class="flex flex-col gap-4">
                    <div>
                        <label for="name" class="block font-bold" >{{ $t('reason') }}</label>
                        <InputText id="name" v-model.trim="missedReason" required="true" autofocus :class="{ 'p-invalid': submitted && !missedReason }" fluid />
                        <small class="p-invalid" v-if="submitted && !missedReason">{{ $t('reason_alert') }}</small>
                    </div>
                    <div>
                        <label for="name" class="block font-bold" >{{ $t('description') }}</label>
                        <Textarea id="name" v-model.trim="missedDescription" rows="5" :autoResize="true" required="true" autofocus :class="{ 'p-invalid': submitted && !missedDescription }" fluid />
                        <small class="p-invalid" v-if="submitted && !missedDescription">{{ $t('description_alert') }}</small>
                    </div>
                </div>
                <template #footer>
                    <Button :label="$t('cancel')" icon="pi pi-times" class="p-button-text p-button-danger" @click="hideDialog" />
                    <Button :label="$t('save')" icon="pi pi-check" class="p-button-text" @click="checkJustify" />
                </template>
            </Dialog>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/badges.scss';
</style>
