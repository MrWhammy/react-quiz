import { parse } from '@vanillaes/csv';

class Sheets {

    constructor(id) {
        this.id = id;
    }

    buildUrl(sheet) {
        return (`https://docs.google.com/spreadsheets/d/${this.id}/gviz/tq?tqx=out:csv&sheet=${sheet}`);
    }

    getRounds() {
        return fetch(this.buildUrl('Rounds'))
            .then(response => response.text())
            .then(responseText => parse(responseText));
    }
}

export async function getRounds() {
    let sheets = new Sheets(process.env.REACT_APP_GOOGLE_SHEETS_ID);
    const csv = await sheets.getRounds();
    return csv.splice(1).map(row => ({ sheet: row[0], title: row[1] }));
}