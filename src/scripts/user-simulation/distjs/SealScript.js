"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SealScript = void 0;
const playwright_1 = require("playwright");
const UsermodelLoading_1 = require("./io/UsermodelLoading");
const Constants_1 = require("./Constants");
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
        }, Constants_1.TICKPERIOD); // 10min = 600000ms
    }
    /**
     * Main Entry Point for the simulation. That will be executed periodically in the [[intervalObj]].
     */
    async main(browserContext, outputDirectory) {
        // console.log("Started Simulation");
        const browser = await playwright_1.chromium.launch({
            headless: false
        });
        /**
         * Load multiple usermodels. All need to be located in the inputDirectory.
         * Currently just the first Usermodel is processed since the Simulation just needs to work with one Usermodel. The others will run in different environments.
         */
        let usermodels = (0, UsermodelLoading_1.readUsermodels)(this.getInputDirectory());
        await (0, UsermodelLoading_1.runSimulations)(usermodels, browser, outputDirectory);
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
