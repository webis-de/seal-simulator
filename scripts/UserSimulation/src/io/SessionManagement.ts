import {Usermodel} from "../datamodels/Usermodel";
import {Browser, BrowserContext, BrowserContextOptions, devices} from "playwright";
import {OutputConfiguration} from "./OutputConfiguration";
import {OUTPUTDIRECTORY, TEMPFOLDER} from "../Constants";
// import {TempConfiguration} from "./TempConfiguration";
import {expect} from "playwright/types/test";
// import { PlaywrightBlocker } from '@cliqz/adblocker-playwright';
// import fetch from 'cross-fetch';
import {Protocol} from "playwright/types/protocol";


const fs = require('fs');

/**
 * This class keeps track of the current Session.
 *
 */
export class SessionManagement {
    user: Usermodel
    private context: BrowserContext
    outputConfiguration: OutputConfiguration
    // tempConfiguration: TempConfiguration

    static sessionCounter : number

    constructor(user: Usermodel, browserContext: BrowserContext, outputDirectory: string) {
        this.user = user
        this.context = browserContext

        let outputConfiguration = new OutputConfiguration(outputDirectory, user)
        // this.tempConfiguration = new TempConfiguration(user)
        this.outputConfiguration = outputConfiguration
    }

    /**
     * Setup Session by doing following steps:
     * 1. Get the Device and assign it to the Session
     * 2. Set the sessionState if present
     * 3. Start Tracing the session
     */
    async setupSession() {

        //Set the contextOptions for emulation
        // let usedDevice = devices[this.user.device]
        let contextOptions : BrowserContextOptions = this.user.contextOptions.build()

        //Set the session if present
        let sessionPath = this.outputConfiguration.getSessionStatePath()
        if(this.outputConfiguration.sessionPathExists()){
            //
            contextOptions.storageState = sessionPath
        }


       /* PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
            blocker.enableBlockingInPage(page);
        });*/

        // this.context.storageState({path: sessionPath})
        // Start tracing before creating/navigating a page.

        if(SessionManagement.sessionCounter == undefined){
            SessionManagement.sessionCounter = 0
            for (const indexModul of this.user.modules) {
                if(indexModul.executionTime.executeOnFirstStart()){
                    await indexModul.runModule(this);
                }
            }
        }
        SessionManagement.sessionCounter++
        // console.log(SessionManagement.sessionCounter)

    }

    /**
     * Will finish the session by following the steps:
     * 1. Save the SessionState
     * 2. End Tracing and write the traceFile to the output Folder
     * 3. Close the context
     * @param out
     */
    async finishSession() {
        this.outputConfiguration.writeOutput()
        await this.getContext().storageState({path: this.outputConfiguration.getSessionStatePath()})
        /*await this.getContext().tracing.stop(
            {
                path: this.outputConfiguration.getNewFilelocation("trace.zip")
            })*/
        // await this.getContext().close()
    }

    getContext(): BrowserContext {
        if (this.context == null) {
            throw new Error('Session wasn\'t started correctly. Context is still null. Make sure to call setupSession() before finishSession()');
        } else {
            return this.context
        }
    }
}