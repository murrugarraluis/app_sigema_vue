<script>
import moment from 'moment';
import MaintenenaceSheetService from '@/service/MaintenenceSheetService';
//import PDFViewer from "pdf-viewer-vue";

export default {
    data() {
        return {
            order: 'name',
            order_by: 'asc',
            type: 'resumen',
            start_date: moment().format('YYYY-MM-DD'),
            end_date: moment().format('YYYY-MM-DD'),
            dropdownReportType: [
                { name: 'Abstarct', value: 'abstarct' },
                { name: 'Detailed', value: 'detailed' }
            ],
            dropdownTypePersonalItems: [
                { name: 'Permanent', value: 'permanent' },
                { name: 'Relay', value: 'relay' }
            ],
            dropdownTurnEntryItems: [
                { name: 'Day', value: 'day' },
                { name: 'Night', value: 'night' }
            ],
            dropdownItem: null,
            employees: null,
            employee: {
                document_type: null,
                document_number: null,
                name: null,
                phone: null,
                position: null,
                personal_email: null,
                address: null,
                type: null,
                turn: null,
                native_language: null
            },
            productDialog: false,
            deleteDialog: false,
            deleteProductsDialog: false,
            product: {},
            resource: {},
            selectedProducts: null,
            filters: {},
            submitted: false,
            message: null,
            //loading: false,
            statuses: [
                { label: 'INSTOCK', value: 'instock' },
                { label: 'LOWSTOCK', value: 'lowstock' },
                { label: 'OUTOFSTOCK', value: 'outofstock' }
            ],

            documentTypeItem: null,

            positionItems: null,

            documentTypeItems: null,
            loadingEmployees: true,
            isView: false,
            urlPDF: null,
            loadGenerate: false
        };
    },
    /*components: {
    PDFViewer,
  },*/
    maintenenaceSheetService: null,
    created() {
        this.maintenenaceSheetService = new MaintenenaceSheetService();
    },
    methods: {
        generate() {
            this.loadGenerate = true;
            let payload = {
                start_date: moment(this.start_date).format('YYYY-MM-DD'),
                end_date: moment(this.end_date).format('YYYY-MM-DD'),
                type: this.type,
                sort_by: this.order,
                order_by: this.order_by
            };
            //console.log(payload);
            this.maintenenaceSheetService.report(payload).then((data) => {
                if (data.path) {
                    this.loadGenerate = false;
                    this.viewPDF(data.path);
                }
            });
        },

        viewPDF(path) {
            // console.log(data)
            let uri = `${import.meta.env.VITE_APP_API_HOST}/storage/${path}`;
            window.open(uri);
            // return `${process.env.VUE_APP_API_HOST}/storage/${path}`;
        }
    }
};
</script>

<template>
    <div class="card p-fluid h-full flex flex-col gap-4">
        <h3 class="text-900 font-bold">{{ $t('maintenances_report') }}</h3>
        <div class="flex flex-col gap-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label for="calendar1" class="block font-bold mb-3">{{ $t('from_the') }}</label>
                    <Calendar id="calendar1" :showIcon="true" :showButtonBar="false" v-model="start_date" dateFormat="yy-mm-dd" fluid></Calendar>
                </div>
                <div>
                    <label for="calendar2" class="block font-bold mb-3"> {{ $t('until_the') }}</label>
                    <Calendar id="calendar2" :showIcon="true" :showButtonBar="false" v-model="end_date" dateFormat="yy-mm-dd" fluid></Calendar>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3">
                <div class="field">
                    <label class="block font-bold mb-3">
                        <b>{{ $t('report_type') }}</b>
                    </label>
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-start items-center gap-2">
                            <RadioButton v-model="type" inputId="resumen" name="General" value="resumen" />
                            <label for="resumen">{{ $t('general') }}</label>
                        </div>
                        <div class="flex justify-start items-center gap-2">
                            <RadioButton v-model="type" inputId="detail" name="Detail" value="detail" />
                            <label for="detail">{{ $t('detailed') }}</label>
                        </div>
                    </div>
                </div>
                <div class="field">
                    <h6 class="block font-bold mb-3">{{ $t('order_by') }}</h6>
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-start items-center gap-2">
                            <RadioButton v-model="order" inputId="name" name="Machine" value="name" />
                            <label for="name">{{ $t('machine') }}</label>
                        </div>
                        <div class="flex justify-start items-center gap-2">
                            <RadioButton v-model="order" inputId="serie_number" name="N° Serie" value="serie_number" />
                            <label for="serie_number">{{ $t('serial_number') }}</label>
                        </div>

                        <div class="flex justify-start items-center gap-2">
                            <RadioButton v-model="order" inputId="amount" name="Amount" value="amount" />
                            <label for="amount">{{ $t('amount') }}</label>
                        </div>
                        <div class="flex justify-start items-center gap-2">
                            <RadioButton v-model="order" inputId="maintenance_count" name="N° of maintenances" value="maintenance_count" />
                            <label for="maintenance_count">{{ $t('number_maintenances') }}</label>
                        </div>
                    </div>
                </div>
                <div class="field">
                    <h6 class="block font-bold mb-3">{{ $t('scale') }}</h6>
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-start items-center gap-2">
                            <RadioButton v-model="order_by" inputId="asc" name="N° Serie" value="asc" />
                            <label for="asc"><i class="pi pi-sort-amount-up text-green-500 text-xl"></i>{{ $t('upward') }}</label>
                        </div>
                        <div class="flex justify-start items-center gap-2">
                            <RadioButton v-model="order_by" inputId="desc" name="Machine" value="desc" />
                            <label for="desc"> <i class="pi pi-sort-amount-down text-green-500 text-xl"></i>{{ $t('downward') }}</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex justify-center mt-6">
                <Button :label="$t('generate_report')" icon="pi pi-file-pdf" class="p-button-outlined p-button-danger" @click="generate" :loading="loadGenerate"/>
            </div>
        </div>
    </div>
</template>
