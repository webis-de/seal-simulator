"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeAboModule = void 0;
const InteractionModule_1 = require("../InteractionModule");
class YouTubeAboModule extends InteractionModule_1.InteractionModule {
    constructor(iYouTubeAboModule) {
        super({
            type: InteractionModule_1.InteractionModuleType.YouTubeAbo,
            url: "youtube.com",
            subscriptions: iYouTubeAboModule.subscriptions,
            id: 0,
        });
        this.channelUrls = [];
        for (const subscription of this.subscriptions) {
            this.channelUrls.push(`${this.url}/channel/${subscription.representation}/videos`);
        }
        // will default needsSetup to true
    }
    async runModule(sessionManagement) {
        const page = await sessionManagement.getContext().newPage();
        for (const channelUrl of this.channelUrls) {
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
    async runModuleSetup(sessionManagement) {
        const page = await sessionManagement.getContext().newPage();
        await page.goto(this.url);
        await page.pause();
    }
}
exports.YouTubeAboModule = YouTubeAboModule;
