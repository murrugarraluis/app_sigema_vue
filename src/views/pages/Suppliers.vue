<script>
import { FilterMatchMode } from '@primevue/core/api';
import SupplierTypeServices from '@/service/SupplierTypeServices';
import DocumentTypeServices from '@/service/DocumentTypeServices';
import BankServices from '@/service/BankServices';
import SupplierService from '@/service/SupplierService';

export default {
    data() {
        return {
            suppliers: null,
            supplierDialog: false,
            deleteSupplierDialog: false,
            deleteProductsDialog: false,
            supplier: {
                document_type: null,
                document_number: null,
                name: null,
                phone: null,
                email: null,
                address: null,
                supplier_type: null,
                banks: []
            },
            bank: {
                id: null,
                name: null,
                account_number: null,
                interbank_account_number: null
            },
            selectedSuppliers: null,
            filters: {},
            submitted: false,
            submittedAddBank: false,
            columns: [
                { field: 'name', header: this.$t('name') },
                { field: 'account_number', header: this.$t('account_number') },
                {
                    field: 'interbank_account_number',
                    header: this.$t('interbank_code')
                }
            ],

            bankItem: null,

            documentTypeItems: null,
            supplierTypeItems: null,
            bankItems: null,

            loadingSuppliers: true,
            isView: false
        };
    },
    documentTypeService: null,
    supplierTypeService: null,
    bankService: null,
    supplierService: null,
    created() {
        this.documentTypeService = new DocumentTypeServices();
        this.supplierTypeService = new SupplierTypeServices();
        this.bankService = new BankServices();
        this.supplierService = new SupplierService();
        this.initFilters();
    },
    mounted() {
        this.supplierService.getAll().then((data) => {
            this.suppliers = data;
            this.loadingSuppliers = false;
        });
        this.documentTypeService.getAll().then((data) => (this.documentTypeItems = data));
        this.supplierTypeService.getAll().then((data) => (this.supplierTypeItems = data));
        this.bankService.getAll().then((data) => (this.bankItems = data));
    },
    methods: {
        openNew() {
            this.isView = false;
            this.defaultObjects();
            this.submitted = false;
            this.submittedAddBank = false;
            this.supplierDialog = true;
        },
        hideDialog() {
            this.defaultObjects();
            this.submitted = false;
            this.submittedAddBank = false;
            this.supplierDialog = false;
        },
        saveProduct() {
            this.submitted = true;
            if (this.validateFormSupplier()) {
                if (this.supplier.id) {
                    //UPDATE
                    const id = this.supplier.id;
                    const payload = this.supplier;
                    this.supplierService.update(id, payload).then((data) => {
                        this.suppliers[this.findIndexById(id)] = data.data;
                        this.$toast.add({
                            severity: 'success',
                            summary: this.$t('successful'),
                            detail: this.$t('supplier') + ' ' + this.$t('updated'),
                            life: 3000
                        });
                    });
                } else {
                    // CREATE
                    const payload = this.supplier;
                    this.supplierService.create(payload).then((data) => {
                        console.log(data);
                        this.suppliers.unshift(data.data);
                        this.$toast.add({
                            severity: 'success',
                            summary: this.$t('successful'),
                            detail: this.$t('supplier') + ' ' + this.$t('created'),
                            life: 3000
                        });
                    });
                }
                this.supplierDialog = false;
                this.defaultObjects();
            }
        },
        viewSupplier(supplier) {
            this.isView = true;
            this.supplierService.getOne(supplier.id).then((data) => {
                this.supplier = { ...data };
                this.supplierDialog = true;
            });
        },
        editSupplier(supplier) {
            this.isView = false;
            this.supplierService.getOne(supplier.id).then((data) => {
                this.supplier = { ...data };
                this.supplierDialog = true;
            });
        },
        confirmDelete(supplier) {
            this.supplier = supplier;
            this.deleteSupplierDialog = true;
        },
        deleteSupplier() {
            this.deleteSupplierDialog = false;
            this.supplierService.delete(this.supplier.id).then(() => {
                this.suppliers = this.suppliers.filter((val) => val.id !== this.supplier.id);
                this.defaultObjects();
                this.$toast.add({
                    severity: 'success',
                    summary: this.$t('successful'),
                    detail: this.$t('supplier') + ' ' + this.$t('deleted'),
                    life: 3000
                });
            });
        },
        findIndexById(id) {
            let index = -1;
            for (let i = 0; i < this.suppliers.length; i++) {
                if (this.suppliers[i].id === id) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        findBankIndexById(id) {
            let index = -1;
            for (let i = 0; i < this.supplier.banks.length; i++) {
                if (this.supplier.banks[i].id === id) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        exportCSV() {
            this.$refs.dt.exportCSV();
        },
        confirmDeleteSelected() {
            this.deleteProductsDialog = true;
        },
        deleteSelectedProducts() {
            this.products = this.products.filter((val) => !this.selectedSuppliers.includes(val));
            this.deleteProductsDialog = false;
            this.selectedSuppliers = null;
            this.$toast.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Products Deleted',
                life: 3000
            });
        },
        addBank() {
            this.submittedAddBank = true;
            if (this.validateFormBank()) {
                if (this.findBankIndexById(this.bankItem.id) === -1) {
                    // INSERT DATA
                    this.bank = { ...this.bank, ...this.bankItem };
                    this.supplier.banks.push(this.bank);
                } else {
                    this.$toast.add({
                        severity: 'error',
                        summary: this.$t('oops'),
                        detail: this.$t('toast_banking_entity'),
                        life: 3000
                    });
                }
                // RESERT DATA
                this.bank = {};
                this.bankItem = null;
                this.submittedAddBank = false;
            }
        },
        validateFormSupplier() {
            return (
                this.supplier.document_type &&
                this.supplier.document_number &&
                this.supplier.document_number.length >= 8 &&
                this.supplier.name &&
                this.supplier.phone &&
                this.supplier.phone.length >= 9 &&
                this.supplier.email &&
                this.supplier.address &&
                this.supplier.supplier_type
            );
        },
        validateFormBank() {
            return this.bankItem && this.bank.account_number && this.bank.interbank_account_number;
        },
        removeBank(data) {
            this.supplier.banks = this.supplier.banks.filter((val) => val.id !== data.id);
        },
        isNumber(evt) {
            evt = evt ? evt : window.event;
            let charCode = evt.which ? evt.which : evt.keyCode;
            if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
                evt.preventDefault();
            } else {
                return true;
            }
        },

        isNumberBank(evt) {
            evt = evt ? evt : window.event;
            let charCode = evt.which ? evt.which : evt.keyCode;
            if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 45) {
                evt.preventDefault();
            } else {
                return true;
            }
        },

        isEmail() {
            return /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/.test(this.supplier.email);
        },
        initFilters() {
            this.filters = {
                global: { value: null, matchMode: FilterMatchMode.CONTAINS }
            };
        },
        defaultObjects() {
            this.supplier = {
                document_type: null,
                document_number: null,
                name: null,
                phone: null,
                email: null,
                address: null,
                supplier_type: null,
                banks: []
            };
            this.bank = {
                id: null,
                name: null,
                account_number: null,
                interbank_account_number: null
            };
            this.bankItem = null;
        }
    }
};
</script>

