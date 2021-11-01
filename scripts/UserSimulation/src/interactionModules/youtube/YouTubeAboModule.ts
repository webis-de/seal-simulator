import {InteractionModule, InteractionModuleType} from "../InteractionModule";
import {BrowserContext} from "playwright";
import {OutputConfiguration} from "../../io/OutputConfiguration";
import {SessionManagement} from "../../io/SessionManagement";
import {Subscription} from "../../datamodels/Subscription";

export interface IYouTubeAboModule {
    subscriptions: Subscription[];

}

export class YouTubeAboModule extends InteractionModule{

    private channelUrls : string[] = []

    constructor( iYouTubeAboModule :IYouTubeAboModule) {
        super({
            type: InteractionModuleType.YouTubeAbo,
            url : "youtube.com",
            subscriptions: iYouTubeAboModule.subscriptions,
            id : 0,
        });
        for (const subscription of this.subscriptions){
            this.channelUrls.push(`${this.url}/channel/${subscription.representation}/videos`)
        }
    }


    async runModule(sessionManagement : SessionManagement): Promise<void> {
        const page = await sessionManagement.getContext().newPage();
        for(const channelUrl of this.channelUrls){
            await page.goto(channelUrl);
        }


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