"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SealScript = void 0;
const UsermodelLoading_1 = require("./io/UsermodelLoading");
const OutputConfiguration_1 = require("./io/OutputConfiguration");
const seal = require('../../../lib/index');
const SessionManagement_1 = require("./io/SessionManagement");
const AbstractSealScript = require("../../../lib/AbstractSealScript");
// import {ANDREA, LENA, LOGANLUCKY} from "./Constants";
class SealScript extends AbstractSealScript {
    //TODO Build function that find all directorys in out and new input direktory
    constructor(scriptDirectory, inputDirectory) {
        super("UserSimulation", "1.0.0", scriptDirectory, inputDirectory);
        this.user = UsermodelLoading_1.readUsermodelFormInputDirectory(this.getInputDirectory());
        this.inputConfiguration = new OutputConfiguration_1.OutputConfiguration(inputDirectory, this.user);
    }
    async run(browserContexts, outputDirectory) {
        /**
         * runTests
         */
        // UnitTests.runUnitTests()
        // ModuleTests.runModuleTests()
        /**
         * First execution is done manually, since the [[intervalObj]] starts after given time period.
         */
        let nextModules = this.user.nextModules;
        await sleep(this.user.nextTime * 60 * 1000);
        const browserContext = browserContexts[seal.constants.BROWSER_CONTEXT_DEFAULT];
        await this.main(browserContext, outputDirectory, nextModules);
        return true;
        /*
                const page = await browserContext.newPage()
                await page.goto("https://de.wikipedia.org/wiki/Ren%C3%A9_Bielke")
                await page.pause()*/
        /**
         * Starts the simulation after given time period. -> Repeat forever.
         */
        /*
        const intervalObj = setInterval(async () => {
            // await this.main(browserContext, outputDirectory)
        }, TICKPERIOD);// 10min = 600000ms
        */
    }
    /**
     * Main Entry Point for the simulation. That will be executed periodically in the [[intervalObj]].
     */
    async main(browserContext, outputDirectory, nextModules) {
        // console.log("Started Simulation")
        /**
         * Load multiple usermodels. All need to be located in the inputDirectory.
         * Currently just the first Usermodel is processed since the Simulation just needs to work with one Usermodel. The others will run in different environments.
         */
        /*
                const page = await browserContext.newPage()
                await page.goto("https://youtube.com")
                await page.pause()*/
        await this.runSimulations(this.user, browserContext, outputDirectory, nextModules);
        //await browser.close();
    }
    getBrowserContextsOption() {
        let contextOptions = this.user.contextOptions.build();
        // To See Browser set this to true
        if (true) {
            // contextOptions.headless = false
        }
        if (this.inputConfiguration.sessionPathExists()) {
            //
            contextOptions.storageState = this.inputConfiguration.getSessionStatePath();
        }
        return contextOptions;
    }
    async runSimulations(user, browserContext, outputDirectory, nextModules) {
        let session = await new SessionManagement_1.SessionManagement(user, browserContext, outputDirectory);
        await session.setupSession();
        await session.runInteractionModules(nextModules);
        await session.finishSession();
    }
}
exports.SealScript = SealScript;
/**
 * Sleep Function since JavaScript doesnt provide a default Implementation
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
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
