import {InteractionModule, InteractionModuleType} from "../InteractionModule";
import {BrowserContext} from "playwright";
import {OutputConfiguration} from "../../io/OutputConfiguration";
import {SessionManagement} from "../../io/SessionManagement";

/**
 * This Module can be used to open a URL and interact manually in the browser.\
 * e.g. Use it to setup websites or simulate a unusual interaction. ...
 */
export class ManualUrlModule extends InteractionModule{

    /**
     * This Module ignores subscriptions.
     * @param url Is the url that is opened.
     */
    constructor(url : string) {
        super({
            id: 0,
            url: url,
            type : InteractionModuleType.ManualUrl,
            executionTime : "atStart"
        });
    }

    /**
     * The runModule function just opens the url and nothing more.
     * @param sessionManagement
     */
    async runModule(sessionManagement : SessionManagement): Promise<void> {
        const page = await sessionManagement.getContext().newPage()
        await page.goto(this.url)
        await page.pause()
        await page.close()
    }

    /**
     * This module doesn't need a setup since it is executed manually once.
     * @param sessionManagement
     */
    async runModuleSetup(sessionManagement: SessionManagement): Promise<void> {
        const page = await sessionManagement.getContext().newPage()
        await page.goto(this.url)
        // await page.pause()
    }

}