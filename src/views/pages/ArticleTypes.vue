<script>
import { FilterMatchMode } from '@primevue/core/api';
import ArticleTypesService from '@/service/ArticleTypesService';
// import ToastDoc from './ToastDoc';

export default {
    data() {
        return {
            articleTypes: null,
            productDialog: false,
            deleteDialog: false,
            deleteProductsDialog: false,
            product: {},
            resource: {}, // One Resource ArticleType
            selectedProducts: null,
            filters: {},
            submitted: false,
            message: null,
            statuses: [
                { label: 'INSTOCK', value: 'instock' },
                { label: 'LOWSTOCK', value: 'lowstock' },
                { label: 'OUTOFSTOCK', value: 'outofstock' }
            ],
            loadingArticlesTypes: true,
            isView: false
        };
    },
    articleTypesService: null,
    created() {
        this.articleTypesService = new ArticleTypesService();
        this.initFilters();
    },
    mounted() {
        //this.loading = true;
        this.articleTypesService.getAll().then((data) => {
            this.articleTypes = data;
            this.loadingArticlesTypes = false;
        });
        //this.loading = false;
    },
    methods: {
        openNew() {
            this.isView = false;
            this.resource = {};
            this.submitted = false;
            this.productDialog = true;
        },
        hideDialog() {
            this.productDialog = false;
            this.submitted = false;
        },
        saveProduct() {
            this.submitted = true;
            if (this.resource.name.trim()) {
                if (this.resource.id) {
                    //UPDATE
                    const id = this.resource.id;
                    const payload = this.resource;
                    this.articleTypesService.update(id, payload).then((data) => {
                        this.articleTypes[this.findIndexById(id)] = data.data;
                        this.$toast.add({
                            severity: 'success',
                            summary: this.$t('successful'),
                            detail: this.$t('article_type') + ' ' + this.$t('updated'),
                            life: 3000
                        });
                    });
                } else {
                    // CREATE
                    const payload = this.resource;
                    this.articleTypesService.create(payload).then((data) => {
                        this.articleTypes.unshift(data.data);
                        this.$toast.add({
                            severity: 'success',
                            summary: this.$t('successful'),
                            detail: this.$t('article_type') + ' ' + this.$t('created'),
                            life: 3000
                        });
                    });
                }
                this.productDialog = false;
                this.resource = {};
            }
        },
        viewArticleTypes(resource) {
            this.isView = true;
            this.resource = { ...resource };
            this.productDialog = true;
        },
        editProduct(resource) {
            this.isView = false;
            this.resource = { ...resource };
            this.productDialog = true;
        },
        confirmDelete(resource) {
            this.resource = resource;
            this.deleteDialog = true;
        },
        deleteResource() {
            this.deleteDialog = false;
            this.articleTypesService.delete(this.resource.id).then(() => {
                this.articleTypes = this.articleTypes.filter((val) => val.id !== this.resource.id);
                this.resource = {};
                this.$toast.add({
                    severity: 'success',
                    summary: this.$t('successful'),
                    detail: this.$t('article_type') + ' ' + this.$t('deleted'),
                    life: 3000
                });
            });
        },
        findIndexById(id) {
            let index = -1;
            for (let i = 0; i < this.articleTypes.length; i++) {
                if (this.articleTypes[i].id === id) {
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
                    :value="articleTypes"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Article Types"
                    responsiveLayout="scroll"
                    :loading="loadingArticlesTypes"
                >
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h5 class="font-bold text-xl text-primary m-0">{{ $t('article_type') }}</h5>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" :placeholder="$t('search')" />
                            </IconField>
                        </div>
                    </template>

                    <Column field="name" :header="$t('name')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <div class="flex justify-end items-center">
                                <Button outlined rounded severity="info" icon="pi pi-eye" class="mr-2" @click="viewArticleTypes(slotProps.data)" />
                                <Button outlined rounded severity="warn" icon="pi pi-pencil" class="mr-2" @click="editProduct(slotProps.data)" />
                                <Button outlined rounded severity="danger" icon="pi pi-trash" class="" @click="confirmDelete(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" :header="!resource.id ? $t('new_article_type') : !isView ? $t('edit_article_type') : $t('inf_article_type')" :modal="true" class="p-fluid">
                    <div>
                        <label class="block font-bold mb-3" for="name">{{ $t('name') }}</label>
                        <InputText id="name" v-model.trim="resource.name" required="true" autofocus :readonly="isView" :class="{ 'p-invalid': submitted && !resource.name }" fluid />
                        <small class="p-invalid" v-if="submitted && !resource.name">{{ $t('name_alert') }}</small>
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
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/badges.scss';
</style>
