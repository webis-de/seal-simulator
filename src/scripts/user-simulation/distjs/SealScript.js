"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SealScript = void 0;
const playwright_1 = require("playwright");
const UsermodelLoading_1 = require("./io/UsermodelLoading");
const { AbstractSealScript } = require("../../../AbstractSealScript");
// import {ANDREA, LENA, LOGANLUCKY} from "./Constants";
class SealScript extends AbstractSealScript {
    constructor(scriptDirectory, inputDirectory) {
        super(scriptDirectory, inputDirectory);
        console.log("extended");
    }
    run() {
        /**
         * First execution is done manually, since the [[intervalObj]] starts after given time period.
         */
        // main()
        /**
         * Starts the simulation after given time period. -> Repeat forever.
         */
        const intervalObj = setInterval(() => {
            // main()
            console.log("runTooToo");
        }, 1000); // 1min = 600000ms
    }
}
exports.SealScript = SealScript;
let userScript = new SealScript("input", "output");
/**
 * Main Entry Point for the simulation. That will be executed periodically in the [[intervalObj]].
 */
async function main() {
    console.log("Started Simulation");
    const browser = await playwright_1.chromium.launch({
        headless: false
    });
    await runTestSimulation(browser);
    await browser.close();
}
/**
 * Tests the Wikipedia page Simulation
 * @param browser Instance of the Playwright browser
 */
async function runTestWiki(browser) {
    // Go to https://www.wikipedia.org/
    const context = await browser.newContext();
    // Start tracing before creating / navigating a page.
    await context.tracing.start({
        screenshots: true,
        snapshots: true
    });
    // Stop tracing and export it into a zip archive.
    let page = await context.newPage(); // Go to https://www.wikipedia.org/
    await page.goto('https://www.wikipedia.org/');
    // Click text=Deutsch
    await page.click('text=Deutsch');
    // Click #n-mainpage-description >> text=Hauptseite
    await page.click('#n-mainpage-description >> text=Hauptseite');
    // Click text=Letzte Änderungen
    await Promise.all([
        page.waitForNavigation( /*{ url: 'https://de.wikipedia.org/wiki/Spezial:Letzte_%C3%84nderungen?hidebots=1&hidecategorization=1&hideWikibase=1&limit=50&days=7&urlversion=2' }*/),
        page.click('text=Letzte Änderungen')
    ]);
    await page.click('text=Kontakt');
    await context.tracing.stop({
        path: "trace1.zip"
    });
}
/**
 * Tests the User Simulation
 * @param browser Instance of the Playwright browser
 */
async function runTestSimulation(browser) {
    /**
     * Load 3 users programmatically. (Works)
     */
    // let andrea = ANDREA
    // let loganlucky = LOGANLUCKY
    // let lena = LENA
    // let usermodels = [andrea, loganlucky,lena]
    // TODO Load users from file.
    let usermodels = (0, UsermodelLoading_1.readUsermodels)();
    // TODO Move this Function to the SessionManagement
    /* writeUsermodel(andrea, "andrea.json")
     writeUsermodel(loganlucky, "loganlucky.json")*/
    await (0, UsermodelLoading_1.runSimulations)(usermodels, browser);
}
