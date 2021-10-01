"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManagement = void 0;
const playwright_1 = require("playwright");
const OutputConfiguration_1 = require("./OutputConfiguration");
const fs = require('fs');
/**
 * This class keeps track of the current Session.
 *
 */
class SessionManagement {
    constructor(user, browser, outputDirectory) {
        this.user = user;
        this.browser = browser;
        this.context = null;
        console.log(outputDirectory); // TODO just for testing
        let outputConfiguration = new OutputConfiguration_1.OutputConfiguration(outputDirectory, user);
        // this.tempConfiguration = new TempConfiguration(user)
        this.outputConfiguration = outputConfiguration;
    }
    /**
     * Setup Session by doing following steps:
     * 1. Get the Device and assign it to the Session
     * 2. Set the sessionState if present
     * 3. Start Tracing the session
     */
    async setupSession() {
        //Set the device for emulation
        let usedDevice = playwright_1.devices[this.user.device];
        let contextOptions = { ...usedDevice };
        //Set the session if present
        let sessionPath = this.outputConfiguration.getSessionStatePath();
        if (this.outputConfiguration.sessionPathExists()) {
            //
            contextOptions.storageState = sessionPath;
        }
        this.context = await this.browser.newContext(contextOptions);
        /* PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
             blocker.enableBlockingInPage(page);
         });*/
        // this.context.storageState({path: sessionPath})
        // Start tracing before creating/navigating a page.
        await this.context.tracing.start({
            screenshots: true,
            snapshots: true
        });
        if (SessionManagement.sessionCounter == undefined) {
            SessionManagement.sessionCounter = 0;
            for (const indexModul of this.user.modules) {
                if (indexModul.executionTime.executeOnFirstStart()) {
                    await indexModul.runModule(this);
                }
            }
        }
        SessionManagement.sessionCounter++;
        console.log(SessionManagement.sessionCounter);
        // TODO  Accept Google Cookies:
    }
    /**
     * Will finish the session by following the steps:
     * 1. Save the SessionState
     * 2. End Tracing and write the traceFile to the output Folder
     * 3. Close the context
     * @param out
     */
    async finishSession() {
        await this.getContext().storageState({ path: this.outputConfiguration.getSessionStatePath() });
        await this.getContext().tracing.stop({
            path: this.outputConfiguration.getNewFilelocation("trace.zip")
        });
        await this.getContext().close();
    }
    getContext() {
        if (this.context == null) {
            throw new Error('Session wasn\'t started correctly. Context is still null. Make sure to call setupSession() before finishSession()');
        }
        else {
            return this.context;
        }
    }
}
exports.SessionManagement = SessionManagement;
