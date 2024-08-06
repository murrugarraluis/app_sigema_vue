<template>
  <Toast />
  <div class="grid">
    <div class="col-12">
      <div class="card p-fluid">
        <div class="flex flex-column align-items-center">
          <h3 class="text-900 font-medium">{{ $t("maintenances_report") }}</h3>
        </div>
      </div>
    </div>
    <div class="col-12 md:col-12">
      <div class="card p-fluid h-full">
        <h5>{{ $t("options") }}</h5>

        <div class="fiel grid">
          <div class="field col-12 sm:col-6">
            <label>{{ $t("from_the") }}</label>
            <Calendar
              :showIcon="true"
              :showButtonBar="false"
              v-model="start_date"
              dateFormat="yy-mm-dd"
            ></Calendar>
          </div>
          <div class="field col-12 sm:col-6">
            <label> {{ $t("until_the") }}</label>
            <Calendar
              :showIcon="true"
              :showButtonBar="false"
              v-model="end_date"
              dateFormat="yy-mm-dd"
            ></Calendar>
          </div>
        </div>

        <div class="field">
          <label>
            <b>{{ $t("report_type") }}</b>
          </label>
          <div class="field-radiobutton">
            <RadioButton
              v-model="type"
              inputId="order1"
              name="General"
              value="resumen"
            />
            <label for="city1">{{ $t("general") }}</label>
          </div>
          <div class="field-radiobutton">
            <RadioButton
              v-model="type"
              inputId="order1"
              name="Detail"
              value="detail"
            />
            <label for="city1">{{ $t("detailed") }}</label>
          </div>
          <!--          <Dropdown-->
          <!--              id="state"-->
          <!--              v-model="typeItem"-->
          <!--              :disabled="isView"-->
          <!--              :filter="false"-->
          <!--              :options="dropdownReportType"-->
          <!--              optionLabel="name"-->
          <!--              optionValue="value"-->
          <!--              placeholder="Select One"-->
          <!--          ></Dropdown>-->
          <!--v-model="employee.native_language"
          <small
                class="p-invalid"
                v-if="submitted && !employee.native_language"
                >Native language is required.</small
              >-->
        </div>
        <div class="field" style="border-top: 1px solid silver"></div>
        <div class="field">
          <h6>{{ $t("order_by") }}</h6>
          <div class="field-radiobutton">
            <RadioButton
              v-model="order"
              inputId="order2"
              name="Machine"
              value="name"
            />
            <label for="city1">{{ $t("machine") }}</label>
          </div>
          <div class="field-radiobutton">
            <RadioButton
              v-model="order"
              inputId="order1"
              name="N° Serie"
              value="serie_number"
            />
            <label for="city1">{{ $t("serial_number") }}</label>
          </div>

          <div class="field-radiobutton">
            <RadioButton
              v-model="order"
              inputId="order2"
              name="Amount"
              value="amount"
            />
            <label for="city1">{{ $t("amount") }}</label>
          </div>
          <div class="field-radiobutton">
            <RadioButton
              v-model="order"
              inputId="order1"
              name="N° of maintenances"
              value="maintenance_count"
            />
            <label for="city1">{{ $t("number_maintenances") }}</label>
          </div>
        </div>
        <div class="field">
          <h6>{{ $t("scale") }}</h6>

          <div class="field-radiobutton">
            <RadioButton
              v-model="order_by"
              inputId="order1"
              name="N° Serie"
              value="asc"
            />
            <label for="city1"
              ><i class="pi pi-sort-amount-up text-green-500 text-xl"></i
              >{{ $t("upward") }}</label
            >
          </div>
          <div class="field-radiobutton">
            <RadioButton
              v-model="order_by"
              inputId="order2"
              name="Machine"
              value="desc"
            />
            <label for="city1">
              <i class="pi pi-sort-amount-down text-green-500 text-xl"></i
              >{{ $t("downward") }}</label
            >
          </div>
        </div>
        <div class="field">
          <Button
            :label="$t('generate_report')"
            icon="pi pi-file-pdf"
            class="p-button-outlined p-button-danger"
            @click="generate"
          />
        </div>
      </div>
    </div>
    <!--
    <div class="col-12 md:col-9">
      <div class="card p-fluid h-full">
        <h5>{{ $t("report") }}</h5>
        <div v-if="urlPDF" class="col-12">
          <PDFViewer
            :source="this.urlPDF"
            :controls="['catalog','download', 'print', 'rotate', 'zoom', 'switchPage']"
            style="height: 75vh; width: 100%"
          />
        </div>
      </div>
    </div>

    -->
  </div>
</template>

<script>
import moment from "moment";
import MaintenenaceSheetService from "@/service/MaintenenceSheetService";
//import PDFViewer from "pdf-viewer-vue";

export default {
  data() {
    return {
      order: "name",
      order_by: "asc",
      type: "resumen",
      start_date: moment().format("YYYY-MM-DD"),
      end_date: moment().format("YYYY-MM-DD"),
      dropdownReportType: [
        { name: "Abstarct", value: "abstarct" },
        { name: "Detailed", value: "detailed" },
      ],
      dropdownTypePersonalItems: [
        { name: "Permanent", value: "permanent" },
        { name: "Relay", value: "relay" },
      ],
      dropdownTurnEntryItems: [
        { name: "Day", value: "day" },
        { name: "Night", value: "night" },
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
        native_language: null,
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
        { label: "INSTOCK", value: "instock" },
        { label: "LOWSTOCK", value: "lowstock" },
        { label: "OUTOFSTOCK", value: "outofstock" },
      ],

      documentTypeItem: null,

      positionItems: null,

      documentTypeItems: null,
      loadingEmployees: true,
      isView: false,
      urlPDF: null,
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
      let payload = {
        start_date: moment(this.start_date).format("YYYY-MM-DD"),
        end_date: moment(this.end_date).format("YYYY-MM-DD"),
        type: this.type,
        sort_by: this.order,
        order_by: this.order_by,
      };
      //console.log(payload);
      this.maintenenaceSheetService.report(payload).then((data) => {
        if (data.path) {
          this.viewPDF(data.path);
        }
      });
    },

    viewPDF(path) {
      // console.log(data)
      let uri = `${process.env.VUE_APP_API_HOST}/storage/${path}`;
      window.open(uri);
      // return `${process.env.VUE_APP_API_HOST}/storage/${path}`;
    },
  },
};
</script>
