import {Usermodel} from "../datamodels/Usermodel";
import {Browser, BrowserContext, BrowserContextOptions, devices} from "playwright";
import {OutputConfiguration} from "./OutputConfiguration";
import {OUTPUTDIRECTORY, TEMPFOLDER} from "../Constants";
import {TempConfiguration} from "./TempConfiguration";
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
    browser: Browser
    private context: BrowserContext | null
    outputConfiguration: OutputConfiguration
    tempConfiguration: TempConfiguration

    static sessionCounter : number

    constructor(user: Usermodel, browser: Browser) {
        this.user = user
        this.browser = browser
        this.context = null
        let outputConfiguration = new OutputConfiguration()
        this.tempConfiguration = new TempConfiguration(user)
        this.outputConfiguration = outputConfiguration
    }

    /**
     * Setup Session by doing following steps:
     * 1. Get the Device and assign it to the Session
     * 2. Set the sessionState if present
     * 3. Start Tracing the session
     */
    async setupSession() {
        this.outputConfiguration.user = this.user

        //Set the device for emulation
        let usedDevice = devices[this.user.device]
        let contextOptions : BrowserContextOptions = {...usedDevice}

        //Set the session if present
        let sessionPath = this.tempConfiguration.getSessionStatePath()
        if(this.tempConfiguration.sessionPathExists()){
            //
            contextOptions.storageState = sessionPath
        }

        this.context = await this.browser.newContext(contextOptions)

        // TODO ADBlocker
       /* PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
            blocker.enableBlockingInPage(page);
        });*/

        // this.context.storageState({path: sessionPath})
        // Start tracing before creating/navigating a page.
        await this.context.tracing.start(
            {
                screenshots: true,
                snapshots: true
            });

        if(SessionManagement.sessionCounter == undefined){
            SessionManagement.sessionCounter = 0
            for (const indexModul of this.user.modules) {
                if(indexModul.executionTime.executeOnFirstStart()){
                    await indexModul.runModule(this);
                }
            }
        }
        SessionManagement.sessionCounter++
        console.log(SessionManagement.sessionCounter)
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

        await this.getContext().storageState({path: this.tempConfiguration.getSessionStatePath()})
        await this.getContext().tracing.stop(
            {
                path: this.outputConfiguration.getNewFilelocation("trace.zip")
            })
        await this.getContext().close()
    }

    getContext(): BrowserContext {
        if (this.context == null) {
            throw new Error('Session wasn\'t started correctly. Context is still null. Make sure to call setupSession() before finishSession()');
        } else {
            return this.context
        }
    }

    getSessionStatePath(): string {
        // TODO get the storageState
        // it empty create one

        return ""
    }


}