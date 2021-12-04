"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenUrlModule = void 0;
const InteractionModule_1 = require("../InteractionModule");
/**
 * This Module can be used to open single Urls.\
 * e.g. Use it for Blogs, Static websites...
 */
class OpenUrlModule extends InteractionModule_1.InteractionModule {
    /**
     * This Module ignores subscriptions.
     * @param url Is the url that is opened.
     */
    constructor({ url, executionTime }) {
        super({
            id: 0,
            url: url,
            executionTime: executionTime,
            type: InteractionModule_1.InteractionModuleType.OpenUrl
        });
        /**
         * Assign needsSetup to false if you dont add a runModuleSetup() function
         * otherwise you can delete the line
         */
        this.needsSetup = true;
    }
    /**
     * The runModule function just opens the url and nothing more.
     * @param sessionManagement
     */
    async runModule(sessionManagement) {
        const page = await sessionManagement.getContext().newPage();
        await page.goto(this.url);
    }
    /**
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
exports.OpenUrlModule = OpenUrlModule;
