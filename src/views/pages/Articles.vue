<script>
import { FilterMatchMode } from '@primevue/core/api';
import ArticlesService from '@/service/ArticlesService';
import ArticleTypesService from '@/service/ArticleTypesService';
import SupplierService from '@/service/SupplierService';

import ImageService from '@/service/ImageService';
import FileService from '@/service/FileService';

export default {
    data() {
        return {
            articles: null,
            articlesAll: null,
            productDialog: false,
            deleteDialog: false,
            deleteProductsDialog: false,
            article: {
                // serie_number: null,
                //image: null,
                // technical_sheet:null,
                name: null,
                brand: null,
                model: null,
                quantity: null,
                article_type: null,
                suppliers: []
            },
            supplier_ref: {
                id: null,
                name: null,
                price: null
            },
            product: {},
            resource: {}, // One Resource Articles
            selectedProducts: null,
            filters: {},
            filter: null,
            submitted: false,
            message: null,

            // loading: false,
            loadingArticleTypes: true,
            loadingSuppliers: true,

            statuses: [
                { label: 'INSTOCK', value: 'instock' },
                { label: 'LOWSTOCK', value: 'lowstock' },
                { label: 'OUTOFSTOCK', value: 'outofstock' }
            ],
            submittedAddSuppliersRef: false,
            columns: [
                { field: 'name', header: this.$t('supplier') },
                { field: 'price', header: this.$t('price') }
            ],
            articleTypeItem: null,
            supplierRefItem: null,

            articleTypeItems: null,
            supplierRefItems: null,
            loadingArticles: true,
            isView: false,

            articleTypeFilterItems: null,
            loadingArticleTypesFilter: true,

            imageDefault: 'https://via.placeholder.com/450x450'
        };
    },

    articlesService: null,
    articleTypeService: null,
    supplierRefService: null,
    imageService: null,
    fileService: null,
    created() {
        this.articlesService = new ArticlesService();
        this.articleTypeService = new ArticleTypesService();
        this.supplierRefService = new SupplierService();
        this.imageService = new ImageService();
        this.fileService = new FileService();
        this.initFilters();
    },
    mounted() {
        //this.loading = true;
        this.articlesService.getAll().then((data) => {
            this.articles = data;
            this.articlesAll = data;
            this.loadingArticles = false;
        });
        this.articleTypeService.getAll().then((data) => {
            this.articleTypeFilterItems = data;
            this.articleTypeFilterItems.unshift({
                id: 1,
                name: 'All'
            });
            this.loadingArticleTypesFilter = false;
            this.filter = {
                id: 1,
                name: 'All'
            };
        });
        this.supplierRefService.getAll().then((data) => (this.supplierRefItems = data));
        //this.loading = false;
    },
    methods: {
        formatCurrency(value) {
            if (value)
                return value.toLocaleString('es-PE', {
                    style: 'currency',
                    currency: 'PER'
                });
            return;
        },
        openNew() {
            this.isView = false;
            this.defaultObjects();
            this.articleTypeService.getAll().then((data) => {
                this.articleTypeItems = data;
                this.loadingArticleTypes = false;
            });
            this.supplierRefService.getAll().then((data) => {
                this.supplierRefItems = data;
                this.loadingSuppliers = false;
            });
            this.resource = {};
            this.submitted = false;
            this.productDialog = true;
            this.submittedAddSuppliersRef = false;
        },
        hideDialog() {
            this.defaultObjects();
            this.submittedAddSuppliersRef = false;
            this.productDialog = false;
            this.submitted = false;
        },
        async saveProduct() {
            this.submitted = true;

            if (this.validateFormArticle()) {
                if (this.article.id) {
                    if (this.isFile(this.article.image)) {
                        let formdataImage = new FormData();
                        formdataImage.append('image', this.article.image, this.article.image.name);
                        await this.imageService.upload(formdataImage).then((data) => {
                            // console.log('Hola')
                            this.article.image = data.path;
                        });
                    }
                    if (this.isFile(this.article.technical_sheet)) {
                        let formdataFile = new FormData();
                        formdataFile.append('file', this.article.technical_sheet, this.article.technical_sheet);
                        await this.fileService.upload(formdataFile).then((data) => {
                            this.article.technical_sheet = data.path;
                        });
                    }
                    const payload = this.article;
                    // console.log(payload)
                    //UPDATE
                    this.articlesService.update(this.article.id, payload).then((data) => {
                        this.articles[this.findIndexById(data.data.id)] = data.data;
                        this.articlesAll[this.findIndexById(data.data.id)] = data.data;
                        this.$toast.add({
                            severity: 'success',
                            summary: this.$t('successful'),
                            detail: this.$t('article') + ' ' + this.$t('updated'),
                            life: 3000
                        });
                    });
                } else {
                    // CREATE

                    if (this.isFile(this.article.image)) {
                        let formdataImage = new FormData();
                        formdataImage.append('image', this.article.image, this.article.image.name);
                        await this.imageService.upload(formdataImage).then((data) => {
                            this.article.image = data.path;
                        });
                    }
                    if (this.isFile(this.article.technical_sheet)) {
                        let formdataFile = new FormData();
                        formdataFile.append('file', this.article.technical_sheet, this.article.technical_sheet);
                        await this.fileService.upload(formdataFile).then((data) => {
                            this.article.technical_sheet = data.path;
                        });
                    }
                    const payload = this.article;
                    console.log(payload);
                    //payload.image="...";
                    this.articlesService.create(payload).then((data) => {
                        this.articles.unshift(data.data);
                        this.articlesAll.unshift(data.data);
                        this.$toast.add({
                            severity: 'success',
                            summary: this.$t('successful'),
                            detail: this.$t('article') + ' ' + this.$t('created'),
                            life: 3000
                        });
                    });
                }
                this.productDialog = false;
                this.defaultObjects();
            }
        },
        viewArticles(article) {
            this.isView = true;
            this.articlesService.getOne(article.id).then((data) => {
                this.article = { ...data };
                this.productDialog = true;
            });
            this.articleTypeService.getAll().then((data) => {
                this.articleTypeItems = data;
                this.loadingArticleTypes = false;
            });
        },
        editProduct(article) {
            this.isView = false;
            this.articlesService.getOne(article.id).then((data) => {
                this.article = { ...data };
                this.productDialog = true;
                this.loadingSuppliers = false;
            });
            this.articleTypeService.getAll().then((data) => {
                this.articleTypeItems = data;
                this.loadingArticleTypes = false;
            });
        },
        confirmDelete(resource) {
            this.resource = resource;
            this.deleteDialog = true;
        },
        deleteResource() {
            this.deleteDialog = false;
            this.articlesService.delete(this.resource.id).then(() => {
                this.articles = this.articles.filter((val) => val.id !== this.resource.id);

                this.articlesAll = this.articlesAll.filter((val) => val.id !== this.resource.id);

                this.resource = {};
                this.$toast.add({
                    severity: 'success',
                    summary: this.$t('successful'),
                    detail: this.$t('article') + ' ' + this.$t('deleted'),
                    life: 3000
                });
            });
        },
        findIndexById(id) {
            let index = -1;
            for (let i = 0; i < this.articles.length; i++) {
                if (this.articles[i].id === id) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        findSupplierRefIndexById(id) {
            let index = -1;
            for (let i = 0; i < this.article.suppliers.length; i++) {
                if (this.article.suppliers[i].id === id) {
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
        addSpullierRef() {
            this.submittedAddSuppliersRef = true;
            if (this.validateFormSupplierRef()) {
                if (this.findSupplierRefIndexById(this.supplierRefItem.id) === -1) {
                    // INSERT DATA
                    this.supplier_ref = { ...this.supplier_ref, ...this.supplierRefItem };
                    this.article.suppliers.push(this.supplier_ref);
                } else {
                    this.$toast.add({
                        severity: 'error',
                        summary: this.$t('oops'),
                        detail: 'supplier already exists in the list.',
                        life: 3000
                    });
                }
                // RESERT DATA
                this.supplier_ref = {};
                this.supplierRefItem = null;
                this.submittedAddSuppliersRef = false;
            }
        },
        validateFormArticle() {
            return this.article.article_type && this.article.name && this.article.brand && this.article.model && this.article.quantity;
        },
        validateFormSupplierRef() {
            return this.supplierRefItem && this.supplier_ref.price;
        },
        removeSupplierRef(data) {
            this.article.suppliers = this.article.suppliers.filter((val) => val.id !== data.id);
        },
        getImage(path) {
            return `${process.env.VUE_APP_API_HOST}/storage/${path}`;
        },
        isFile(value) {
            if (value) {
                return typeof value === 'object';
            }
            return false;
        },
        getImageObjectUrl(file) {
            return URL.createObjectURL(file);
        },
        onUploadImage(event) {
            const [file] = event.target.files;
            if (file && file.size < 2000000) {
                this.article.image = file;
            }
        },
        onUploadFile(event) {
            const [file] = event.target.files;
            if (file && file.size < 2000000) {
                this.article.technical_sheet = file;
            }
        },
        viewPDF() {
            let uri = `${process.env.VUE_APP_API_HOST}/storage/${this.article.technical_sheet}`;
            window.open(uri);
            // return `${process.env.VUE_APP_API_HOST}/storage/${path}`;
        },
        filterByArticleType(data) {
            let article_type = data.value;
            this.loadingArticles = true;
            this.articles = this.articlesAll.filter((val) => val.article_type.id === article_type.id);
            if (article_type.id === 1) this.articles = this.articlesAll;
            this.loadingArticles = false;
        },
        initFilters() {
            this.filters = {
                global: { value: null, matchMode: FilterMatchMode.CONTAINS }
            };
        },
        defaultObjects() {
            this.article = {
                // serie_number: null,
                //image: null,
                // technical_sheet:null,
                name: null,
                brand: null,
                model: null,
                quantity: null,
                article_type: null,
                suppliers: []
            };
            this.supplier_ref = {
                id: null,
                name: null,
                price: null
            };
            this.supplierRefItem = null;
        }
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card p-fluid">
                <div class="flex flex-column align-items-center">
                    <h3 class="text-900 font-medium">{{ $t('inventory') }}</h3>
                </div>
            </div>
        </div>
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
                    :value="articles"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll"
                    :loading="loadingArticles"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <div class="field col-12 sm:col-6">
                                <h6 class="m-0">
                                    {{ $t('filter_by') }}
                                    <Dropdown
                                        id="state"
                                        v-model="filter"
                                        :options="articleTypeFilterItems"
                                        optionLabel="name"
                                        :placeholder="$t('select_one')"
                                        :filter="false"
                                        :loading="loadingArticleTypesFilter"
                                        @change="filterByArticleType"
                                    ></Dropdown>
                                </h6>
                            </div>
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

                    <Column field="serie_number" :header="$t('serial_number')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Serie Number</span>
                            {{ slotProps.data.serie_number }}
                        </template>
                    </Column>
                    <Column field="model" :header="$t('model')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Model</span>
                            {{ slotProps.data.model }}
                        </template>
                    </Column>
                    <Column field="brand" :header="$t('brand')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Brand</span>
                            {{ slotProps.data.brand }}
                        </template>
                    </Column>
                    <Column :header="$t('image')" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Image</span>
                            <img :src="slotProps.data.image ? getImage(slotProps.data.image) : imageDefault" :alt="'machine'" class="shadow-2" width="100" height="100" />
                        </template>
                    </Column>
                    <Column field="quantity" :header="$t('quantity')" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Quantity</span>
                            {{ slotProps.data.quantity }}
                        </template>
                    </Column>

                    <Column field="article_type.name" :header="$t('article_type')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Article Type</span>
                            {{ slotProps.data.article_type.name }}
                        </template>
                    </Column>

                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <div style="display: flex; justify-content: end">
                                <Button icon="pi pi-eye" class="p-button-rounded p-button-info mr-2" @click="viewArticles(slotProps.data)" />
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-warning mr-2" @click="editProduct(slotProps.data)" />
                                <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDelete(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="productDialog" :style="{ width: '1000px' }" :header="!article.id ? $t('new_article') : !isView ? $t('edit_article') : $t('inf_article')" :modal="true" class="p-fluid">
                    <div class="formgrid grid">
                        <div class="col-8">
                            <div class="card mb-4">
                                <div class="formgrid grid">
                                    <div class="field col">
                                        <label for="serialNumber">{{ $t('serial_number') }}</label>
                                        <InputText
                                            id="serialNumber"
                                            v-model.trim="article.serie_number"
                                            required="true"
                                            :readonly="isView"
                                            autofocus
                                            :class="{
                                                'p-invalid': submitted && !article.serie_number
                                            }"
                                        />
                                        <small class="p-invalid" v-if="submitted && !article.serie_number">{{ $t('serial_number_alert') }}</small>
                                    </div>

                                    <div class="field col">
                                        <label for="name">{{ $t('name') }}</label>
                                        <InputText id="name" v-model.trim="article.name" required="true" autofocus :readonly="isView" autocomplete="off" :class="{ 'p-invalid': submitted && !article.name }" />
                                        <small class="p-invalid" v-if="submitted && !article.name">{{ $t('name_alert') }}</small>
                                    </div>
                                </div>

                                <div class="formgrid grid">
                                    <div class="field col">
                                        <label for="brand">{{ $t('brand') }}</label>
                                        <InputText id="brand" v-model.trim="article.brand" required="true" autofocus :readonly="isView" :class="{ 'p-invalid': submitted && !article.brand }" />
                                        <small class="p-invalid" v-if="submitted && !article.brand">{{ $t('brand_alert') }}</small>
                                    </div>

                                    <div class="field col">
                                        <label for="model">{{ $t('model') }}</label>
                                        <InputText id="model" v-model.trim="article.model" required="true" autofocus :readonly="isView" :class="{ 'p-invalid': submitted && !article.model }" />
                                        <small class="p-invalid" v-if="submitted && !article.model">{{ $t('model_alert') }}</small>
                                    </div>
                                </div>

                                <div class="formgrid grid">
                                    <div class="field col">
                                        <label for="quantity">{{ $t('quantity') }}</label>
                                        <InputNumber id="quantity" v-model="article.quantity" showButtons :readonly="isView" :min="0" :useGrouping="false" :class="{ 'p-invalid': submitted && !article.quantity }" />
                                        <small class="p-invalid" v-if="submitted && !article.quantity">{{ $t('quantity_alert') }}</small>
                                    </div>

                                    <div class="field col">
                                        <label for="articleType">{{ $t('article_type') }}</label>
                                        <Dropdown
                                            id="articleType"
                                            v-model="article.article_type"
                                            :options="articleTypeItems"
                                            optionLabel="name"
                                            :placeholder="$t('select_one')"
                                            :disabled="isView"
                                            :filter="true"
                                            :loading="loadingArticleTypes"
                                            :class="{
                                                'p-invalid': submitted && !article.article_type
                                            }"
                                        ></Dropdown>
                                        <small class="p-invalid" v-if="submitted && !article.article_type">{{ $t('article_type_alert') }}</small>
                                    </div>
                                </div>
                            </div>
                            <div class="card m-0">
                                <div v-if="!isView" class="formgrid grid">
                                    <div class="field col-7">
                                        <label for="supplierRef">{{ $t('supplier') }}</label>
                                        <Dropdown
                                            id="supplierRef"
                                            v-model="supplierRefItem"
                                            :options="supplierRefItems"
                                            optionLabel="name"
                                            :placeholder="$t('select_one')"
                                            :filter="true"
                                            :loading="loadingSuppliers"
                                            :class="{
                                                'p-invalid': submittedAddSuppliersRef && !supplierRefItem
                                            }"
                                        ></Dropdown>
                                        <small class="p-invalid" v-if="submittedAddSuppliersRef && !supplierRefItem">{{ $t('supplier_alert') }}</small>
                                    </div>

                                    <div class="field col-3">
                                        <label for="price">{{ $t('price') }}</label>
                                        <InputNumber
                                            id="price"
                                            v-model="supplier_ref.price"
                                            mode="currency"
                                            currency="PEN"
                                            locale="es-PE"
                                            :class="{
                                                'p-invalid': submittedAddSuppliersRef && !supplier_ref.price
                                            }"
                                        />
                                        <small class="p-invalid" v-if="submittedAddSuppliersRef && !supplier_ref.price">{{ $t('price_alert') }}</small>
                                    </div>
                                    <div class="field col-2 flex justify-content-center align-items-center">
                                        <Button icon="pi pi-plus" class="p-button-secondary" style="margin-top: 1.8rem" @click="addSpullierRef"></Button>
                                    </div>
                                </div>
                                <div class="card">
                                    <DataTable :value="article.suppliers" responsiveLayout="scroll">
                                        <Column v-for="col of columns" :field="col.field" :header="col.header" :key="col.field" style="width: 90%">
                                            <template #editor="{ data, field }">
                                                <InputNumber v-model="data[field]" mode="currency" currency="PEN" locale="es-PE" autofocus />
                                            </template>
                                        </Column>

                                        <Column v-if="!isView" headerStyle="min-width:10rem;">
                                            <template #body="slotProps">
                                                <div style="display: flex; justify-content: end">
                                                    <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="removeSupplierRef(slotProps.data)" />
                                                </div>
                                            </template>
                                        </Column>
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="card w-full h-full m-0">
                                <div class="mb-4">
                                    <h5>{{ $t('image') }}</h5>
                                    <div class="flex flex-column align-items-center justify-content-center">
                                        <div class="mb-2">
                                            <img
                                                id="blah"
                                                :disabled="isView"
                                                :src="!this.article.image ? imageDefault : isFile(this.article.image) ? getImageObjectUrl(this.article.image) : getImage(this.article.image)"
                                                alt="your image"
                                                style="width: 100%; height: 300px; max-width: 450px"
                                            />
                                        </div>
                                        <div v-if="!isView" class="w-full">
                                            <FileUpload class="w-full" mode="basic" name="demo[]" url="./upload.php" accept="image/*" :disabled="isView" :maxFileSize="2000000" @input="onUploadImage" />
                                        </div>
                                    </div>
                                </div>
                                <div class="">
                                    <h5>{{ $t('technical_sheet') }}</h5>
                                    <div v-if="article.id && isView && article.technical_sheet" class="w-full mb-2">
                                        <Button :label="$t('view_pdf')" icon="pi pi-arrow-up-right" class="p-button-info mr-2" @click="viewPDF" />
                                    </div>
                                    <div v-if="article.id && isView && !article.technical_sheet" class="w-full mb-2">
                                        <Message severity="info" :closable="false">{{ $t('without_pdf') }}</Message>
                                    </div>
                                    <div v-if="!isView" class="w-full">
                                        <FileUpload class="w-full" mode="basic" accept="application/pdf" :disabled="isView" :maxFileSize="2000000" @input="onUploadFile" />
                                    </div>
                                </div>
                            </div>
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
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteResource" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete the selected Articles?</span>
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
