import { writeFileSync, createWriteStream } from 'fs';
import { parse } from '@vanillaes/csv';
import { downloadSheet, ROUNDS_SHEET } from "./src/questions.mjs";
import fetch from 'node-fetch';

function writeImage(response, roundIndex, questionIndex) {
    const contentType = response.headers.get('content-type');
    const extension = getExtension(contentType);
    const imagePath = `/offline/${roundIndex}_${questionIndex}.${extension}`;
    response.body.pipe(createWriteStream(`./public${imagePath}`));
    return imagePath;
}

function getExtension(contentType) {
    switch (contentType) {
        case "image/jpeg":
        case "image/jpg":
            return "jpg";
        case "image/webp":
            return "webp";
        case "image/gif":
            return "gif";
        case "image/png":
            return "png";
        default:
            console.error(`Unknown content type ${contentType}`)
    }
}

function download() {
    downloadSheet(ROUNDS_SHEET).then(rounds => {
        writeFileSync(`./public/offline/${ROUNDS_SHEET}.csv`, rounds);

        parse(rounds).splice(1).forEach((round, roundIndex) => {
            downloadSheet(round[0]).then(questions => {
                Promise.all(parse(questions).splice(1).map((question, questionIndex) => {
                    let imageUrl = question[2];
                    return fetch(imageUrl).then(response => writeImage(response, roundIndex, questionIndex)).then(newUrl => { return { imageUrl: imageUrl, newUrl: newUrl };});
                })).then(newUrls => {
                    let newQuestions = questions;
                    newUrls.forEach(mapping => {
                       newQuestions = newQuestions.replace(mapping.imageUrl, mapping.newUrl);
                    });
                    writeFileSync(`./public/offline/${round[0]}.csv`, newQuestions);
                });
            })
        });
    });
}

download();