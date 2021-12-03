import {Browser, chromium, devices} from "playwright";
import {Protocol} from "playwright/types/protocol";
import {Usermodel} from "./datamodels/Usermodel";
import {readUsermodelFormInputDirectory,  writeUsermodel} from "./io/UsermodelLoading";
import {OutputConfiguration} from "./io/OutputConfiguration";
import {Influence} from "./datamodels/Influence";
import {OpenUrlModule} from "./interactionModules/general/OpenUrlModule";
import {expect} from "playwright/types/test";
import Console = Protocol.Console;
// import {ANDREA, LENA, LOGANLUCKY} from "./Constants";

/**
 * First execution is done manually, since the [[intervalObj]] starts after given time period.
 */
mainOLD()

/**
 * Starts the simulation after given time period. -> Repeat forever.
 */
const intervalObj = setInterval(() => {
    mainOLD()
}, 600000); // 1min = 600000ms

/**
 * Main Entry Point for the simulation. That will be executed periodically in the [[intervalObj]].
 */
async function mainOLD(): Promise<void> {

    console.log("Started Simulation");
    const browser = await chromium.launch({
            headless: false
        }
    );

    // await runTestSimulation(browser)

    await browser.close();
}

/**
 * Tests the Wikipedia page Simulation
 * @param browser Instance of the Playwright browser
 */
async function runTestWiki(browser: Browser) {

    // Go to https://www.wikipedia.org/
    const context = await browser.newContext();

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

/**
 * Tests the User Simulation
 * @param browser Instance of the Playwright browser
 */
async function runTestSimulation(browser: Browser, inputDirectory: string) {
    /**
     * Load 3 users programmatically. (Works)
     */
        // let andrea = ANDREA
        // let loganlucky = LOGANLUCKY
        // let lena = LENA
        // let usermodels = [andrea, loganlucky,lena]


    let usermodels = readUsermodelFormInputDirectory(inputDirectory)

    /* writeUsermodel(andrea, "andrea.json")
     writeUsermodel(loganlucky, "loganlucky.json")*/


    // await runSimulations(usermodels,browser,inputDirectory)

}