<template>
    <div>
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button :label="$t('new')" icon="pi pi-plus" class="mr-2" @click="openNew" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="suppliers"
                    v-model:selection="selectedSuppliers"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} suppliers"
                    :loading="loadingSuppliers"
                >
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h5 class="font-bold text-xl text-primary m-0">{{ $t('suppliers') }}</h5>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" :placeholder="$t('search')" />
                            </IconField>
                        </div>
                    </template>

                    <Column field="document_type.name" :header="$t('document_type')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.document_type.name }}
                        </template>
                    </Column>
                    <Column field="document_number" :header="$t('document_number')" :sortable="true" headerStyle="width:10%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.document_number }}
                        </template>
                    </Column>

                    <Column field="name" :header="$t('business_name')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column field="email" :header="$t('email')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.email }}
                        </template>
                    </Column>
                    <Column field="phone" :header="$t('telephone')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.phone }}
                        </template>
                    </Column>
                    <Column field="address" :header="$t('address')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.address }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <div class="flex justify-end items-center">
                                <Button outlined rounded severity="info" icon="pi pi-eye" class="mr-2" @click="viewSupplier(slotProps.data)" />
                                <Button outlined rounded severity="warn" icon="pi pi-pencil" class="mr-2" @click="editSupplier(slotProps.data)" />
                                <Button outlined rounded severity="danger" icon="pi pi-trash" class="" @click="confirmDelete(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="supplierDialog" :style="{ width: '700px' }" :header="!supplier.id ? $t('new_supplier') : !isView ? $t('edit_supplier') : $t('inf_supplier')" :modal="true" class="p-fluid">
                    <div class="flex flex-col gap-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div class="lg:col-span-2">
                                <label for="documentType">{{ $t('document_type') }}</label>
                                <Dropdown
                                    id="documentType"
                                    v-model="supplier.document_type"
                                    :options="documentTypeItems"
                                    optionLabel="name"
                                    :placeholder="$t('select_one')"
                                    :filter="false"
                                    :loading="false"
                                    :class="{ 'p-invalid': submitted && !supplier.document_type }"
                                    :disabled="isView"
                                    autocomplete="off"
                                    fluid
                                ></Dropdown>
                                <small class="p-invalid" v-if="submitted && !supplier.document_type">{{ $t('document_type_alert') }}</small>
                            </div>
                            <div>
                                <label for="ruc">{{ $t('document_number') }}</label>
                                <InputText
                                    id="ruc"
                                    v-model.trim="supplier.document_number"
                                    required="true"
                                    autofocus
                                    :class="{
                                        'p-invalid': (submitted && !supplier.document_number) || (submitted && supplier.document_number.length < 8)
                                    }"
                                    :readonly="isView"
                                    autocomplete="off"
                                    @keypress="isNumber($event)"
                                    fluid
                                />
                                <small class="p-invalid" v-if="submitted && !supplier.document_number">{{ $t('document_number_alert_one') }}</small>
                                <br />
                                <small class="p-invalid" v-if="submitted && supplier.document_number && supplier.document_number.length < 8">{{ $t('document_number_alert_two') }}</small>
                            </div>
                            <div class="md:col-span-2 lg:col-span-3">
                                <label for="businessName">{{ $t('business_name') }}</label>
                                <InputText id="businessName" v-model.trim="supplier.name" required="true" autofocus :class="{ 'p-invalid': submitted && !supplier.name }" :readonly="isView" autocomplete="off" fluid />
                                <small class="p-invalid" v-if="submitted && !supplier.name">{{ $t('business_name_alert') }}</small>
                            </div>
                            <div class="md:col-span-2 lg:col-span-3">
                                <label for="address">{{ $t('address') }}</label>
                                <InputText id="address" v-model.trim="supplier.address" required="true" autofocus :class="{ 'p-invalid': submitted && !supplier.address }" :readonly="isView" autocomplete="off" fluid />
                                <small class="p-invalid" v-if="submitted && !supplier.address">{{ $t('address_alert') }}</small>
                            </div>
                            <div>
                                <label for="telephone">{{ $t('telephone') }}</label>
                                <InputText
                                    id="telephone"
                                    v-model.trim="supplier.phone"
                                    required="true"
                                    autofocus
                                    :class="{
                                        'p-invalid': (submitted && !supplier.phone) || (submitted && supplier.phone.length < 9)
                                    }"
                                    :readonly="isView"
                                    autocomplete="off"
                                    @keypress="isNumber($event)"
                                    fluid
                                />
                                <small class="p-invalid" v-if="submitted && !supplier.phone">{{ $t('telephone_alert_one') }}</small>
                                <br />
                                <small class="p-invalid" v-if="submitted && supplier.phone && supplier.phone.length < 9">{{ $t('telephone_alert_two') }}</small>
                            </div>
                            <div>
                                <label for="email">{{ $t('email') }}</label>
                                <InputText
                                    id="email"
                                    v-model.trim="supplier.email"
                                    required="true"
                                    autofocus
                                    :class="{
                                        'p-invalid': (submitted && !supplier.email) || (submitted && !isEmail())
                                    }"
                                    :readonly="isView"
                                    autocomplete="off"
                                    fluid
                                />
                                <small class="p-invalid" v-if="submitted && !supplier.email">{{ $t('email_alert_one') }}</small>
                                <small class="p-invalid" v-if="submitted && supplier.email && !isEmail()">{{ $t('email_alert_two') }}</small>
                            </div>
                            <div>
                                <label for="supplierType">{{ $t('supplier_type') }}</label>
                                <Dropdown
                                    id="supplierType"
                                    v-model="supplier.supplier_type"
                                    :options="supplierTypeItems"
                                    optionLabel="name"
                                    :placeholder="$t('select_one')"
                                    :filter="false"
                                    :loading="false"
                                    :class="{ 'p-invalid': submitted && !supplier.supplier_type }"
                                    :disabled="isView"
                                    autocomplete="off"
                                    fluid
                                ></Dropdown>
                                <small class="p-invalid" v-if="submitted && !supplier.supplier_type">{{ $t('supplier_type_alert') }}</small>
                            </div>
                        </div>
                        <Divider />
                        <div class="flex flex-col gap-4">
                            <div v-if="!isView" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="col-span-1">
                                    <label for="bankingEntity">{{ $t('banking_entity') }}</label>
                                    <Dropdown
                                        id="bankingEntity"
                                        v-model="bankItem"
                                        :options="bankItems"
                                        optionLabel="name"
                                        :placeholder="$t('select_one')"
                                        :filter="false"
                                        :loading="false"
                                        :class="{ 'p-invalid': submittedAddBank && !bankItem }"
                                        autocomplete="off"
                                        fluid
                                    ></Dropdown>
                                    <small class="p-invalid" v-if="submittedAddBank && !bankItem">{{ $t('banking_entity_alert') }}</small>
                                </div>

                                <div class="col-span-1 col-end-2">
                                    <label for="accountNumber">{{ $t('account_number') }}</label>
                                    <InputText
                                        id="accountNumber"
                                        v-model.trim="bank.account_number"
                                        required="true"
                                        autofocus
                                        :class="{
                                            'p-invalid': submittedAddBank && !bank.account_number
                                        }"
                                        autocomplete="off"
                                        @keypress="isNumberBank($event)"
                                        fluid
                                    />
                                    <small class="p-invalid" v-if="submittedAddBank && !bank.account_number">{{ $t('account_number_alert') }}</small>
                                </div>

                                <div>
                                    <label for="interbankCode">{{ $t('interbank_code') }}</label>
                                    <div>
                                        <InputGroup>
                                            <InputText
                                                id="interbankCode"
                                                v-model.trim="bank.interbank_account_number"
                                                required="true"
                                                autofocus
                                                :class="{
                                                    'p-invalid': submittedAddBank && !bank.interbank_account_number
                                                }"
                                                autocomplete="off"
                                                @keypress="isNumberBank($event)"
                                                fluid
                                            />
                                            <Button icon="pi pi-plus" severity="primary" @click="addBank"></Button>
                                        </InputGroup>
                                    </div>
                                    <small class="p-invalid" v-if="submittedAddBank && !bank.interbank_account_number">{{ $t('interbank_code_alert') }}</small>
                                </div>
                            </div>

                            <div>
                                <DataTable :value="supplier.banks" responsiveLayout="scroll">
                                    <Column v-for="col of columns" :field="col.field" :header="col.header" :key="col.field" style="width: 30%"> </Column>

                                    <Column v-if="!isView" headerStyle="min-width:3rem;">
                                        <template #body="slotProps">
                                            <div style="display: flex; justify-content: end">
                                                <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" outlined @click="removeBank(slotProps.data)" />
                                            </div>
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </div>
                    </div>
                    <template #footer>
                        <Button :label="$t('cancel')" icon="pi pi-times" class="p-button-text p-button-danger" @click="hideDialog" />
                        <Button v-if="!isView" :label="$t('save')" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteSupplierDialog" :style="{ width: '450px' }" :header="$t('confirm')" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="supplier"
                            >{{ $t('delete') }} <b>{{ supplier.name }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="" severity="secondary" outlined @click="deleteSupplierDialog = false" />
                        <Button :label="$t('yes')" icon="pi pi-check" class="" severity="danger" @click="deleteSupplier" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/badges.scss';
</style>
