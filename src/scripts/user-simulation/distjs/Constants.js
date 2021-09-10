"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TICKPERIOD = exports.INPUTUSERMODELFOLDER = exports.TEMPFOLDER = exports.OUTPUTDIRECTORY = void 0;
const fs = require('fs');
/**
 * Defines the default output directory for the generated user simulation files. Like trace.zip, screenshots or downloaded files
 */
exports.OUTPUTDIRECTORY = function () {
    const FOLDER = "./out"; //Assign the new name here
    if (!fs.existsSync(FOLDER)) {
        fs.mkdirSync(FOLDER);
    }
    return FOLDER;
}();
/**
 * Will hold all the temporal files like user-session-data, the internal usermodels or cookie-data
 */
exports.TEMPFOLDER = function () {
    const FOLDER = "./temp"; //Assign the new name here
    if (!fs.existsSync(FOLDER)) {
        fs.mkdirSync(FOLDER);
    }
    return FOLDER;
}();
/**
 * Contains all the manual written usermodels that must be simulated.
 */
exports.INPUTUSERMODELFOLDER = function () {
    const FOLDER = "./inputUsermodels"; //Assign the new name here
    if (!fs.existsSync(FOLDER)) {
        fs.mkdirSync(FOLDER);
    }
    return FOLDER;
}();
/**
 * Tick Period.\
 * 600000 ms -> 10 min
 */
exports.TICKPERIOD = 600000;
/**
 *  Default Users: Declared just for easier testing. Will later be deleted.
 *  @alpha
 */
/*
export const ANDREA = new Usermodel({
    name: "andrea",
    influencedBy : [new Influence({
        name : "Web"
    })],
    intrests : [new Influence({
        name : "Fefes Blog"
    })],
    freqentlyVisits : [new OpenUrlModule("https://blog.fefe.de/")]
})
// User2
export const LOGANLUCKY = new Usermodel({
    name: "loganlucky",
    influencedBy : [new Influence({
        name : "Google"
    })],
    intrests : [new Influence({
        name : "Playwright"
    })],
    freqentlyVisits : [new OpenUrlModule("https://playwright.dev/dotnet/docs/trace-viewer/#recording-a-trace")]
})
// User3
export const LENA = new Usermodel({
    name: "lena",
    influencedBy : [new Influence({
        name : "YouTube"
    })],
    intrests : [new Influence({
        name : "Gaming"
    })],
    freqentlyVisits : [new OpenUrlModule("https://www.youtube.com/c/4PlayersTV/videos")]
})*/
