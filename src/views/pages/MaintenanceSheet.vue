<script>
import { FilterMatchMode } from '@primevue/core/api';
import MachinesService from '@/service/MachinesService';
import ArticlesService from '@/service/ArticlesService';
import ImageService from '@/service/ImageService';
import FileService from '@/service/FileService';
// import WorkSheetService from "../service/WorkSheetService";
import MaintenenaceSheetService from '@/service/MaintenenceSheetService';
import moment from 'moment';

export default {
    data() {
        return {
            // apiHost: "https://stormy-tundra-82595.herokuapp.com/storage/",
            machines: null,
            maintenanaceSheet: null,
            productDialog: false,
            deleteDialog: false,
            deleteProductsDialog: false,
            machine: {
                serie_number: null,
                name: null,
                brand: null,
                model: null,
                maximum_working_time: null,
                image: null,
                articles: []
            },
            spare_Part: {
                id: null,
                model: null,
                name: null
            },
            product: {},
            resource: {},
            selectedProducts: null,
            filters: {},
            submitted: false,
            message: null,

            loadingSpareParts: true,

            statuses: [
                { label: 'INSTOCK', value: 'instock' },
                { label: 'LOWSTOCK', value: 'lowstock' },
                { label: 'OUTOFSTOCK', value: 'outofstock' }
            ],

            submittedAddSparePart: false,

            columns: [
                { field: 'model', header: 'Serial Number' },
                { field: 'name', header: 'Nombre' }
            ],

            sparePartItem: null,
            sparePartItems: null,
            image: null,
            file: null,
            imageDefault: 'https://via.placeholder.com/150x180',
            loadingMachines: true,
            isView: false,
            start_date: moment().format('YYYY-MM-DD'),
            end_date: moment().format('YYYY-MM-DD'),
            minDateValue: new Date()
        };
    },
    workSheetService: null,
    machinesService: null,
    sparePartService: null,
    imageService: null,
    fileService: null,
    created() {
        this.maintenenaceSheetService = new MaintenenaceSheetService();
        this.machinesService = new MachinesService();
        this.sparePartService = new ArticlesService();
        this.imageService = new ImageService();
        this.fileService = new FileService();
        this.initFilters();
    },
    mounted() {
        let start_date = this.start_date;
        let end_date = this.end_date;
        this.maintenenaceSheetService.getAllFilterDates(start_date, end_date).then((data) => {
            this.machines = data;
            this.loadingMachines = false;
        });
        // this.machinesService.getAll().then((data) => {
        //   this.machines = data;
        //   this.loadingMachines = false;
        // });
        // this.sparePartService.getAll().then((data) => (this.sparePartItems = data));
    },
    watch: {
        start_date(value) {
            let start_date = moment(value).format('YYYY-MM-DD');
            let end_date = moment(this.end_date).format('YYYY-MM-DD');
            this.loadingMachines = true;
            this.maintenenaceSheetService.getAllFilterDates(start_date, end_date).then((data) => {
                this.machines = data;
                this.loadingMachines = false;
            });
            // console.log(start_date, end_date);
        },
        end_date(value) {
            let start_date = moment(this.start_date).format('YYYY-MM-DD');
            let end_date = moment(value).format('YYYY-MM-DD');
            this.loadingMachines = true;
            this.maintenenaceSheetService.getAllFilterDates(start_date, end_date).then((data) => {
                this.machines = data;
                this.loadingMachines = false;
            });
            // console.log(start_date, end_date);
        }
    },
    methods: {
        onUploadImage(event) {
            const [file] = event.target.files;
            if (file) {
                // this.machine.image = URL.createObjectURL(file)
                this.machine.image = file;
            }
        },
        getImageObjectUrl(file) {
            return URL.createObjectURL(file);
        },
        isFile(value) {
            if (value) {
                return typeof value === 'object';
            }
            return false;
        },
        onUploadFile(event) {
            // console.log(event.target.files)
            const [file] = event.target.files;
            if (file) {
                this.machine.technical_sheet = file;
            }
        },
        formatCurrency(value) {
            if (value)
                return value.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                });
            return;
        },
        nextPage() {
            this.$router.push(`/new-maintenance-sheet`);
        },
        openNew() {
            this.isView = false;
            this.defaultObjects();
            this.sparePartService.getAllSparePart().then((data) => {
                this.sparePartItems = data;
                this.loadingSpareParts = false;
            });
            //this.product = {};
            this.submitted = false;
            this.productDialog = true;
        },
        hideDialog() {
            this.defaultObjects();
            this.productDialog = false;
            this.submitted = false;
        },
        async saveProduct() {
            this.submitted = true;
            if (this.validateFormMachine()) {
                if (this.machine.id) {
                    //UPLOAD IMAGES
                    // console.log(this.machine)
                    if (this.isFile(this.machine.image)) {
                        let formdataImage = new FormData();
                        formdataImage.append('image', this.machine.image, this.machine.image);
                        await this.imageService.upload(formdataImage).then((data) => {
                            this.machine.image = data.path;
                        });
                    }
                    if (this.isFile(this.machine.technical_sheet)) {
                        let formdataFile = new FormData();
                        formdataFile.append('file', this.machine.technical_sheet, this.machine.technical_sheet);
                        await this.fileService.upload(formdataFile).then((data) => {
                            this.machine.technical_sheet = data.path;
                        });
                    }
                    const payload = this.machine;
                    //console.log(payload, this.article, this.article.id);
                    //UPDATE
                    this.machinesService.update(this.machine.id, payload).then((data) => {
                        this.machines[this.findIndexById(data.data.id)] = data.data;
                        // console.log(data.data.id);
                        // console.log(this.findIndexById(data.data.id));
                        //console.log(this.article.id);
                        //console.log(this.findIndexById(this.article.id));
                        this.$toast.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: data.message,
                            life: 3000
                        });
                    });
                } else {
                    // CREATE

                    //UPLOAD IMAGES
                    if (this.isFile(this.machine.image)) {
                        let formdataImage = new FormData();
                        formdataImage.append('image', this.machine.image, this.machine.image);
                        await this.imageService.upload(formdataImage).then((data) => {
                            this.machine.image = data.path;
                        });
                    }
                    if (this.isFile(this.machine.technical_sheet)) {
                        let formdataFile = new FormData();
                        formdataFile.append('file', this.machine.technical_sheet, this.machine.technical_sheet);
                        await this.fileService.upload(formdataFile).then((data) => {
                            this.machine.technical_sheet = data.path;
                        });
                    }
                    const payload = this.machine;
                    await this.machinesService.create(payload).then((data) => {
                        this.machines.unshift(data.data);
                        this.$toast.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: data.message,
                            life: 3000
                        });
                    });
                }
                this.productDialog = false;
                this.defaultObjects();
            }
        },
        viewMachine(maintenanaceSheet) {
            this.$router.push(`/new-maintenance-sheet/${maintenanaceSheet.id}`);
        },
        editProduct(machine) {
            this.isView = false;
            this.machinesService.getOne(machine.id).then((data) => {
                this.machine = { ...data };
                this.productDialog = true;
            });

            this.sparePartService.getAllSparePart().then((data) => {
                this.sparePartItems = data;
                this.loadingSpareParts = false;
            });
        },
        confirmDelete(resource) {
            this.maintenanaceSheet = resource;
            this.deleteDialog = true;
        },
        deleteResource() {
            this.deleteDialog = false;
            this.maintenenaceSheetService.delete(this.maintenanaceSheet.id).then((data) => {
                this.machines = this.machines.filter((val) => val.id !== this.maintenanaceSheet.id);
                this.resource = {};
                this.$toast.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: data.message,
                    life: 3000
                });
            });
        },
        findIndexById(id) {
            let index = -1;
            for (let i = 0; i < this.machines.length; i++) {
                if (this.machines[i].id === id) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        findSparePartsIndexById(id) {
            let index = -1;
            for (let i = 0; i < this.machine.articles.length; i++) {
                if (this.machine.articles[i].id === id) {
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
        /*
    exportCSV() {
      this.$refs.dt.exportCSV();
    },*/
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

        addSparePart() {
            this.submittedAddSparePart = true;
            if (this.validateFormSparePart()) {
                if (this.findSparePartsIndexById(this.sparePartItem.id) === -1) {
                    // INSERT DATA
                    this.spare_Part = { ...this.spare_Part, ...this.sparePartItem };
                    // console.log(this.spare_Part);
                    this.machine.articles.unshift(this.spare_Part);
                } else {
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Ooops!',
                        detail: 'spare part already exists in the list.',
                        life: 3000
                    });
                }
                // RESERT DATA
                this.spare_Part = {};
                this.sparePartItem = null;
                this.submittedAddSparePart = false;
            }
        },

        validateFormMachine() {
            // return true;
            return this.machine.serie_number && this.machine.name && this.machine.brand && this.machine.model && this.machine.maximum_working_time;
        },
        validateFormSparePart() {
            return true;
            //this.sparePartItem;
        },
        removeSparePart(data) {
            this.machine.articles = this.machine.articles.filter((val) => val.id !== data.id);
        },
        getImage(path) {
            // console.log(path)
            return `${process.env.VUE_APP_API_HOST}/storage/${path}`;
        },
        getPDF(data) {
            this.maintenenaceSheetService.reportOne(data.id).then((data) => {
                // console.log(data)
                this.viewPDF(data.path);
                // this.loadingMachines = false;
            });
        },
        viewPDF(path) {
            // console.log(data)
            let uri = `${process.env.VUE_APP_API_HOST}/storage/${path}`;
            window.open(uri);
            // return `${process.env.VUE_APP_API_HOST}/storage/${path}`;
        },
        initFilters() {
            this.filters = {
                global: { value: null, matchMode: FilterMatchMode.CONTAINS }
            };
        },
        defaultObjects() {
            this.machine = {
                serie_number: null,
                name: null,
                brand: null,
                model: null,
                maximum_working_time: null,
                image: null,
                articles: []
            };
        }
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card p-fluid">
                <div class="flex flex-column align-items-center">
                    <h3 class="text-900 font-medium">{{ $t('maintenance_sheets') }}</h3>
                </div>
            </div>
        </div>
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="fiel grid">
                            <div style="vertical-align: inherit" class="px-2">
                                <label for="name1">{{ $t('from_the') }}</label>
                                <Calendar :showIcon="true" :showButtonBar="false" v-model="start_date" :maxDate="minDateValue" dateFormat="yy-mm-dd"></Calendar>
                            </div>
                            <div style="vertical-align: inherit" class="px-2">
                                <label for="name1">{{ $t('until_the') }}</label>
                                <Calendar :showIcon="true" :showButtonBar="false" v-model="end_date" :maxDate="minDateValue" dateFormat="yy-mm-dd"></Calendar>
                            </div>
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button :label="$t('new_maintenance')" icon="pi pi-sliders-h" class="p-button-success mr-2" @click="nextPage" />
                        <!--@click="exportCSV($event)"-->
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="machines"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} maitenance sheets"
                    responsiveLayout="scroll"
                    :loading="loadingMachines"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">{{ $t('list_maintenance_sheets') }}</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" :placeholder="$t('search')" />
                            </span>
                        </div>
                    </template>

                    <Column field="code" :header="$t('code')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.code }}
                        </template>
                    </Column>

                    <Column field="date" :header="$t('date')" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Date</span>
                            {{ slotProps.data.date }}
                        </template>
                    </Column>

                    <Column field="machine.name" :header="$t('machine')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Machine</span>
                            {{ slotProps.data.machine.name }}
                        </template>
                    </Column>

                    <Column field="machine.model" :header="$t('model')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Model</span>
                            {{ slotProps.data.machine.model }}
                        </template>
                    </Column>

                    <Column field="machine.brand" :header="$t('brand')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Brand</span>
                            {{ slotProps.data.machine.brand }}
                        </template>
                    </Column>

                    <Column :header="$t('image')" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Image</span>
                            <img :src="slotProps.data.machine.image ? getImage(slotProps.data.machine.image) : imageDefault" :alt="'machine'" class="shadow-2" width="100" height="100" />
                        </template>
                    </Column>

                    <Column field="maintenance_type.name" :header="$t('maintenance_type')" :sortable="true" headerStyle="width:14%; min-width:9rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Maintenance Type</span>
                            {{ slotProps.data.maintenance_type.name }}
                        </template>
                    </Column>

                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <div style="display: flex; justify-content: end">
                                <Button icon="pi pi-eye" class="p-button-rounded p-button-info mr-2" @click="viewMachine(slotProps.data)" />
                                <Button icon="pi pi-file-pdf" class="p-button-rounded p-button-success mr-2" @click="getPDF(slotProps.data)" />
                                <!--<Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-warning mr-2"
                  @click="editProduct(slotProps.data)"
                />-->
                                <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDelete(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" :header="$t('confirm')" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="resource"
                            >{{ $t('delete') }} <b>{{ maintenanaceSheet.code }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteResource" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete the selected products?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteResource" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/badges.scss';
</style>
