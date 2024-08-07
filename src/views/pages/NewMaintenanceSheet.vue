<script>
import { FilterMatchMode } from '@primevue/core/api';
import MachinesService from '@/service/MachinesService';
import ArticleTypesService from '@/service/ArticleTypesService';
import ArticlesService from '@/service/ArticlesService';
import SupplierService from '@/service/SupplierService';
import MaintenanceTypeService from '@/service/MaintenanceTypeService';
import MaintenenaceSheetService from '@/service/MaintenenceSheetService';
import moment from 'moment';

export default {
    data() {
        return {
            maintenanceSheet: {
                date: null,
                responsible: null,
                technical: null,
                maximum_working_time: null,
                description: null,
                maintenance_type: null,
                ref_invoice_number: null,
                supplier: null,
                machine: {},
                detail: []
            },
            submittedMaintenanceSheet: false,
            dropdownItems: [
                { name: 'Option 1', code: 'Option 1' },
                { name: 'Option 2', code: 'Option 2' },
                { name: 'Option 3', code: 'Option 3' }
            ],
            machines: [],
            articles: [],
            machineDialog: false,
            addSparePartDialog: false,
            addServiceDialog: false,
            loadingMachines: true,
            loadingArticles: true,
            loadingArticleTypesFilter: true,
            imageDefault: 'https://via.placeholder.com/150x180',
            dropdownItem: null,
            minDateValue: new Date(),
            editingRows: [],
            columnsDetailGeneral: null,
            columnsDetailSparePart: null,
            columnsDetailService: null,
            products1: null,
            products2: null,
            products3: null,
            statuses: [
                { label: 'In Stock', value: 'INSTOCK' },
                { label: 'Low Stock', value: 'LOWSTOCK' },
                { label: 'Out of Stock', value: 'OUTOFSTOCK' }
            ],
            filters: {
                code: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
                name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
                quantity: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
                price: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
            },

            service: {
                description: null,
                price: null
            },
            submittedAddService: false,
            listService: [],

            article: {
                serie_number: null,
                name: null,
                brand: null,
                model: null,
                quantity: null,
                price: 0
            },
            submittedAddArticle: false,
            listArticles: [],

            articleTypeFilterItems: null,

            supplierItems: null,
            supplierItemsLoading: true,
            maintenanceTypeItems: null,
            maintenanceTypeItemsLoading: true
        };
    },
    machineService: null,
    articleService: null,
    articleTypeService: null,
    supplierService: null,
    maintenanceTypeService: null,
    maintenanceSheetService: null,
    created() {
        this.initFilters();
        this.machineService = new MachinesService();
        this.articleService = new ArticlesService();
        this.articleTypeService = new ArticleTypesService();
        this.supplierService = new SupplierService();
        this.maintenanceTypeService = new MaintenanceTypeService();
        this.maintenanceSheetService = new MaintenenaceSheetService();
        this.columnsDetailGeneral = [
            { field: 'serie_number', header: 'Serie' },
            { field: 'description', header: 'Description' },
            { field: 'price', header: 'Price', mode: 'currency', currency: 'PEN' },
            { field: 'quantity', header: 'Quantity' },
            { field: 'quantity', header: 'Import' }
        ];
        this.columnsDetailSparePart = [
            { field: 'serie_number', header: 'Serie' },
            { field: 'name', header: 'Name' },
            { field: 'price', header: 'Price', mode: 'currency', currency: 'PEN' },
            { field: 'quantity', header: 'Quantity' },
            { field: 'import', header: 'Import' }
        ];
        this.columnsDetailService = [
            { field: 'description', header: 'Description' },
            { field: 'price', header: 'Price', mode: 'currency', currency: 'PEN' }
            // {field: "quantity", header: "Import"},
        ];
    },
    mounted() {
        let sheet = this.$route.params;
        // console.log(sheet);
        if (sheet.id) {
            this.maintenanceSheetService.getOne(sheet.id).then((data) => {
                this.maintenanceSheet = data;
                // console.log(this.workSheet);
            });
        }

        this.submittedMaintenanceSheet = false;
        this.supplierService.getAll().then((data) => {
            this.supplierItems = data;
            this.supplierItemsLoading = false;
        });
        this.maintenanceTypeService.getAll().then((data) => {
            this.maintenanceTypeItems = data;
            this.maintenanceTypeItemsLoading = false;
        });
    },
    computed: {
        totalDetailImport() {
            let total = 0;
            for (let item of this.maintenanceSheet.detail) {
                total += item.price * item.quantity;
            }
            return total.toFixed(2);
        }
    },
    methods: {
        openNewSelectMachine() {
            this.machineDialog = true;
            //  SET DATA
            this.loadingMachines = true;
            this.machineService.getAll().then((data) => {
                this.machines = data;
                this.loadingMachines = false;
            });
        },
        openNewAddSparePart() {
            this.product = {};
            this.submitted = false;
            this.submittedAddArticle = false;
            this.addSparePartDialog = true;
            // console.log(this.articles === [])
            if (!this.articles.length) {
                this.loadingArticles = true;
                this.articleService.getAll().then((data) => {
                    this.articles = data;
                    this.articlesAll = data;
                    this.loadingArticles = false;
                });
            }
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
        },
        openNewAddService() {
            this.submittedAddService = false;
            this.product = {};
            this.submitted = false;
            this.addServiceDialog = true;
        },
        onCellEditComplete(event) {
            let { data, newValue, field } = event;

            switch (field) {
                case 'quantity':
                case 'price':
                    data[field] = newValue;
                    break;

                default:
                    if (newValue.trim().length > 0) data[field] = newValue;
                    else event.preventDefault();
                    break;
            }
        },
        isPositiveInteger(val) {
            let str = String(val);
            str = str.trim();
            if (!str) {
                return false;
            }
            str = str.replace(/^0+/, '') || '0';
            var n = Math.floor(Number(str));
            return n !== Infinity && String(n) === str && n >= 0;
        },
        onRowEditSave(event) {
            let { newData, index } = event;

            this.products2[index] = newData;
        },
        getStatusLabel(status) {
            switch (status) {
                case 'INSTOCK':
                    return 'In Stock';

                case 'LOWSTOCK':
                    return 'Low Stock';

                case 'OUTOFSTOCK':
                    return 'Out of Stock';

                default:
                    return 'NA';
            }
        },
        getImage(path) {
            // console.log(path)
            return `${process.env.VUE_APP_API_HOST}/storage/${path}`;
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
        selectMachine(value) {
            this.machineService.getOne(value.id).then((data) => {
                this.maintenanceSheet.machine = { ...data };
                this.machineDialog = false;
            });
        },
        backPage() {
            this.$router.push(`/maintenance-sheet`);
        },
        addService() {
            this.submittedAddService = true;
            //  TODO:VALIDATE FIELDS EMPTY
            if (this.validateAddService()) {
                this.service.quantity = 1;
                this.listService.push(this.service);
                this.service = {};
                this.submittedAddService = false;
            }
        },
        validateAddService() {
            return this.service.description && this.service.price;
        },
        pushDistinct() {
            const distinct = (value, index, self) => {
                return self.indexOf(value) === index;
            };
            this.maintenanceSheet.detail = this.maintenanceSheet.detail.filter(distinct);
        },
        addServiceInDetail() {
            //  TODO:VALIDATE FIELDS EMPTY TABLE
            // console.log(this.listService);
            this.listService.map((service) => this.maintenanceSheet.detail.push(service));
            this.pushDistinct();

            this.addServiceDialog = false;
        },
        setArticle(value) {
            this.article = {
                id: value.id,
                serie_number: value.serie_number,
                name: value.name,
                brand: value.brand,
                model: value.model,
                description: null,
                price: 0
            };
            this.article.article = {
                id: value.id,
                serie_number: value.serie_number,
                name: value.name,
                brand: value.brand,
                model: value.model,
                quantity: value.quantity
            };
        },
        addArticle() {
            this.submittedAddArticle = true;
            //  TODO:VALIDATE FIELDS EMPTY
            if (this.validateAddArticle()) {
                // this.service.quantity = 1;
                if (!this.article.id) {
                    this.article.description = this.article.name;
                }
                if (this.article.article) {
                    if (this.article.quantity <= this.article.article.quantity) {
                        //console.log(this.article);
                        this.discountStock(this.article);
                        this.listArticles.push(this.article);
                        // console.log("hihihih");
                        this.article = {
                            id: null,
                            serie_number: null,
                            name: null,
                            brand: null,
                            model: null,
                            quantity: null,
                            price: 0
                        };
                    } else {
                        this.$toast.add({
                            severity: 'error',
                            summary: this.$t('warning'),
                            detail: this.$t('toast_new_maintenance_stock'),
                            life: 3000
                        });
                    }
                } else {
                    this.listArticles.push(this.article);
                    this.article = {
                        serie_number: null,
                        name: null,
                        brand: null,
                        model: null,
                        quantity: null,
                        price: 0
                    };
                }

                this.submittedAddArticle = false;
            }
        },
        discountStock(article) {
            let index = this.findIndexArticlesById(article.id);
            if (index > -1) {
                this.articles[index].quantity -= article.quantity;
            }
            // console.log(article.id)
        },
        incrementStock(article) {
            let index = this.findIndexArticlesById(article.id);
            if (index > -1) {
                this.articles[index].quantity += article.quantity;
            }
            // console.log(article.id)
        },
        findIndexArticlesById(id) {
            let index = -1;
            for (let i = 0; i < this.articles.length; i++) {
                if (this.articles[i].id === id) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        validateAddArticle() {
            //console.log(this.article.price);
            return (
                this.article.serie_number && this.article.name && this.article.brand && this.article.model && this.article.quantity && this.article.price !== null
                // this.article.price >= 0
            );
        },
        removeAddArticle(data) {
            /*console.log(data);
      console.log(this.listArticles.indexOf(data));*/
            // console.log(data)
            const index = this.listArticles.indexOf(data);
            if (index > -1) {
                // only splice array when item is found
                this.listArticles.splice(index, 1); // 2nd parameter means remove one item only
                this.incrementStock(data);
            }

            /*this.listArticles = this.listArticles.filter(
        (val) => val.name !== data.name
      );*/
        },

        removeAddService(data) {
            const index = this.listService.indexOf(data);
            if (index > -1) {
                // only splice array when item is found
                this.listService.splice(index, 1); // 2nd parameter means remove one item only
            }
            /*
      this.listService = this.listService.filter((val) => val.id !== data.id);*/
        },
        removeItemDetail(data) {
            const index = this.maintenanceSheet.detail.indexOf(data);
            const indexService = this.listService.indexOf(data);
            const indexArticles = this.listArticles.indexOf(data);
            if (index > -1) this.maintenanceSheet.detail.splice(index, 1);
            if (indexService > -1) this.listService.splice(indexService, 1);
            if (indexArticles > -1) this.listArticles.splice(indexArticles, 1);
        },
        addArticleInDetail() {
            //  TODO:VALIDATE FIELDS EMPTY TABLE
            // console.log(this.listService);
            this.listArticles.map((service) => this.maintenanceSheet.detail.push(service));
            this.pushDistinct();
            this.addSparePartDialog = false;
        },
        saveMaintenenaceSheet() {
            //  TODO:VALIDATE
            if (this.maintenanceSheet.machine.id && this.maintenanceSheet.detail.length > 0) {
                this.submittedMaintenanceSheet = true;
                if (this.validateMaintenanceSheet()) {
                    this.maintenanceSheet.date = moment(this.maintenanceSheet.date).format('YYYY-MM-DD HH:mm:ss');
                    const payload = this.maintenanceSheet;
                    // console.log(payload);
                    this.maintenanceSheetService.create(payload).then(() => {
                        // this.suppliers[this.findIndexById(id)] = data.data;
                        this.$toast.add({
                            severity: 'success',
                            summary: this.$t('successful'),
                            detail: this.$t('new_maintenance') + ' ' + this.$t('register'),
                            life: 3000
                        });
                        this.$router.push(`/maintenance-sheet`);
                    });

                    this.defaultObjects();
                    this.submittedMaintenanceSheet = false;
                }
            } else {
                this.$toast.add({
                    severity: 'error',
                    summary: this.$t('warning'),
                    detail: this.$t('toast_new_maintenance'),
                    life: 3000
                });
            }
        },
        validateMaintenanceSheet() {
            /*return true;*/

            return (
                this.maintenanceSheet.date &&
                this.maintenanceSheet.responsible &&
                this.maintenanceSheet.maintenance_type &&
                this.maintenanceSheet.supplier &&
                this.maintenanceSheet.description &&
                this.maintenanceSheet.ref_invoice_number &&
                this.maintenanceSheet.maximum_working_time
            );
        },
        defaultObjects() {
            this.maintenanceSheet = {
                date: null,
                responsible: null,
                technical: null,
                maximum_working_time: null,
                description: null,
                maintenance_type: null,
                ref_invoice_number: null,
                supplier: null,
                machine: {},
                detail: []
            };
            this.service = {
                description: null,
                price: null
            };
            this.article = {
                serie_number: null,
                name: null,
                brand: null,
                model: null,
                quantity: null,
                price: null
            };
        },
        clearArticle() {
            this.submittedAddArticle = false;
            this.article = {
                serie_number: null,
                name: null,
                brand: null,
                model: null,
                quantity: null,
                price: 0
            };
        }
    }
    /*mounted() {
    this.productService
      .getProductsSmall()
      .then((data) => (this.products1 = data));
    this.productService
      .getProductsSmall()
      .then((data) => (this.products2 = data));
    this.productService
      .getProductsSmall()
      .then((data) => (this.products3 = data));
  },*/
};
</script>

<template>
    <Toast />
    <div class="grid">
        <div class="col-12">
            <Button icon="pi pi-arrow-left" class="p-button-rounded mr-2 mb-2" @click="backPage" />
            <div class="card p-fluid">
                <div class="flex flex-column align-items-center">
                    <h3 class="text-900 font-medium">{{ $t('maintenance_sheet') }}</h3>
                    <Button :label="$t('select_machine_btn')" :disabled="this.maintenanceSheet.id" class="p-button-secondary mr-2 mb-2" @click="openNewSelectMachine" />
                </div>
            </div>
        </div>
        <Dialog v-model:visible="machineDialog" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '45vw' }" :header="$t('select_machine')" :modal="true" class="p-fluid">
            <DataTable
                ref="dt"
                :value="machines"
                dataKey="id"
                :paginator="true"
                :rows="5"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} machines"
                responsiveLayout="scroll"
                :loading="loadingMachines"
            >
                <template #header>
                    <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                        <h5 class="m-0">{{ $t('machines') }}</h5>
                        <div class="align right">
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" :placeholder="$t('search')" /><!--"filters['global'].value"-->
                            </span>
                        </div>
                    </div>
                </template>
                <Column field="serial_number" :header="$t('serial_number')" :sortable="true" headerStyle="width:25%; min-width:10rem;">
                    <template #body="slotProps">
                        <span class="p-column-title">Serial Number</span>
                        {{ slotProps.data.serie_number }}
                    </template>
                </Column>
                <Column field="name" :header="$t('name')" :sortable="true" headerStyle="width:30%; min-width:10rem;">
                    <template #body="slotProps">
                        <span class="p-column-title">Name</span>
                        {{ slotProps.data.name }}
                    </template>
                </Column>

                <!--        <Column-->
                <!--            field="model"-->
                <!--            header="Model"-->
                <!--            :sortable="true"-->
                <!--            headerStyle="width:14%; min-width:10rem;"-->
                <!--        >-->
                <!--          <template #body="slotProps">-->
                <!--            <span class="p-column-title">Model</span>-->
                <!--            {{ slotProps.data.model }}-->
                <!--          </template>-->
                <!--        </Column>-->

                <!--        <Column-->
                <!--            field="brand"-->
                <!--            header="Brand"-->
                <!--            :sortable="true"-->
                <!--            headerStyle="width:14%; min-width:10rem;"-->
                <!--        >-->
                <!--          <template #body="slotProps">-->
                <!--            <span class="p-column-title">Brand</span>-->
                <!--            {{ slotProps.data.brand }}-->
                <!--          </template>-->
                <!--        </Column>-->

                <Column :header="$t('image')" headerStyle="width:14%; min-width:10rem;">
                    <template #body="slotProps">
                        <span class="p-column-title">Image</span>
                        <img :src="slotProps.data.image ? getImage(slotProps.data.image) : imageDefault" :alt="'machine'" class="shadow-2" width="100" height="100" />
                    </template>
                </Column>
                <Column field="status" :header="$t('status')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                    <template #body="slotProps">
                        <span class="p-column-title">Status</span>
                        <span :class="'product-badge status-' + (slotProps.data.status === 'available' ? 'new' : slotProps.data.status === 'operating' ? 'instock' : 'outofstock')">{{ $t(slotProps.data.status) }}</span>
                    </template>
                </Column>

                <Column headerStyle="min-width:4rem;">
                    <template #body="slotProps">
                        <div style="display: flex; justify-content: end">
                            <Button icon="pi pi-angle-double-down" class="p-button-rounded p-button-success mr-2" :disabled="slotProps.data.status === 'operating'" @click="selectMachine(slotProps.data)" />
                            <!--              <Button-->
                            <!--                  icon="pi pi-pencil"-->
                            <!--                  class="p-button-rounded p-button-warning mr-2"-->
                            <!--                  @click="editProduct(slotProps.data)"-->
                            <!--              />-->
                            <!--              <Button-->
                            <!--                  icon="pi pi-trash"-->
                            <!--                  class="p-button-rounded p-button-danger"-->
                            <!--                  @click="confirmDelete(slotProps.data)"-->
                            <!--              />-->
                        </div>
                    </template>
                </Column>
            </DataTable>
        </Dialog>
        <div class="col-12 md:col-6">
            <div class="card p-fluid">
                <div class="grid">
                    <div class="col-6">
                        <h5>{{ $t('machine_data') }}</h5>
                        <div class="grid">
                            <div class="field col-12">
                                <b>> {{ $t('serial_number') }}: </b>
                                <i> {{ this.maintenanceSheet.machine.serie_number }}</i>
                            </div>
                            <div class="field col-12">
                                <b>> {{ $t('name') }}: </b>
                                <i>{{ this.maintenanceSheet.machine.name }}</i>
                            </div>
                            <div class="field col-12">
                                <b>> {{ $t('brand') }}: </b>
                                <i>{{ this.maintenanceSheet.machine.brand }}</i>
                            </div>
                            <div class="field col-12">
                                <b>> {{ $t('model') }}: </b>
                                <i>{{ this.maintenanceSheet.machine.model }}</i>
                            </div>
                            <div class="field col-12">
                                <b>> {{ $t('last_maintenance_date') }}: </b>
                                <i>{{ this.maintenanceSheet.machine.date_last_maintenance }}</i>
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="grid h-full">
                            <div class="field col-12 flex justify-content-center align-items-center">
                                <img :src="this.maintenanceSheet.machine.image ? getImage(this.maintenanceSheet.machine.image) : imageDefault" :alt="'machine'" class="shadow-2" width="180" height="200" />
                            </div>
                        </div>
                    </div>
                    <h6>{{ $t('description_of_maintenance') }}</h6>
                    <div class="field col-12">
                        <!--          <label for="name1">Description</label>-->
                        <Textarea
                            v-model="maintenanceSheet.description"
                            :placeholder="$t('your_message')"
                            :autoResize="true"
                            rows="3"
                            cols="67"
                            :readonly="this.maintenanceSheet.id"
                            :class="{
                                'p-invalid': submittedMaintenanceSheet && !maintenanceSheet.description
                            }"
                        />
                        <small class="p-invalid" v-if="submittedMaintenanceSheet && !maintenanceSheet.description">{{ $t('description_alert') }}</small>
                    </div>
                    <h6>{{ $t('recommendation_of_use') }}</h6>
                    <div class="field col-12">
                        <!--          <label for="name1">Description</label>-->
                        <Textarea
                            v-model="maintenanceSheet.recommendation"
                            :placeholder="$t('your_message_recommendation')"
                            :autoResize="true"
                            rows="3"
                            cols="67"
                            :readonly="this.maintenanceSheet.id"
                            :class="{
                                'p-invalid': submittedMaintenanceSheet && !maintenanceSheet.recommendation
                            }"
                        />
                        <small class="p-invalid" v-if="submittedMaintenanceSheet && !maintenanceSheet.recommendation">{{ $t('recommendation_of_use_alert') }}</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 md:col-6">
            <div class="card p-fluid">
                <h5>{{ $t('information') }}</h5>
                <div class="grid">
                    <div class="field col-12">
                        <label for="name1">{{ $t('responsible') }}</label>
                        <InputText
                            v-model="maintenanceSheet.responsible"
                            id="name1"
                            type="text"
                            :readonly="this.maintenanceSheet.id"
                            autocomplete="off"
                            :class="{
                                'p-invalid': submittedMaintenanceSheet && !maintenanceSheet.responsible
                            }"
                        />
                        <small class="p-invalid" v-if="submittedMaintenanceSheet && !maintenanceSheet.responsible">{{ $t('responsible_alert') }}</small>
                    </div>

                    <div class="field col-12 sm:col-6">
                        <label for="state">{{ $t('maintenance_type') }}</label>
                        <Dropdown
                            id="state"
                            v-model="maintenanceSheet.maintenance_type"
                            :options="maintenanceTypeItems"
                            optionLabel="name"
                            :placeholder="$t('select_one')"
                            :loading="maintenanceTypeItemsLoading"
                            :disabled="this.maintenanceSheet.id"
                            :class="{
                                'p-invalid': submittedMaintenanceSheet && !maintenanceSheet.maintenance_type
                            }"
                        ></Dropdown>
                        <small class="p-invalid" v-if="submittedMaintenanceSheet && !maintenanceSheet.maintenance_type">{{ $t('maintenance_type_alert') }}</small>
                    </div>
                    <div class="field col-12 sm:col-6">
                        <label for="name1">{{ $t('date_maintenance') }}</label>
                        <Calendar
                            :showIcon="true"
                            :showButtonBar="true"
                            v-model="maintenanceSheet.date"
                            :maxDate="minDateValue"
                            :showTime="true"
                            :showSeconds="true"
                            :disabled="this.maintenanceSheet.id"
                            :class="{
                                'p-invalid': submittedMaintenanceSheet && !maintenanceSheet.date
                            }"
                        ></Calendar>
                        <small class="p-invalid" v-if="submittedMaintenanceSheet && !maintenanceSheet.date">{{ $t('date_maintenance_alert') }}</small>
                    </div>

                    <div class="field col-12 sm:col-6">
                        <label for="quantity">{{ $t('new_hours_of_useful_life') }}</label>
                        <InputNumber
                            id="quantity"
                            v-model="maintenanceSheet.maximum_working_time"
                            showButtons
                            :min="0"
                            :useGrouping="false"
                            :readonly="this.maintenanceSheet.id"
                            :class="{
                                'p-invalid': submittedMaintenanceSheet && !maintenanceSheet.maximum_working_time
                            }"
                        />
                        <small class="p-invalid" v-if="submittedMaintenanceSheet && !maintenanceSheet.maximum_working_time">{{ $t('new_hours_of_useful_life_alert') }}</small>
                        <!--v-model="article.quantity"-->
                    </div>
                    <div class="field col-12 sm:col-6">
                        <label for="name1">{{ $t('ref_invoice_number') }}</label>
                        <InputText
                            id="name1"
                            type="text"
                            v-model="maintenanceSheet.ref_invoice_number"
                            :readonly="this.maintenanceSheet.id"
                            autocomplete="off"
                            :class="{
                                'p-invalid': submittedMaintenanceSheet && !maintenanceSheet.ref_invoice_number
                            }"
                        />

                        <small class="p-invalid" v-if="submittedMaintenanceSheet && !maintenanceSheet.ref_invoice_number">{{ $t('ref_invoice_number_alert') }}</small>
                    </div>
                    <div class="field col-12">
                        <label for="state">{{ $t('supplier') }}</label>
                        <Dropdown
                            id="state"
                            v-model="maintenanceSheet.supplier"
                            :options="supplierItems"
                            optionLabel="name"
                            :placeholder="$t('select_one')"
                            :filter="true"
                            :loading="supplierItemsLoading"
                            :disabled="this.maintenanceSheet.id"
                            :class="{
                                'p-invalid': submittedMaintenanceSheet && !maintenanceSheet.supplier
                            }"
                        ></Dropdown>
                        <small class="p-invalid" v-if="submittedMaintenanceSheet && !maintenanceSheet.supplier">{{ $t('supplier_alert') }}</small>
                    </div>
                    <div class="field col-12">
                        <label for="name1">{{ $t('technical') }}</label>
                        <InputText
                            v-model="maintenanceSheet.technical"
                            id="name1"
                            type="text"
                            :readonly="this.maintenanceSheet.id"
                            autocomplete="off"
                            :class="{
                                'p-invalid': submittedMaintenanceSheet && !maintenanceSheet.technical
                            }"
                        />
                        <small class="p-invalid" v-if="submittedMaintenanceSheet && !maintenanceSheet.technical">{{ $t('technical_alert') }}</small>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12">
            <div class="card">
                <h5>{{ $t('details') }}</h5>
                <div class="p-fluid formgrid grid">
                    <div class="field col-12 md:col-6 lg:col-4 xl:col-3">
                        <div v-if="!this.maintenanceSheet.id" class="flex flex-column sm:flex-row">
                            <Button :label="$t('add_articles')" class="p-button-secondary mr-2 mb-2" @click="openNewAddSparePart" />
                            <Button :label="$t('add_service')" class="p-button-secondary mr-2 mb-2" @click="openNewAddService" />
                        </div>
                    </div>
                    <div class="field col-12 md:col-6 lg:col-4 lg:col-offset-2 xl:col-3 xl:col-offset-6">
                        <div class="flex flex-column justify-content-center align-items-center">
                            <h3 class="text-900 text-5xl font-medium p-0 m-0">S/{{ totalDetailImport }}</h3>
                            <span class="text-600 text-md font-medium p-0">Total</span>
                        </div>
                    </div>
                    <div class="field col-12">
                        <DataTable :value="maintenanceSheet.detail" editMode="cell" @cell-edit-complete="onCellEditComplete" class="editable-cells-table" responsiveLayout="scroll">
                            <Column field="serie_number" :header="$t('serial_number')"></Column>
                            <Column field="name" :header="$t('name')">
                                <template #body="slotProps">
                                    {{ slotProps.data.name ? slotProps.data.name : slotProps.data.description }}
                                </template>
                            </Column>
                            <Column field="price" :header="$t('price')">
                                <template #editor="{ data, field }">
                                    <InputNumber v-model="data[field]" mode="currency" currency="PEN" locale="es-PE" autofocus :readonly="this.maintenanceSheet.id" />
                                </template>
                                <template #body="slotProps"> S/ {{ slotProps.data.price.toFixed(2) }} </template>
                            </Column>
                            <Column field="quantity" :header="$t('quantity')">
                                <template #editor="{ data, field }">
                                    <InputNumber v-model="data[field]" :min="1" showButtons :useGrouping="false" autofocus :readonly="this.maintenanceSheet.id" />
                                </template>
                            </Column>
                            <Column field="import" :header="$t('import')">
                                <template #body="slotProps">
                                    S/
                                    {{ (slotProps.data.price * slotProps.data.quantity).toFixed(2) }}
                                </template>
                            </Column>
                            <Column headerStyle="min-width:10rem;">
                                <template #body="slotProps">
                                    <div v-if="!this.maintenanceSheet.id" style="display: flex; justify-content: end">
                                        <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="removeItemDetail(slotProps.data)" />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12">
            <div v-if="!this.maintenanceSheet.id" class="flex justify-content-center">
                <Button :label="$t('save')" class="mr-2 mb-2" @click="saveMaintenenaceSheet()"></Button>
            </div>
        </div>
    </div>
    <Dialog v-model:visible="addSparePartDialog" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '90vw' }" :header="$t('add_articles')" :modal="true" class="p-fluid">
        <div class="grid">
            <div class="col-12 lg:col-6">
                <div class="card p-fluid">
                    <h5>{{ $t('sub_title_one') }}</h5>
                    <div class="grid">
                        <div class="field col-12">
                            <DataTable
                                ref="dt"
                                :value="articles"
                                dataKey="id"
                                :paginator="true"
                                :rows="1"
                                :filters="filters"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                :rowsPerPageOptions="[5, 10, 25]"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Articles"
                                responsiveLayout="scroll"
                                :loading="loadingArticles"
                                ><!--:value="articles"-->
                                <template #header>
                                    <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                                        <div class="field col-12 sm:col-6">
                                            <h5 class="m-0">
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
                                            </h5>
                                        </div>
                                        <span class="block mt-2 md:mt-0 p-input-icon-left">
                                            <i class="pi pi-search" />
                                            <InputText v-model="filters['global'].value" :placeholder="$t('search')" />
                                        </span>
                                    </div>
                                </template>
                                <Column field="serie_number" :header="$t('serial_number')" :sortable="true" headerStyle="width:18%; min-width:12rem;">
                                    <template #body="slotProps">
                                        <span class="p-column-title">Serail Number</span>
                                        {{ slotProps.data.serie_number }}
                                    </template>
                                </Column>
                                <Column field="name" :header="$t('name')" :sortable="true" headerStyle="width:14%; min-width:12rem;">
                                    <template #body="slotProps">
                                        <span class="p-column-title">Name</span>
                                        {{ slotProps.data.name }}
                                    </template>
                                </Column>

                                <Column :header="$t('image')" headerStyle="width:14%; min-width:10rem;">
                                    <template #body="slotProps">
                                        <span class="p-column-title">Image</span>
                                        <img :src="slotProps.data.image ? getImage(slotProps.data.image) : imageDefault" :alt="'machine'" class="shadow-2" width="100" height="100" />
                                    </template>
                                </Column>
                                <Column field="quantity" :header="$t('quantity')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                                    <template #body="slotProps">
                                        <span class="p-column-title">Quantity</span>
                                        {{ slotProps.data.quantity }}
                                    </template>
                                </Column>
                                <Column headerStyle="min-width:5rem;">
                                    <template #body="slotProps">
                                        <div style="display: flex; justify-content: end">
                                            <Button icon="pi pi-angle-double-right" class="p-button-rounded p-button-success mr-2" @click="setArticle(slotProps.data)" />
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 lg:col-6">
                <div class="card p-fluid">
                    <h5>{{ $t('sub_title_two') }}</h5>
                    <div class="grid">
                        <div class="field col-12 sm:col-5">
                            <label for="name1">{{ $t('serial_number') }}</label>
                            <InputText
                                v-model="article.serie_number"
                                id="name1"
                                type="text"
                                :readonly="this.article.serie_number"
                                :class="{
                                    'p-invalid': submittedAddArticle && !article.serie_number
                                }"
                            />
                            <small class="p-invalid" v-if="submittedAddArticle && !article.serie_number">{{ $t('serial_number_alert') }}</small>
                        </div>
                        <div class="field col-12 sm:col-4">
                            <label for="name1">{{ $t('name') }}</label>
                            <InputText
                                v-model="article.name"
                                id="name1"
                                type="text"
                                autocomplete="off"
                                :readonly="this.article.name"
                                :class="{
                                    'p-invalid': submittedAddArticle && !article.name
                                }"
                            />
                            <small class="p-invalid" v-if="submittedAddArticle && !article.name">{{ $t('name_alert') }}</small>
                        </div>
                        <div class="field col-12 sm:col-3">
                            <label for="name1">{{ $t('brand') }}</label>
                            <InputText
                                v-model="article.brand"
                                id="name1"
                                type="text"
                                autocomplete="off"
                                :readonly="this.article.brand"
                                :class="{
                                    'p-invalid': submittedAddArticle && !article.brand
                                }"
                            />
                            <small class="p-invalid" v-if="submittedAddArticle && !article.brand">{{ $t('brand_alert') }}</small>
                        </div>

                        <div class="field col-12 sm:col-5">
                            <label for="name1">{{ $t('model') }}</label>
                            <InputText
                                v-model="article.model"
                                id="name1"
                                type="text"
                                autocomplete="off"
                                :readonly="this.article.model"
                                :class="{
                                    'p-invalid': submittedAddArticle && !article.model
                                }"
                            />
                            <small class="p-invalid" v-if="submittedAddArticle && !article.model">{{ $t('model_Alert') }}</small>
                        </div>
                        <div class="field col-12 sm:col-3">
                            <label for="quantity">{{ $t('quantity') }}</label>
                            <InputNumber
                                id="quantity"
                                v-model="article.quantity"
                                showButtons
                                :disabled="isView"
                                :min="1"
                                :useGrouping="false"
                                :class="{
                                    'p-invalid': submittedAddArticle && !article.quantity
                                }"
                            />
                            <small class="p-invalid" v-if="submittedAddArticle && !article.quantity">{{ $t('quantity_alert') }}</small>
                            <!--v-model="article.quantity"-->
                        </div>
                        <div class="field col-12 sm:col-3">
                            <label for="quantity">{{ $t('price') }}</label>
                            <InputNumber
                                id="price"
                                v-model="article.price"
                                mode="currency"
                                currency="PEN"
                                locale="es-PE"
                                :min="0"
                                :class="{
                                    'p-invalid': submittedAddArticle && article.price === null
                                }"
                            />

                            <small class="p-invalid" v-if="submittedAddArticle && article.price === null">{{ $t('price_alert') }}</small>
                        </div>
                        <!--v-model="supplier_ref.price"-->
                        <div class="field col-12 sm:col-1">
                            <Button icon="pi pi-plus" class="p-button-secondary" style="margin-top: 1.8rem" @click="addArticle"></Button>
                        </div>
                        <div class="field col-12">
                            <Button label="Clear" class="p-button-secondary" style="width: 100%" @click="clearArticle"></Button>
                        </div>
                        <div class="field col-12 sm:col-12">
                            <div class="card">
                                <DataTable :value="listArticles" responsiveLayout="scroll">
                                    <Column field="serie_number" :header="$t('serial_number')"></Column>
                                    <Column field="name" :header="$t('name')"></Column>
                                    <Column field="price" :header="$t('price')">
                                        <template #body="slotProps"> S/ {{ slotProps.data.price.toFixed(2) }} </template>
                                    </Column>
                                    <Column field="quantity" :header="$t('quantity')"></Column>
                                    <Column field="import" :header="$t('import')">
                                        <template #body="slotProps">
                                            S/
                                            {{ (slotProps.data.price * slotProps.data.quantity).toFixed(2) }}
                                        </template>
                                    </Column>
                                    <Column v-if="!isView" headerStyle="min-width:4rem;">
                                        <template #body="slotProps">
                                            <div style="display: flex; justify-content: end">
                                                <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="removeAddArticle(slotProps.data)" />
                                            </div>
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex justify-content-end">
                <Button :label="$t('add')" icon="pi pi-download" class="p-button-success mr-2" @click="addArticleInDetail()" />
            </div>
        </div>
    </Dialog>

    <Dialog v-model:visible="addServiceDialog" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: '50vw' }" :header="$t('add_service')" :modal="true" class="p-fluid">
        <div class="col-12 md:col-12">
            <div class="card p-fluid">
                <h5>{{ $t('add_cost_of_servicio') }}</h5>
                <div class="grid">
                    <div class="field col-12 sm:col-8">
                        <label for="name1">{{ $t('description') }}</label>
                        <InputText
                            v-model="service.description"
                            id="name1"
                            type="text"
                            autocomplete="off"
                            :class="{
                                'p-invalid': submittedAddService && !service.description
                            }"
                        />
                        <small class="p-invalid" v-if="submittedAddService && !service.description">{{ $t('description_alert') }}</small>
                    </div>
                    <div class="field col-12 sm:col-3">
                        <label for="quantity">{{ $t('price') }}</label>
                        <InputNumber
                            v-model="service.price"
                            id="price"
                            mode="currency"
                            currency="PEN"
                            locale="es-PE"
                            :min="0"
                            :class="{
                                'p-invalid': submittedAddService && !service.price
                            }"
                        />
                        <small class="p-invalid" v-if="submittedAddService && !service.price">{{ $t('price_alert') }}</small>
                    </div>
                    <!--v-model="supplier_ref.price"-->
                    <div class="field col-12 sm:col-1">
                        <Button icon="pi pi-plus" class="p-button-secondary" style="margin-top: 1.8rem" @click="addService()"></Button>
                    </div>
                    <div class="field col-12 sm:col-12">
                        <div class="card">
                            <DataTable :value="listService" responsiveLayout="scroll">
                                <!--                :value="article.suppliers"-->
                                <Column field="description" :header="$t('description')" style="width: 70%"></Column>
                                <Column field="price" :header="$t('price')">
                                    <template #body="slotProps"> S/ {{ slotProps.data.price.toFixed(2) }} </template>
                                </Column>

                                <Column v-if="!isView" headerStyle="min-width:4rem;">
                                    <template #body="slotProps">
                                        <div style="display: flex; justify-content: end">
                                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="removeAddService(slotProps.data)" />
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="field col-12 sm:col-3">
            <div class="flex justify-content-end">
                <Button :label="$t('add')" icon="pi pi-download" class="p-button-success mr-2" @click="addServiceInDetail()" />
            </div>
        </div>
    </Dialog>
</template>

<style scoped lang="scss">
@import '@/assets/demo/badges.scss';
</style>
