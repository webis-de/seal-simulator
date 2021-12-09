import {Browser, BrowserContext, BrowserContextOptions, chromium, devices} from "playwright";
import {Protocol} from "playwright/types/protocol";
import {Usermodel} from "./datamodels/Usermodel";
import {readUsermodelFormInputDirectory, writeUsermodel} from "./io/UsermodelLoading";
import {OutputConfiguration} from "./io/OutputConfiguration";
import {Influence} from "./datamodels/Influence";
import {OpenUrlModule} from "./interactionModules/general/OpenUrlModule";
import {expect} from "playwright/types/test";
import Console = Protocol.Console;
import {TICKPERIOD} from "./Constants";
const seal = require('../../../lib/index');
import {UnitTests} from "./tests/UnitTests";
import {ModuleTests} from "./tests/ModuleTests";
import {SessionManagement} from "./io/SessionManagement";
import {InteractionModule} from "./interactionModules/InteractionModule";

const AbstractSealScript = require("../../../lib/AbstractSealScript");

// import {ANDREA, LENA, LOGANLUCKY} from "./Constants";


export class SealScript extends AbstractSealScript {

    user: Usermodel
    outputConfiguration?: OutputConfiguration
    inputConfiguration: OutputConfiguration

    //TODO Build function that find all directorys in out and new input direktory
    constructor(scriptDirectory: string, inputDirectory: string) {
        super("UserSimulation", "1.0.0", scriptDirectory, inputDirectory);
        this.user = readUsermodelFormInputDirectory(this.getInputDirectory())
        this.inputConfiguration = new OutputConfiguration(inputDirectory, this.user)
    }


    async run(browserContexts: any, outputDirectory: string) {
        /**
         * runTests
         */
        UnitTests.runUnitTests()
        // ModuleTests.runModuleTests()

        /**
         * First execution is done manually, since the [[intervalObj]] starts after given time period.
         */
            //TODO startModules need an extra function or state needs to be saved

        let startModules: InteractionModule[] = this.user.startModules

        let nextModules: InteractionModule[] = this.user.nextModules

        console.log(`Next Module will start in ${this.user.nextTime}min`)

        await sleep(this.user.nextTime * 60 * 1000)

        const browserContext = browserContexts[seal.constants.BROWSER_CONTEXT_DEFAULT];

        await this.main(browserContext, outputDirectory, nextModules)

        return true
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
    async main(browserContext: BrowserContext, outputDirectory: string, nextModules : InteractionModule[]): Promise<void> {

        // console.log("Started Simulation")


        /**
         * Load multiple usermodels. All need to be located in the inputDirectory.
         * Currently just the first Usermodel is processed since the Simulation just needs to work with one Usermodel. The others will run in different environments.
         */
/*
        const page = await browserContext.newPage()
        await page.goto("https://youtube.com")
        await page.pause()*/

        await this.runSimulations(this.user, browserContext, outputDirectory,nextModules)

        //await browser.close();
    }


    getBrowserContextsOption(): BrowserContextOptions {
        let contextOptions: any = this.user.contextOptions.build()
        // To See Browser set this to true
        if (true) {
            // contextOptions.headless = false
        }
        if (this.inputConfiguration.sessionPathExists()) {
            //
            contextOptions.storageState = this.inputConfiguration.getSessionStatePath()
        }
        return contextOptions
    }

    async runSimulations(user: Usermodel, browserContext: BrowserContext, outputDirectory: string, nextModules : InteractionModule[]) {
        let session = await new SessionManagement(user,browserContext,outputDirectory)

        await session.setupSession()

        await session.runInteractionModules(nextModules)

        await session.finishSession()

    }

}

/**
 * Sleep Function since JavaScript doesnt provide a default Implementation
 */
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Tests the Wikipedia page Simulation
 * @param browser Instance of the Playwright browser
 */
async function runTestWiki(context: BrowserContext) {

    // Go to https://www.wikipedia.org/

    // Start tracing before creating / navigating a page.
    await context.tracing.start(
        {
            screenshots: true,
            snapshots: true
        });


    // Stop tracing and export it into a zip archive.
    let page = await context.newPage() // Go to https://www.wikipedia.org/
    await page.goto('https://www.wikipedia.org/');
    // Click text=Deutsch
    await page.click('text=Deutsch');
    // Click #n-mainpage-description >> text=Hauptseite
    await page.click('#n-mainpage-description >> text=Hauptseite');
    // Click text=Letzte Änderungen
    await Promise.all([
        page.waitForNavigation(/*{ url: 'https://de.wikipedia.org/wiki/Spezial:Letzte_%C3%84nderungen?hidebots=1&hidecategorization=1&hideWikibase=1&limit=50&days=7&urlversion=2' }*/),
        page.click('text=Letzte Änderungen')
    ]);
    await page.click('text=Kontakt');

    await context.tracing.stop(
        {
            path: "trace1.zip"
        });
}