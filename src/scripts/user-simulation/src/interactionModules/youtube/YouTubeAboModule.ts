import {InteractionModule, InteractionModuleType} from "../InteractionModule";
import {BrowserContext} from "playwright";
import {OutputConfiguration} from "../../io/OutputConfiguration";
import {SessionManagement} from "../../io/SessionManagement";

export class YouTubeAboModule extends InteractionModule{

    constructor() {
        super({
            type: InteractionModuleType.YouTubeAbo,
            url : "youtube.com",
            id : 0,
        });
    }


    async runModule(sessionManagement : SessionManagement): Promise<void> {
        const page = await sessionManagement.getContext().newPage();
        await page.goto(this.url);
    }

    /**
     * TODO Clean up and Test
     * 1. Pls accept all windows, so the page you want to visit is clear to see.
     * 2. Click Resume
     * e.g. Accept Cookies...
     * @param sessionManagement
     */
    async runModuleSetup(sessionManagement: SessionManagement): Promise<void> {
        const page = await sessionManagement.getContext().newPage()
        await page.goto(this.url)
        await page.pause()
    }

}