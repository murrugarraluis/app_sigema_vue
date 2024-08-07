<script>
import moment from 'moment';
import AttendanceService from '@/service/AttendanceService';
//import PDFViewer from "pdf-viewer-vue";

export default {
    data() {
        return {
            order: 'name',
            order_by: 'asc',
            type: 'attended',
            start_date: moment().format('YYYY-MM-DD'),
            end_date: moment().format('YYYY-MM-DD'),
            dropdownReportType: [
                { name: 'Attendances', value: 'attended' },
                { name: 'Absences', value: 'missed' }
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
            urlPDF: null
        };
    },
    /*components: {
    PDFViewer,
  },*/
    attendanceService: null,
    created() {
        this.attendanceService = new AttendanceService();
    },
    watch: {
        type() {
            this.clearRadioButtons();
        }
    },
    methods: {
        generate() {
            let payload = {
                start_date: moment(this.start_date).format('YYYY-MM-DD'),
                end_date: moment(this.end_date).format('YYYY-MM-DD'),
                type: this.type,
                sort_by: this.order,
                order_by: this.order_by
            };
            this.attendanceService.report(payload).then((data) => {
                if (data.path) {
                    this.urlPDF = `${process.env.VUE_APP_API_HOST}/storage/${data.path}`;
                    window.open(this.urlPDF);
                }
            });
        },
        clearRadioButtons() {
            this.order = 'name';
            this.order_by = 'asc';
        }
    }
};
</script>

<template>
    <Toast />
    <div class="grid">
        <div class="col-12">
            <div class="card p-fluid">
                <div class="flex flex-column align-items-center">
                    <h3 class="text-900 font-medium">{{ $t('attendances_report') }}</h3>
                </div>
            </div>
        </div>
        <div class="col-12 md:col-12">
            <div class="card p-fluid h-full">
                <h5>{{ $t('options') }}</h5>
                <div class="fiel grid">
                    <div class="field col-12 sm:col-6">
                        <label>{{ $t('from_the') }}</label>
                        <Calendar :showIcon="true" :showButtonBar="false" v-model="start_date" dateFormat="yy-mm-dd"></Calendar>
                    </div>
                    <div class="field col-12 sm:col-6">
                        <label> {{ $t('until_the') }}</label>
                        <Calendar :showIcon="true" :showButtonBar="false" v-model="end_date" dateFormat="yy-mm-dd"></Calendar>
                    </div>
                </div>

                <div class="field">
                    <label>
                        <b>{{ $t('report_type') }}</b>
                    </label>
                    <div class="field-radiobutton">
                        <RadioButton v-model="type" inputId="order1" name="Attendances" value="attended" />
                        <label for="city1">{{ $t('r_attendances') }}</label>
                    </div>
                    <div class="field-radiobutton">
                        <RadioButton v-model="type" inputId="order1" name="Absences" value="missed" />
                        <label for="city1">{{ $t('absences') }}</label>
                    </div>
                </div>
                <div class="field" style="border-top: 1px solid silver"></div>
                <div class="field">
                    <h6>{{ $t('order_by') }}</h6>
                    <div class="field-radiobutton">
                        <RadioButton v-model="order" inputId="order2" name="Name" value="name" />
                        <label for="city1">{{ $t('name') }}</label>
                    </div>
                    <div class="field-radiobutton">
                        <RadioButton v-model="order" inputId="order2" name="Last name" value="lastname" />
                        <label for="city1">{{ $t('last_name') }}</label>
                    </div>
                    <div class="field-radiobutton">
                        <RadioButton v-model="order" inputId="order1" name="N° of maintenances" value="attendances" :disabled="type == 'missed'" />
                        <label for="city1">{{ $t('n_attendances') }}</label>
                    </div>
                    <div class="field-radiobutton">
                        <RadioButton v-model="order" inputId="order1" name="N° of absences" value="absences" />
                        <label for="city1">{{ $t('n_absences') }}</label>
                    </div>
                </div>
                <div class="field">
                    <h6>{{ $t('scale') }}</h6>

                    <div class="field-radiobutton">
                        <RadioButton v-model="order_by" inputId="order1" name="N° Serie" value="asc" />
                        <label for="city1"><i class="pi pi-sort-amount-up text-green-500 text-xl"></i>{{ $t('upward') }}</label>
                    </div>
                    <div class="field-radiobutton">
                        <RadioButton v-model="order_by" inputId="order2" name="Machine" value="desc" />
                        <label for="city1"> <i class="pi pi-sort-amount-down text-green-500 text-xl"></i>{{ $t('downward') }}</label>
                    </div>
                </div>
                <div class="field">
                    <Button :label="$t('generate_report')" icon="pi pi-file-pdf" class="p-button-outlined p-button-danger" @click="generate" />
                </div>
            </div>
        </div>
    </div>
</template>
