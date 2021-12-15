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
            .then(responseText => parse(responseText))
            .then(csv => csv.splice(1)) // remove header
            .then(roundRows => roundRows.map(row => ({ sheet: row[0], title: row[1] })));
    }

    getQuestions(sheet) {
        return fetch(this.buildUrl(sheet))
            .then(response => response.text())
            .then(responseText => parse(responseText))
            .then(csv => csv.splice(1)) // remove header
            .then(roundRows => roundRows.map((row, index) => ({ number: index + 1, question: row[0].replace('\\n', '\n'), answer: row[1], image: row[2], artist: row[3], song: row[4], theme: row[5] })));
    }
}

export async function getRounds() {
    let sheets = new Sheets(process.env.REACT_APP_GOOGLE_SHEETS_ID);
    return await sheets.getRounds();
}

export async function getQuestions(sheet) {
    let sheets = new Sheets(process.env.REACT_APP_GOOGLE_SHEETS_ID);
    return await sheets.getQuestions(sheet);
}