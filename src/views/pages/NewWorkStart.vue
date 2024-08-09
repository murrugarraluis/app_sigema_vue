<script>
import { FilterMatchMode } from '@primevue/core/api';
import WorkSheetService from '@/service/WorkSheetService';
import MachinesService from '@/service/MachinesService';
import moment from 'moment';

export default {
    data() {
        return {
            workSheet: {
                id: null,
                date: null,
                description: null,
                machine: {
                    //image: null,
                    id: null,
                    status: null,
                    date_last_use: null,
                    date_last_maintenance: null,
                    total_time_used: {
                        hours: null,
                        minutes: null,
                        seconds: null
                    }
                },
                working_hours: [],
                is_open: true,
                is_pause: false
            },
            imageDefault: 'https://via.placeholder.com/150x180',

            dropdownItems: [
                { name: 'Option 1', code: 'Option 1' },
                { name: 'Option 2', code: 'Option 2' },
                { name: 'Option 3', code: 'Option 3' }
            ],
            productDialog: false,
            dropdownItem: null,
            minDateValue: new Date(),
            editingRows: [],
            columns: null,
            products1: null,
            products2: null,
            products3: null,
            statuses: [
                { label: 'In Stock', value: 'INSTOCK' },
                { label: 'Low Stock', value: 'LOWSTOCK' },
                { label: 'Out of Stock', value: 'OUTOFSTOCK' }
            ],
            filters: {},
            // filters: {
            //   code: {value: null, matchMode: FilterMatchMode.STARTS_WITH},
            //   name: {value: null, matchMode: FilterMatchMode.STARTS_WITH},
            //   quantity: {value: null, matchMode: FilterMatchMode.STARTS_WITH},
            //   price: {value: null, matchMode: FilterMatchMode.STARTS_WITH},
            // },
            machines: [],
            loadingMachines: true,
            intervalId: null, // Almacenar la referencia al intervalo
            isCounterRunning: false // Indica si el contador está en funcionamiento
        };
    },

    machineWorkSheetService: null,
    machineService: null,
    created() {
        this.machineWorkSheetService = new WorkSheetService();
        this.machineService = new MachinesService();
        this.initFilters();
        this.columns = [
            { field: 'code', header: 'Number Stop' },
            { field: 'name', header: 'Start Time' },
            { field: 'price', header: 'End Time', mode: 'currency', currency: 'USD' },
            { field: 'quantity', header: 'Total time' }
        ];
    },
    mounted() {
        // console.log(this.$route.params);
        let sheet = this.$route.params;
        // console.log(sheet);
        if (sheet.id) {
            this.machineWorkSheetService.getOne(sheet.id).then((data) => {
                if (!data.is_open) {
                    this.disabledButtonCheckIn = true;
                    this.disabledButtonCheckOut = true;
                    this.disabledButtonClose = true;
                }
                this.workSheet = data;
                this.startCounter();
            });
        }
    },
    beforeRouteLeave(to, from, next) {
        // Antes de salir de la página, detén el contador si está en funcionamiento
        if (this.isCounterRunning) {
            this.stopCounter();
        }
        next();
    },
    methods: {
        startCounter() {
            if (!this.isCounterRunning) {
                const activeItem = this.getActiveItem();

                if (activeItem) {
                    this.intervalId = setInterval(() => {
                        this.updateCounter(activeItem);
                    }, 1000);
                }
                this.isCounterRunning = true;
            }
        },
        getActiveItem() {
            return this.workSheet.working_hours.find((item) => item.date_time_end === null);
        },
        updateCounter(activeItem) {
            const diff = this.updateDateTimeDiff(activeItem.date_time_start);
            this.updateActiveItem(activeItem, diff);
            this.incrementTotalTime();
        },
        updateActiveItem(activeItem, diff) {
            const index = this.workSheet.working_hours.indexOf(activeItem);
            if (index !== -1) {
                this.workSheet.working_hours[index].date_time_diff = diff;
            }
        },
        incrementTotalTime() {
            const totalParts = this.workSheet.working_hours_total.split(':');
            let hours = parseInt(totalParts[0]);
            let minutes = parseInt(totalParts[1]);
            let seconds = parseInt(totalParts[2]) + 1;

            if (seconds >= 60) {
                seconds = 0;
                minutes += 1;
            }
            if (minutes >= 60) {
                minutes = 0;
                hours += 1;
            }

            this.workSheet.working_hours_total = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        },
        stopCounter() {
            if (this.isCounterRunning) {
                // Detener el intervalo utilizando clearInterval y la referencia almacenada
                clearInterval(this.intervalId);

                // Restablecer el indicador de que el contador está detenido
                this.isCounterRunning = false;
            }
        },
        updateDateTimeDiff(start) {
            if (start) {
                const startTime = new Date(start).getTime();
                const currentTime = new Date().getTime();
                const diffMilliseconds = currentTime - startTime;

                const hours = Math.floor(diffMilliseconds / 3600000);
                const minutes = Math.floor((diffMilliseconds % 3600000) / 60000);
                const seconds = Math.floor((diffMilliseconds % 60000) / 1000);

                return {
                    hours: hours.toString().padStart(2, '0'),
                    minutes: minutes.toString().padStart(2, '0'),
                    secons: seconds.toString().padStart(2, '0')
                };
            }
        },
        backPage() {
            this.$router.push(`/work-sheet`);
        },
        openNew() {
            this.productDialog = true;
            //  SET DATA
            this.loadingMachines = true;
            this.machineService.getAll().then((data) => {
                this.machines = data;
                this.loadingMachines = false;
            });
        },
        onCellEditComplete(event) {
            let { data, newValue, field } = event;

            switch (field) {
                case 'quantity':
                case 'price':
                    if (this.isPositiveInteger(newValue)) data[field] = newValue;
                    else event.preventDefault();
                    break;

                default:
                    if (newValue.trim().length > 0) data[field] = newValue;
                    else event.preventDefault();
                    break;
            }
        },
        getImage(path) {
            if (path.includes('http')) {
                return path;
            }
            return `${import.meta.env.VITE_APP_API_HOST}/storage/${path}`;
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
        initFilters() {
            this.filters = {
                global: { value: null, matchMode: FilterMatchMode.CONTAINS }
            };
        },
        selectMachine(value) {
            this.machineService.getOne(value.id).then((data) => {
                this.workSheet.machine = { ...data };
                this.productDialog = false;
            });
        },
        startWork() {
            if (this.workSheet.machine.id && this.workSheet.description) {
                this.workSheet.date = moment().format('YYYY-MM-DD HH:mm:ss');
                let payload = this.workSheet;
                // console.log(payload);

                this.machineWorkSheetService.start(payload).then((data) => {
                    this.workSheet = data.data;
                    this.startCounter();
                });
            } else {
                this.$toast.add({
                    severity: 'error',
                    summary: this.$t('warning'),
                    detail: this.$t('toast_new_work_start'),
                    life: 3000
                });
            }
        },
        pauseWork() {
            let id = this.workSheet.id;
            let payload = {
                date: moment().format('YYYY-MM-DD HH:mm:ss')
            };
            this.machineWorkSheetService.pause(id, payload).then((data) => {
                this.workSheet = data.data;
                this.stopCounter();
            });
        },
        restartWork() {
            let id = this.workSheet.id;
            let payload = {
                date: moment().format('YYYY-MM-DD HH:mm:ss')
            };
            this.machineWorkSheetService.restart(id, payload).then((data) => {
                this.workSheet = data.data;
                this.stopCounter();
                this.startCounter();
            });
        },
        stopWork() {
            let id = this.workSheet.id;
            let payload = {
                date: moment().format('YYYY-MM-DD HH:mm:ss')
            };
            this.machineWorkSheetService.stop(id, payload).then((data) => {
                this.workSheet = data.data;
                this.stopCounter();
            });
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
    <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12">
            <Button icon="pi pi-arrow-left" class="p-button-rounded mr-2 mb-2" @click="backPage" />
            <div class="card p-fluid">
                <div class="flex flex-col items-start justify-center">
                    <h3 class="text-900 font-bold text-primary">{{ $t('operation_control') }}</h3>
                </div>
            </div>
        </div>
        <div class="col-span-12 md:col-span-6">
            <div class="card p-fluid h-full">
                <div class="flex flex-col gap-4">
                    <h5 class="text-lg font-bold">{{ $t('machine_data') }}</h5>
                    <Button :label="$t('select_machine_btn')" class="mr-2 mb-2" @click="openNew"
                            :disabled="!workSheet.is_open || workSheet.id" />
                    <div class="col-6">
                        <div class="grid">
                            <div class="field col-12">
                                <b>> {{ $t('serial_number') }}: </b>
                                <i> {{ this.workSheet.machine.serie_number }}</i>
                            </div>
                            <div class="field col-12">
                                <b>> {{ $t('name') }}: </b>
                                <i>{{ this.workSheet.machine.name }}</i>
                            </div>
                            <div class="field col-12">
                                <b>> {{ $t('status') }}: </b>
                                <i>{{ this.workSheet.machine.status }}</i>
                            </div>
                            <div class="field col-12">
                                <b>> {{ $t('last_use') }}: </b>
                                <i>{{ this.workSheet.machine.date_last_use }}</i>
                            </div>
                            <div class="field col-12">
                                <b>> {{ $t('last_maintenance_date') }}: </b>
                                <i>{{ this.workSheet.machine.date_last_maintenance }}</i>
                            </div>
                            <div class="field col-12">
                                <b>> {{ $t('total_acumulate') }}: </b>
                                <span v-if="this.workSheet.machine.total_time_used.hours">
                                    {{ this.workSheet.machine.total_time_used.hours
                                    }} hrs {{ this.workSheet.machine.total_time_used.minutes }} min
                                    {{ this.workSheet.machine.total_time_used.seconds }}
                                    sec
                                    <b>/ {{ this.workSheet.machine.maximum_working_time }} hrs</b></span
                                >
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="grid h-full">
                            <div class="flex justify-center items-center">
                                <img
                                    :src="this.workSheet.machine.image ? getImage(this.workSheet.machine.image) : imageDefault"
                                    :alt="'machine'" class="shadow-2" width="180" height="200" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 md:col-span-6">
            <div class="card p-fluid h-full">
                <div class="flex flex-col gap-4">
                    <h5 class="text-lg font-bold">{{ $t('precheck_description') }}</h5>
                    <div class="field">
                        <Textarea id="description" v-model.trim="workSheet.description"
                                  :placeholder="$t('your_message_precheck')" :autoResize="true" rows="15" cols="30"
                                  :disabled="workSheet.id" fluid />
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12">
            <div class="card p-fluid">
                <h5 class="text-lg font-bold text-center">{{ $t('operation') }}</h5>

                <div class="flex flex-col gap-4">
                    <div class="text-center">
                        <p class="font-bold text-4xl pt-4 pb-4">{{ workSheet.working_hours_total }}</p>
                    </div>
                    <div class="flex flex-row gap-4 mx-auto">
                        <div v-if="workSheet.is_open && !workSheet.id">
                            <Button icon="pi pi-play" @click="startWork()" :label="$t('start')" class=""
                                    severity="success" />
                        </div>
                        <div v-if="workSheet.is_open && !workSheet.is_pause && workSheet.id">
                            <Button icon="pi pi-pause" @click="pauseWork()" :label="$t('pause')" severity="warn"
                                    class="" />
                        </div>

                        <div v-if="workSheet.is_open && workSheet.is_pause && workSheet.id">
                            <Button icon="pi pi-reply" @click="restartWork()" :label="$t('restart')"
                                    severity="success" />
                        </div>
                        <div v-if="workSheet.is_open">
                            <Button icon="pi pi-stop" @click="stopWork()" :label="$t('stop')" class="p-button-danger"
                                    :disabled="!workSheet.id" />
                        </div>
                    </div>

                    <div class="">
                        <DataTable ref="dt" :value="workSheet.working_hours" dataKey="id" :paginator="false" :rows="10"
                                   :filters="filters" responsiveLayout="scroll">
                            <template #header>
                                <div
                                    class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                                    <h5 class="text-lg font-bold">{{ $t('times') }}</h5>
                                </div>
                            </template>

                            <Column headerStyle="width: 3rem"></Column>

                            <Column field="date_time_start" :header="$t('date_time_start')"
                                    headerStyle="width:45%; min-width:10rem;">
                                <template #body="slotProps">
                                    {{ slotProps.data.date_time_start }}
                                </template>
                            </Column>

                            <Column field="date_time_end" :header="$t('date_time_end')"
                                    headerStyle="width:45%; min-width:10rem;">
                                <template #body="slotProps">
                                    {{ slotProps.data.date_time_end }}
                                </template>
                            </Column>

                            <Column field="date_time_diff" :header="$t('cumulative_hours')"
                                    headerStyle="width:45%; min-width:10rem;">
                                <template #body="slotProps">
                                    {{ slotProps.data.date_time_diff.hours + ':' + slotProps.data.date_time_diff.minutes + ':' + slotProps.data.date_time_diff.secons + ''
                                    }}
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Dialog v-model:visible="productDialog" :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
            :style="{ width: '45vw' }" :header="$t('select_machine')" :modal="true" class="p-fluid">
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
            <Column field="serie_number" :header="$t('serial_number')" :sortable="true"
                    headerStyle="width:25%; min-width:10rem;">
                <template #body="slotProps">
                    {{ slotProps.data.serie_number }}
                </template>
            </Column>
            <Column field="name" :header="$t('name')" :sortable="true" headerStyle="width30%; min-width:10rem;">
                <template #body="slotProps">
                    {{ slotProps.data.name }}
                </template>
            </Column>
            <Column :header="$t('image')" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <img :src="slotProps.data.image ? getImage(slotProps.data.image) : imageDefault" :alt="'machine'"
                         class="shadow-2" width="100" height="100" />
                </template>
            </Column>
            <Column field="status" :header="$t('status')" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <Tag :value="$t(slotProps.data.status)"
                         :severity="(slotProps.data.status === 'available' ? 'success' : slotProps.data.status === 'operating' ? 'warn' : 'danger')"
                    ></Tag>
                </template>
            </Column>

            <Column headerStyle="min-width:1rem;">
                <template #body="slotProps">
                    <div style="display: flex; justify-content: end">
                        <Button icon="pi pi-angle-double-down" class="p-button-rounded mr-2"
                                :disabled="slotProps.data.status === 'operating'"
                                @click="selectMachine(slotProps.data)" />
                    </div>
                </template>
            </Column>
        </DataTable>
    </Dialog>
</template>

<style scoped lang="scss">
@import '@/assets/demo/badges.scss';
</style>
