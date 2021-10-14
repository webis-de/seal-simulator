"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeAboModule = void 0;
const InteractionModule_1 = require("../InteractionModule");
class YouTubeAboModule extends InteractionModule_1.InteractionModule {
    constructor() {
        super({
            type: InteractionModule_1.InteractionModuleType.YouTubeAbo,
            url: "youtube.com",
            id: 0,
        });
    }
    async runModule(sessionManagement) {
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
    async runModuleSetup(sessionManagement) {
        const page = await sessionManagement.getContext().newPage();
        await page.goto(this.url);
        await page.pause();
    }
}
exports.YouTubeAboModule = YouTubeAboModule;
