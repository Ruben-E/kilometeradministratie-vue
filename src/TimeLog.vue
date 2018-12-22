<template>
  <div>
    <form novalidate @submit.prevent="logIt">
      <div class="row" v-if="saveState !== 'saving'">
        <a class="waves-effect waves-light btn col s6" @click.prevent="toWork">Naar werk</a>
        <a class="waves-effect waves-light btn col s6" @click.prevent="toHome">Naar huis</a>
      </div>

      <div class="input-field">
        <label class="active" for="date">Datum</label>
        <input id="date" placeholder="Placeholder" ref="date" type="date" v-model="newEntry.date">
      </div>

      <div class="input-field">
        <label class="active" for="startOdoMeter">Begin kilometerstand</label>
        <input id="startOdoMeter" placeholder type="number" v-model="newEntry.startOdoMeter">
      </div>

      <div class="input-field">
        <label for="endOdoMeter">Eind kilometerstand</label>
        <input id="endOdoMeter" placeholder type="number" v-model="newEntry.endOdoMeter">
      </div>

      <div class="input-field">
        <label for="fromAddress">Van</label>
        <input id="fromAddress" placeholder type="text" v-model="newEntry.fromAddress">
      </div>

      <div class="input-field">
        <label for="fromAddress">Naar</label>
        <input id="toAddress" placeholder type="text" v-model="newEntry.toAddress">
      </div>

      <div class="input-field">
        <label for="route">Route</label>
        <input id="route" placeholder type="text" v-model="newEntry.route">
      </div>

      <div class="input-field">
        <label for="visited">Bezoekadress</label>
        <input id="visited" placeholder type="text" v-model="newEntry.visited">
      </div>

      <div class="input-field">
        <label for="remark">Bijzonderheden</label>
        <input id="remark" placeholder type="text" v-model="newEntry.remark">
      </div>

      <div class="row" v-if="saveState !== 'saving'">
        <input type="submit" class="waves-effect waves-light btn col s12" value="Log time">
      </div>
    </form>

    <div v-if="saveState === 'saving'">
      <h4>Saving...</h4>
      <div class="progress">
        <div class="indeterminate"></div>
      </div>
    </div>

    <div v-if="saveState === 'error'" class="card-panel red-text">
      <h4>Error...</h4>
      <pre><code>{{error}}</code></pre>
      <div>Refresh the page maybe?</div>
    </div>
    <div v-if="recordsState === 'loaded'">
      <table>
        <thead>
        <tr>
          <th data-field="start">Datum</th>
          <th data-field="end">Ritnr.</th>
          <th data-field="end">Begin</th>
          <th data-field="end">Eind</th>
          <th data-field="end">Km.</th>
          <th data-field="end">Van</th>
          <th data-field="end">Naar</th>
          <th data-field="end">Route</th>
          <th data-field="end">Bezoekadr.</th>
          <th data-field="end">Karakter</th>
          <th data-field="what">
            Bijzonderheden?
            <a
              href="#"
              @click.prevent="refreshRecords"
              class="right"
              title="refresh"
            >&#x21bb;</a>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="record in lastRecords">
          <td>{{record.date}}</td>
          <td>{{record.rideNumber}}</td>
          <td>{{record.startOdoMeter}}</td>
          <td>{{record.endOdoMeter}}</td>
          <td>{{record.kilometers}}</td>
          <td>{{record.fromAddress}}</td>
          <td>{{record.toAddress}}</td>
          <td>{{record.route}}</td>
          <td>{{record.visited}}</td>
          <td>{{record.type}}</td>
          <td>{{record.remark}}</td>
        </tr>
        </tbody>
      </table>
      <div class="fixed-action-btn" style="bottom: 12px; right: 12px;">
        <a
          class="btn-floating btn-small red"
          :href="editLink"
          title="Edit records..."
          target="_blank"
        >
          <i class="small material-icons">mode_edit</i>
        </a>
      </div>
    </div>

    <div v-if="recordsState === 'loading'">
      <h4>Loading records...</h4>
      <div class="progress">
        <div class="indeterminate"></div>
      </div>
    </div>
  </div>
