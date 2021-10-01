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
    run(browserContext, outputDirectory) {
        /**
         * First execution is done manually, since the [[intervalObj]] starts after given time period.
         */
        this.main(browserContext, outputDirectory);
        /**
         * Starts the simulation after given time period. -> Repeat forever.
         */
        const intervalObj = setInterval(async () => {
            await this.main(browserContext, outputDirectory);
        }, 600000); // 1min = 600000ms
    }
    /**
     * Tests the User Simulation
     * @param browser Instance of the Playwright browser
     */
    async runTestSimulation(browser, outputDirectory) {
        /**
         * Load 3 users programmatically. (Works)
         */
        // let andrea = ANDREA
        // let loganlucky = LOGANLUCKY
        // let lena = LENA
        // let usermodels = [andrea, loganlucky,lena]
        // TODO Load users from file.
        let usermodels = (0, UsermodelLoading_1.readUsermodels)(this.getInputDirectory());
        console.log(usermodels);
        // TODO Move this Function to the SessionManagement
        /* writeUsermodel(andrea, "andrea.json")
         writeUsermodel(loganlucky, "loganlucky.json")*/
        await (0, UsermodelLoading_1.runSimulations)(usermodels, browser, outputDirectory);
    }
    /**
     * Main Entry Point for the simulation. That will be executed periodically in the [[intervalObj]].
     */
    async main(browserContext, outputDirectory) {
        console.log("Started Simulation");
        const browser = await playwright_1.chromium.launch({
            headless: false
        });
        // let context = await browser.newContext()
        await this.runTestSimulation(browser, outputDirectory);
        await browser.close();
    }
}
exports.SealScript = SealScript;
/**
 * Tests the Wikipedia page Simulation
 * @param browser Instance of the Playwright browser
 */
async function runTestWiki(context) {
    // Go to https://www.wikipedia.org/
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
