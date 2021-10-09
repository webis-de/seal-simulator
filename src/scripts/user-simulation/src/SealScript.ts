import {Browser, BrowserContext, BrowserContextOptions, chromium, devices} from "playwright";
import {Protocol} from "playwright/types/protocol";
import {Usermodel} from "./datamodels/Usermodel";
import {readUsermodels, runSimulations, writeUsermodel} from "./io/UsermodelLoading";
import {OutputConfiguration} from "./io/OutputConfiguration";
import {Influence} from "./datamodels/Influence";
import {OpenUrlModule} from "./interactionModules/general/OpenUrlModule";
import {expect} from "playwright/types/test";
import Console = Protocol.Console;
import {TICKPERIOD} from "./Constants";
import {SessionManagement} from "./io/SessionManagement";
const {AbstractSealScript} = require("../../../AbstractSealScript");
// import {ANDREA, LENA, LOGANLUCKY} from "./Constants";



export class SealScript extends AbstractSealScript{

    user : Usermodel
    outputConfiguration? : OutputConfiguration

    //TODO Build function that find all directorys in out and new input direktory
    constructor(scriptDirectory : string, inputDirectory:string) {
        super(scriptDirectory, inputDirectory);
        console.log("extended");
        this.user = readUsermodels(this.getInputDirectory())[0]

    }


    run(browserContext: any, outputDirectory: string) {
        /**
         * First execution is done manually, since the [[intervalObj]] starts after given time period.
         */
        this.main(browserContext, outputDirectory)
        /**
         * Starts the simulation after given time period. -> Repeat forever.
         */
        const intervalObj = setInterval(async () => {
            await this.main(browserContext, outputDirectory)
        }, TICKPERIOD); // 10min = 600000ms
    }

    /**
     * Main Entry Point for the simulation. That will be executed periodically in the [[intervalObj]].
     */
    async main(browserContext: any, outputDirectory: string): Promise<void> {

        // console.log("Started Simulation");
        const browser = await chromium.launch({
                headless: false
            }
        );

        /**
         * Load multiple usermodels. All need to be located in the inputDirectory.
         * Currently just the first Usermodel is processed since the Simulation just needs to work with one Usermodel. The others will run in different environments.
         */

        await runSimulations(this.user,browser,outputDirectory)

        await browser.close();
    }

    getContextOptions() : BrowserContextOptions{
        let contextOptions = this.user.contextOptions
        let sessionPath = this.outputConfiguration.getSessionStatePath()
        if(this.outputConfiguration.sessionPathExists()){
            //
            contextOptions.storageState = sessionPath
        }
        return
    }

}


/**
 * Tests the Wikipedia page Simulation
 * @param browser Instance of the Playwright browser
 */
async function runTestWiki(context : BrowserContext) {

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