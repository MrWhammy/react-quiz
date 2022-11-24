import {parse} from '@vanillaes/csv';

export const ROUNDS_SHEET = '588979363';
const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEETS_ID;

function buildUrl(sheet) {
    //return (`https://docs.google.com/spreadsheets/d/${this.id}/gviz/tq?tqx=out:csv&sheet=${sheet}`);
    if (SHEET_ID) {
        return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&id=${SHEET_ID}&gid=${sheet}`;
    } else {
        return `${process.env.PUBLIC_URL}/offline/${sheet}.csv`
    }
}

export async function getRounds() {
    return downloadSheet(ROUNDS_SHEET)
        .then(responseText => parse(responseText))
        .then(csv => csv.splice(1)) // remove header
        .then(roundRows => roundRows.map(row => ({sheet: row[0], title: row[1]})));
}

export async function getQuestions(sheet) {
    return downloadSheet(sheet)
        .then(responseText => parse(responseText))
        .then(csv => csv.splice(1)) // remove header
        .then(roundRows => roundRows.map((row, index) => ({
            number: index + 1,
            question: row[0].replace('\\n', '\n'),
            answer: row[1],
            image: row[2],
            artist: row[3],
            song: row[4],
            theme: row[5]
        })));
}

export async function downloadSheet(sheet) {
    return fetch(buildUrl(sheet))
        .then(response => response.text());
}