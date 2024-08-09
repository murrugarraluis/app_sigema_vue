<script>
import { FilterMatchMode } from '@primevue/core/api';
import MachinesService from '@/service/MachinesService';
import ArticlesService from '@/service/ArticlesService';
import ImageService from '@/service/ImageService';
import FileService from '@/service/FileService';

export default {
    data() {
        return {
            // apiHost: "https://stormy-tundra-82595.herokuapp.com/storage/",
            machines: null,
            productDialog: false,
            recommendationDialog: false,
            deleteDialog: false,
            deleteProductsDialog: false,
            machine: {
                serie_number: null,
                name: null,
                brand: null,
                model: null,
                maximum_working_time: null,
                maximum_working_time_per_day: null,
                image: null,
                recommendation: null,
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
                { field: 'serie_number', header: this.$t('serial_number') },
                { field: 'name', header: this.$t('name') }
            ],

            sparePartItem: null,
            sparePartItems: null,
            image: null,
            file: null,
            imageDefault: 'https://via.placeholder.com/600x400',
            loadingMachines: true,
            isView: false
        };
    },
    machinesService: null,
    sparePartService: null,
    imageService: null,
    fileService: null,
    created() {
        this.machinesService = new MachinesService();
        this.sparePartService = new ArticlesService();
        this.imageService = new ImageService();
        this.fileService = new FileService();
        this.initFilters();
    },
    mounted() {
        this.machinesService.getAll().then((data) => {
            this.machines = data;
            this.loadingMachines = false;
        });
        this.sparePartService.getAll().then((data) => (this.sparePartItems = data));
    },
    methods: {
        getStatusLabel(status) {
            switch (status) {
                case 'operating':
                    return 'success';

                case 'available':
                    return 'info';
                default:
                    return 'danger';
            }
        },
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
            this.submittedAddSparePart = false;
        },
        hideDialog() {
            this.defaultObjects();
            this.productDialog = false;
            this.submitted = false;
            this.submittedAddSparePart = false;
        },
        async saveProduct() {
            this.submitted = true;
            if (this.validateFormMachine()) {
                this.productDialog = false;
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
                            summary: this.$t('successful'),
                            detail: this.$t('machine') + ' ' + this.$t('updated_a'),
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
                            summary: this.$t('successful'),
                            detail: this.$t('machine') + ' ' + this.$t('created_a'),
                            life: 3000
                        });
                    });
                }

                this.defaultObjects();
            }
        },
        recommendationMachine(machine) {
            this.recommendationDialog = true;
            this.machine = machine;
            /*this.machinesService.getOne(machine.id).then((data) => {
        this.machine = { ...data };
        this.recommendationDialog = true;
      });*/
        },
        viewMachine(machine) {
            this.isView = true;
            this.machinesService.getOne(machine.id).then((data) => {
                this.machine = { ...data };
                this.productDialog = true;
            });
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
            this.resource = resource;
            this.deleteDialog = true;
        },
        deleteResource() {
            this.deleteDialog = false;
            this.machinesService.delete(this.resource.id).then(() => {
                this.machines = this.machines.filter((val) => val.id !== this.resource.id);
                this.resource = {};
                this.$toast.add({
                    severity: 'success',
                    summary: this.$t('successful'),
                    detail: this.$t('machine') + ' ' + this.$t('deleted_a'),
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
                        summary: this.$t('oops'),
                        detail: this.$t('toast_spare_parts_machine'),
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
            return this.machine.serie_number && this.machine.name && this.machine.brand && this.machine.model && this.machine.maximum_working_time && this.machine.recommendation && this.machine.maximum_working_time_per_day;
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
            if (path.includes('http')) {
                return path;
            }
            return `${import.meta.env.VITE_APP_API_HOST}/storage/${path}`;
        },
        viewPDF() {
            let uri = `${import.meta.env.VITE_APP_API_HOST}/storage/${this.machine.technical_sheet}`;
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
                recommendation: null,
                maximum_working_time_per_day: null,
                image: null,
                articles: []
            };
        }
    }
};
</script>

<template>
    <div>
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template #start>
                        <Button :label="$t('new')" icon="pi pi-plus" severity="primary" class="mr-2" @click="openNew" />
                    </template>
                    <template #end>
                        <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
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
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} machines"
                    :loading="loadingMachines"
                >
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h5 class="font-bold text-xl text-primary m-0">{{ $t('machines') }}</h5>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" :placeholder="$t('search')" />
                            </IconField>
                        </div>
                    </template>
                    <Column field="serie_number" :header="$t('serial_number')" :sortable="true" headerStyle="width:14%; min-width:12rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.serie_number }}
                        </template>
                    </Column>
                    <Column field="name" :header="$t('name')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column field="brand" :header="$t('brand')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.brand }}
                        </template>
                    </Column>

                    <Column field="model" :header="$t('model')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.model }}
                        </template>
                    </Column>

                    <Column :header="$t('image')" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <img :src="slotProps.data.image ? getImage(slotProps.data.image) : imageDefault" :alt="'machine'" class="shadow-2" width="100" height="100" />
                        </template>
                    </Column>

                    <Column field="maximum_working_time_per_day" :header="$t('daily_working_hours')" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.maximum_working_time_per_day }}
                        </template>
                    </Column>

                    <Column field="maximum_working_time" :header="$t('useful_life_hours')" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.maximum_working_time }}
                        </template>
                    </Column>
                    <Column field="status" :header="$t('status')" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <Tag :value="$t(slotProps.data.status)" :severity="getStatusLabel(slotProps.data.status)" />
                        </template>
                    </Column>

                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <div class="flex justify-end items-center">
                                <Button outlined rounded severity="success" icon="pi pi-question" class="mr-2" @click="recommendationMachine(slotProps.data)" />
                                <Button outlined rounded severity="info" icon="pi pi-eye" class="mr-2" @click="viewMachine(slotProps.data)" />
                                <Button outlined rounded severity="warn" icon="pi pi-pencil" class="mr-2" @click="editProduct(slotProps.data)" />
                                <Button outlined rounded severity="danger" icon="pi pi-trash" class="" @click="confirmDelete(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
            <Dialog v-model:visible="recommendationDialog" :style="{ width: '550px' }" :header="$t('recommendation_title')" :modal="true">
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="description" class="block font-bold mb-3">{{ $t('recommendationDialog') }}</label>
                        <Textarea id="description" v-model="machine.recommendation" required="true" fluid readonly="true" autocomplete="off" rows="3" cols="60" :autoResize="true" />
                    </div>
                </div>

                <template #footer>
                    <Button label="Entendido" icon="pi pi-check" class="p-button-text" @click="recommendationDialog = false" />
                </template>
            </Dialog>
            <Dialog v-model:visible="productDialog" :style="{ width: '950px' }" :header="!machine.id ? $t('new_machine') : !isView ? $t('edit_machine') : $t('inf_machine')" :modal="true">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-10">
                    <div class="col-span-1 md:col-span-7">
                        <div class="flex flex-col gap-4">
                            <div>
                                <label for="serie_number" class="block font-bold mb-3">{{ $t('serial_number') }}</label>
                                <InputText id="serie_number" v-model.trim="machine.serie_number" autofocus :readonly="isView" :invalid="submitted && !machine.serie_number" autocomplete="off" fluid required="true" />
                                <small class="p-invalid" v-if="submitted && !machine.serie_number">{{ $t('serial_number_alert') }}</small>
                            </div>

                            <div class="">
                                <label for="name" class="block font-bold mb-3">{{ $t('name') }}</label>
                                <InputText id="name" v-model.trim="machine.name" required="true" autofocus :invalid="submitted && !machine.name" :readonly="isView" autocomplete="off" fluid />
                                <small class="p-invalid" v-if="submitted && !machine.name">{{ $t('name_alert') }}</small>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label for="brand" class="block font-bold mb-3">{{ $t('brand') }}</label>
                                    <InputText id="barnd" v-model.trim="machine.brand" required="true" autofocus :invalid="submitted && !machine.name" :readonly="isView" autocomplete="off" fluid />
                                    <small class="p-invalid" v-if="submitted && !machine.name">{{ $t('brand_alert') }}</small>
                                </div>
                                <div>
                                    <label for="model" class="block font-bold mb-3">{{ $t('model') }}</label>
                                    <InputText id="model" v-model.trim="machine.model" required="true" autofocus :invalid="submitted && !machine.name" :readonly="isView" autocomplete="off" fluid />
                                    <small class="p-invalid" v-if="submitted && !machine.name">{{ $t('model_alert') }}</small>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label for="maximum_working_time_per_day" class="block font-bold mb-3">{{ $t('daily_working_hours') }}</label>
                                    <InputNumber
                                        id="maximum_working_time_per_day"
                                        v-model="machine.maximum_working_time_per_day"
                                        showButtons
                                        mode="decimal"
                                        :readonly="isView"
                                        :min="0"
                                        :max="24"
                                        :useGrouping="false"
                                        :invalid="submitted && !machine.maximum_working_time_per_day"
                                        fluid
                                    />
                                    <small class="p-invalid" v-if="submitted && !machine.maximum_working_time_per_day">{{ $t('daily_working_hours_alert') }}</small>
                                </div>

                                <div>
                                    <label for="maximum_working_time" class="block font-bold mb-3">{{ $t('useful_life_hours') }}</label>
                                    <InputNumber
                                        id="maximum_working_time"
                                        v-model="machine.maximum_working_time"
                                        showButtons
                                        mode="decimal"
                                        :readonly="isView"
                                        :invalid="submitted && !machine.maximum_working_time"
                                        :min="0"
                                        :useGrouping="false"
                                        fluid
                                    />
                                    <small class="p-invalid" v-if="submitted && !machine.maximum_working_time">{{ $t('useful_life_hours_alert') }}</small>
                                </div>
                            </div>

                            <div>
                                <label for="recommendation" class="block font-bold mb-3">{{ $t('recommendation_of_use') }}</label>
                                <Textarea id="recommendation" v-model.trim="machine.recommendation" required="true" autofocus rows="4" :invalid="submitted && !machine.recommendation" :readonly="isView" autocomplete="off" fluid />
                                <small class="p-invalid" v-if="submitted && !machine.recommendation">{{ $t('recommendation_of_use_alert') }}</small>
                            </div>
                            <Divider />
                            <div v-if="!isView">
                                <label for="sparePart" class="block font-bold mb-3">{{ $t('spare_part') }}</label>
                                <div>
                                    <InputGroup>
                                        <Dropdown
                                            id="sparePart"
                                            v-model="sparePartItem"
                                            :options="sparePartItems"
                                            optionLabel="name"
                                            :placeholder="$t('select_one')"
                                            :filter="true"
                                            :loading="loadingSpareParts"
                                            :invalid="submittedAddSparePart && !sparePartItem"
                                            fluid
                                        >
                                        </Dropdown>
                                        <Button icon="pi pi-plus" severity="primary" @click="addSparePart"></Button>
                                    </InputGroup>
                                </div>
                                <small class="p-invalid" v-if="submittedAddSparePart && !sparePartItem">{{ $t('spare_part_alert') }}</small>
                            </div>
                            <div>
                                <DataTable :value="machine.articles" responsiveLayout="scroll">
                                    <Column v-for="col of columns" :field="col.field" :header="col.header" :key="col.field" style="width: 70%"> </Column>

                                    <Column v-if="!isView" headerStyle="min-width:10rem;">
                                        <template #body="slotProps">
                                            <div style="display: flex; justify-content: end">
                                                <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" outlined @click="removeSparePart(slotProps.data)" />
                                            </div>
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </div>
                    </div>
                    <div class="col-span-1 md:col-span-5">
                        <div class="flex flex-col gap-4">
                            <div>
                                <label class="block font-bold mb-3">{{ $t('image') }}</label>
                                <div class="mb-2">
                                    <img
                                        id="blah"
                                        :src="!this.machine.image ? imageDefault : isFile(this.machine.image) ? getImageObjectUrl(this.machine.image) : getImage(this.machine.image)"
                                        :alt="this.machine.name"
                                        style="width: 100%; height: 300px; max-width: 450px; margin: 0 auto"
                                    />
                                </div>
                                <div v-if="!isView" class="w-full">
                                    <FileUpload class="w-full" mode="basic" accept="image/*" :disabled="isView" :maxFileSize="2000000" @input="onUploadImage" />
                                </div>
                            </div>
                            <div>
                                <label class="block font-bold mb-3">{{ $t('technical_sheet') }}</label>
                                <div v-if="machine.id && isView && machine.technical_sheet" class="w-full mb-2">
                                    <Button :label="$t('view_pdf')" icon="pi pi-arrow-up-right" class="p-button-info mr-2" @click="viewPDF" />
                                </div>
                                <div v-if="machine.id && isView && !machine.technical_sheet" class="w-full mb-2">
                                    <Message severity="info" :closable="false">{{ $t('without_pdf') }}</Message>
                                </div>
                                <div v-if="!isView" class="w-full">
                                    <FileUpload class="w-full" mode="basic" accept="application/pdf" :disabled="isView" :maxFileSize="2000000" @input="onUploadFile" />
                                </div>
                            </div>
                        </div>
                        <!-- </div> -->
                    </div>
                </div>

                <template #footer>
                    <Button :label="$t('cancel')" icon="pi pi-times" class="p-button-text p-button-danger" @click="hideDialog" />
                    <Button v-if="!isView" :label="$t('save')" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
                </template>
            </Dialog>
            <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" :header="$t('confirm')" :modal="true">
                <div class="flex align-items-center justify-content-center">
                    <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                    <span v-if="resource"
                        >{{ $t('delete') }} <b>{{ resource.name }}</b
                        >?</span
                    >
                </div>
                <template #footer>
                    <Button label="No" icon="pi pi-times" class="" severity="secondary" outlined @click="deleteDialog = false" />
                    <Button :label="$t('yes')" icon="pi pi-check" class="" severity="danger" @click="deleteResource" />
                </template>
            </Dialog>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/badges.scss';
</style>
