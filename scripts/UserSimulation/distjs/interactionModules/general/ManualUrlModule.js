"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualUrlModule = void 0;
const InteractionModule_1 = require("../InteractionModule");
/**
 * This Module can be used to open a URL and interact manually in the browser.\
 * e.g. Use it to setup websites or simulate a unusual interaction. ...
 */
class ManualUrlModule extends InteractionModule_1.InteractionModule {
    /**
     * This Module ignores subscriptions.
     * @param url Is the url that is opened.
     */
    constructor(url) {
        super({
            id: 0,
            url: url,
            type: InteractionModule_1.InteractionModuleType.ManualUrl,
            executionTime: "atStart"
        });
    }
    /**
     * The runModule function just opens the url and nothing more.
     * @param sessionManagement
     */
    async runModule(sessionManagement) {
        const page = await sessionManagement.getContext().newPage();
        await page.goto(this.url);
        await page.pause();
        await page.close();
    }
    /**
     * This module doesn't need a setup since it is executed manually once.
     * @param sessionManagement
     */
    async runModuleSetup(sessionManagement) {
        const page = await sessionManagement.getContext().newPage();
        await page.goto(this.url);
        // await page.pause()
    }
}
exports.ManualUrlModule = ManualUrlModule;
