import {IInteractionModule, InteractionModule, InteractionModuleType} from "../InteractionModule";
import {BrowserContext} from "playwright";
import {OutputConfiguration} from "../../io/OutputConfiguration";
import {SessionManagement} from "../../io/SessionManagement";
import {Subscription} from "../../datamodels/Subscription";
import {Time} from "../../datamodels/Time";

export interface iYouTubeAboModule {
    /**
     * See [[InteractionModule.executionTime]]
     */
    executionTime: string;
    /**
     * See [[InteractionModule.subscriptions]]
     */
    subscriptions: Subscription[];
}

export class YouTubeAboModule extends InteractionModule{

    private channelUrls : string[] = []

    constructor({subscriptions, executionTime}: iYouTubeAboModule) {
        super({
            type: InteractionModuleType.YouTubeAbo,
            url: "https://www.youtube.com",
            executionTime: executionTime,
            subscriptions: subscriptions,
            id: 0,
        });
        for (const subscription of this.subscriptions) {
            this.channelUrls.push(`${this.url}/channel/${subscription.representation}/videos`)
        }
        if(subscriptions.length == 0){
            throw Error("You didn't set any Subscriptions. Please add some with name:ChannelName and representation:ChannelID")
        }
        // will default needsSetup to true
    }

    override toString(): string {
        return `At ${this.executionTime} o'clock I watch some youtube videos from the ${this.stringIds()}. `
    }



    stringIds(): string{
        let channelIds : string[] = []
        for (const subscription of this.subscriptions) {
            channelIds.push(subscription.representation)
        }
        let text = function (): string {
            switch (channelIds.length) {
                case 0:
                    throw Error(`There are no representations/channelIds in the Youtube Module`)
                case 1:
                    return `channel with th id ${channelIds[0]}.`
                default: {
                    let channelString = `channels with id `
                    for (let i = 0; i < channelIds.length; i++) {
                        switch (i + 1) {/*
                            case interests.length:
                                interestsArrayString += ` and especially ${interests[0].name}.`
                                break
                            case (interests.length - 1):
                                interestsArrayString += `${interests[i + 1].name}`
                                break
                            default:
                                interestsArrayString += `${interests[i + 1].name}, `
                                break*/
                        }
                    }
                    return channelString
                }
            }
        }
        return text()
    }


    async runModule(sessionManagement : SessionManagement): Promise<void> {
        const page = await sessionManagement.getContext().newPage();
        for(const channelUrl of this.channelUrls){
            await page.goto(channelUrl);
        }


    }

    /**
     * TODO Clean up and Test || Fix: Will not write the Module correctly in the Usermodel
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