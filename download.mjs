import { writeFileSync, createWriteStream } from 'fs';
import { parse } from '@vanillaes/csv';
import { downloadSheet, ROUNDS_SHEET } from "./src/questions.mjs";
import fetch from 'node-fetch';

function download() {
    downloadSheet(ROUNDS_SHEET).then(rounds => {
        writeFileSync(`./public/offline/${ROUNDS_SHEET}.csv`, rounds);

        parse(rounds).splice(1).forEach((round, roundIndex) => {
            downloadSheet(round[0]).then(questions => {
                parse(questions).splice(1).forEach((question, questionIndex) => {
                    let imgUrl = question[2];
                    fetch(imgUrl).then(response => response.body.pipe(createWriteStream(`./public/offline/${roundIndex}_${questionIndex}`)));
                })
                writeFileSync(`./public/offline/${round[0]}.csv`, questions);
            })
        });
    });
}

download();