"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traceModule = exports.InteractionModule = exports.InteractionModuleType = void 0;
const Time_1 = require("../datamodels/Time");
/**
 * Every module runs a different Simulation. For more Documentation visit the class definitions.
 */
var InteractionModuleType;
(function (InteractionModuleType) {
    /**
     * See [[OpenUrlModule]]
     */
    InteractionModuleType[InteractionModuleType["OpenUrl"] = 0] = "OpenUrl";
    /**
     * See [[YouTubeAboModule]]
     */
    InteractionModuleType[InteractionModuleType["YouTubeAbo"] = 1] = "YouTubeAbo";
    /**
     * See [[ManualUrlModule]]
     */
    InteractionModuleType[InteractionModuleType["ManualUrl"] = 2] = "ManualUrl";
})(InteractionModuleType = exports.InteractionModuleType || (exports.InteractionModuleType = {}));
class InteractionModule {
    /**
     * Is used to create a new [[InteractionModule]] from a json file.
     * @param See [[IInteractionModule]] for more documentation.
     */
    constructor({ url, id, executionTime = "1200", subscriptions = [], type }) {
        this.url = url;
        this.id = id;
        this.type = type;
        this.executionTime = new Time_1.Time(executionTime);
        this.subscriptions = subscriptions;
    }
}
exports.InteractionModule = InteractionModule;
InteractionModule.idCount = 0; // Todo: For auto generating Ids.
/**
 * No longer needed since the SessionManagement handles all the tracing of the user.
 * @deprecated
 */
async function traceModule(browser, output, module) {
    const context = await browser.newContext();
    // Start tracing before creating / navigating a page.
    await context.tracing.start({
        screenshots: true,
        snapshots: true
    });
    //await module.runModule(context, output)
    // Stop tracing and export it into a zip archive.
    await context.tracing.stop({
        path: output.getNewFilelocation("session.zip")
    });
}
exports.traceModule = traceModule;
