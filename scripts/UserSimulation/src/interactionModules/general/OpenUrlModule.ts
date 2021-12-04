import {IInteractionModule, InteractionModule, InteractionModuleType} from "../InteractionModule";
import {BrowserContext} from "playwright";
import {OutputConfiguration} from "../../io/OutputConfiguration";
import {SessionManagement} from "../../io/SessionManagement";

/**
 * This Module can be used to open single Urls.\
 * e.g. Use it for Blogs, Static websites...
 */
export class OpenUrlModule extends InteractionModule{

    /**
     * This Module ignores subscriptions.
     * @param url Is the url that is opened.
     */
    constructor({url,executionTime}:IInteractionModule) {
        super({
            id: 0,
            url: url,
            executionTime: executionTime,
            type: InteractionModuleType.OpenUrl
        });
        /**
         * Assign needsSetup to false if you dont add a runModuleSetup() function
         * otherwise you can delete the line
         */
        this.needsSetup = true
    }

    /**
     * The runModule function just opens the url and nothing more.
     * @param sessionManagement
     */
    async runModule(sessionManagement : SessionManagement): Promise<void> {
        const page = await sessionManagement.getContext().newPage();
        await page.goto(this.url);
    }

    /**
     * 1. Pls accept all windows, so the page you want to visit is clear to see.
     * 2. Click Resume
     * e.g. Accept Cookies...
     * @param sessionManagement
     */
    async runModuleSetup(sessionManagement: SessionManagement): Promise<void> {
        const page = await sessionManagement.getContext().newPage();
        await page.goto(this.url)
        await page.pause()
    }

}