</template>

<script>
  // This is the heart of the application. This file may not be the prettiest.
  import appModel from "./lib/appModel.js";
  import dayjs from "dayjs";
  import {getError, logTime, getSheetTitle} from "./lib/goog.js";
  import {getCurrentDate} from "./lib/dateUtils.js";
  import getLastRecordsForComponent from "./lib/getLastRecordsForComponent.js";
  import getSpreadsheetIdFromComponentRoute from "./lib/getSpreadsheetIdFromComponentRoute.js";
  import DateTime from "./DateTime.vue";

  export default {
    data() {
      return {
        recordsState: "loading",
        lastRecord: null,
        lastRecords: [],

        newEntry: {
          date: getCurrentDate(),
          rideNumber: "",
          startOdoMeter: 0,
          endOdoMeter: "",
          kilometers: "",
          fromAddress: "",
          toAddress: "",
          route: "",
          visited: "",
          type: "prive",
          remark: ""
        },
        saveState: ""
      };
    },
    computed: {
      /**
       * Provides a Google Docs link to edit a spreadsheet
       */
      editLink() {
        const sheetId = getSpreadsheetIdFromComponentRoute(this);
        return `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
      }
    },
    components: {
      DateTime
    },
    route: {
      data() {
        appModel.pageName = "Loading data...";

        const spreadSheetId = getSpreadsheetIdFromComponentRoute(this);
        getSheetTitle(spreadSheetId, title => {
          appModel.pageName = title;
        });

        this.refreshRecords();
        this.refreshPresets();
      }
    },

    methods: {
      refreshRecords() {
        const spreadSheetId = getSpreadsheetIdFromComponentRoute(this);
        this.recordsState = "loading";
        getLastRecordsForComponent(spreadSheetId)
          .then(records => {
            const lastRecords = records.reverse();
            let lastRecord = null;
            if (lastRecords.length !== 0) {
              lastRecord = lastRecords[0]
            }
            this.lastRecords = lastRecords;
            this.lastRecord = lastRecord;
            const lastEndOdoMeter = lastRecord !== null ? lastRecord.endOdoMeter : null;
            if (lastEndOdoMeter) {
              this.newEntry.startOdoMeter = lastEndOdoMeter;
            }
            this.recordsState = "loaded";
          });
      },

      refreshPresets() {

      },

      toWork() {
        this.newEntry.fromAddress = "";
        this.newEntry.toAddress = "";
        this.newEntry.route = "";
        this.newEntry.visited = "";
        this.newEntry.type = "";
      },

      toHome() {
        this.newEntry.fromAddress = "";
        this.newEntry.toAddress = "";
        this.newEntry.route = "";
        this.newEntry.visited = "";
        this.newEntry.type = "";
      },

      logIt() {
        this.saveState = "saving";
        const spreadsheetId = getSpreadsheetIdFromComponentRoute(this);

        this.newEntry.kilometers =
          this.newEntry.endOdoMeter - this.newEntry.startOdoMeter;
        this.newEntry.rideNumber = "1";

        if (
          this.lastRecord &&
          this.lastRecord.rideNumber &&
          dayjs(this.lastRecord.date)
            .isSame(dayjs(this.newEntry.date), "date")
        ) {
          this.newEntry.rideNumber = parseInt(this.lastRecord.rideNumber, 10) + 1;
        }

        logTime(spreadsheetId, Object.values(this.newEntry))
          .then(
            () => {
              this.refreshRecords(this);
              this.newEntry = {
                date: getCurrentDate(),
                rideNumber: "",
                startOdoMeter: 0,
                endOdoMeter: "",
                kilometers: "",
                fromAddress: "",
                toAddress: "",
                route: "",
                visited: "",
                type: "prive",
                remark: ""
              };
              this.saveState = "done";
              this.error = "";
            },
            response => {
              this.saveState = "error";
              this.error = getError(response);
            }
          );
      }
    }
  };
</script>
