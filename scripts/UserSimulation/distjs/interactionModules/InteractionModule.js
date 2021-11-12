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
    InteractionModuleType["OpenUrl"] = "OpenUrl";
    /**
     * See [[YouTubeAboModule]]
     */
    InteractionModuleType["YouTubeAbo"] = "YouTubeAbo";
    /**
     * See [[ManualUrlModule]]
     */
    InteractionModuleType["ManualUrl"] = "ManualUrl";
})(InteractionModuleType = exports.InteractionModuleType || (exports.InteractionModuleType = {}));
class InteractionModule {
    /**
     * Is used to create a new [[InteractionModule]] from a json file.
     * @param See [[IInteractionModule]] for more documentation.
     */
    constructor({ url, id, executionTime = "12:00", subscriptions = [], type }) {
        this.url = url;
        if (id == undefined) {
            throw new Error("ID cant be left empty when creating an Interaction Module");
        }
        else
            this.id = id;
        if (type == undefined) {
            throw new Error("Type cant be left empty when creating an Interaction Module");
        }
        else
            this.type = type;
        this.executionTime = new Time_1.Time(executionTime);
        this.subscriptions = subscriptions;
    }
    toString() {
        return this.toJson();
    }
    toJson() {
        return {
            url: this.url,
            id: this.id,
            type: this.type,
            executionTime: this.executionTime.toJson(),
            subscriptions: this.subscriptions
        };
    }
    /**
     * Returns time until execution time in Minutes
     */
    timeToExecution() {
        let difference = this.executionTime.getDifferenceInMinutes();
        /*
                    Minutes of the Day - Minutes passed since last execution of the first Module of the Day
                    0 -> Start of the day
                    24 -> End of the day
                            <-----------nextTime------------->
                    0.....FIM........IM.............IM.......now.....24
                 */
        if (difference <= 0) {
            return 60 * 24 + difference;
        }
        else {
            return difference;
        }
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
