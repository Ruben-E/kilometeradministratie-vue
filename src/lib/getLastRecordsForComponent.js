/**
 * Attempts to load last records from the API, and updates component states accordingly
 */
import {fetchLastRecords} from "./goog.js";

export default function getLastRecordsForSpreadsheet(spreadsheetId) {
  // immediately before loading, switch to progress mode:

  return new Promise((resolve, reject) => {
    fetchLastRecords(spreadsheetId)
      .then(
        response => {
          let values = response.result.values || [];
          values = values.map(value => ({
            date: value[0],
            rideNumber: value[1],
            startOdoMeter: value[2],
            endOdoMeter: value[3],
            kilometers: value[4],
            fromAddress: value[5],
            toAddress: value[6],
            route: value[7],
            visited: value[8],
            type: value[9],
            remark: value[10]
          }));

          resolve(values);
        },
        response => {
          reject(response);
        }
      );
  });
}
