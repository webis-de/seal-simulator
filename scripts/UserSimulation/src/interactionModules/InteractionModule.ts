import {Subscription} from "../datamodels/Subscription";
import {Browser, BrowserContext} from "playwright";
import {OutputConfiguration} from "../io/OutputConfiguration";
import {Protocol} from "playwright/types/protocol";
import Tracing = Protocol.Tracing;
import {SessionManagement} from "../io/SessionManagement";
import {Time} from "../datamodels/Time";

/**
 * Every module runs a different Simulation. For more Documentation visit the class definitions.
 */
export enum InteractionModuleType{
    /**
     * See [[OpenUrlModule]]
     */
    OpenUrl,
    /**
     * See [[YouTubeAboModule]]
     */
    YouTubeAbo,
    /**
     * See [[ManualUrlModule]]
     */
    ManualUrl
}
/**
 * Minimum requirements for every interaction module.
 */
export interface IInteractionModule {
    /**
     * See [[InteractionModule.url]]
     */
    url: string;
    /**
     * See [[InteractionModule.id]]
     */
    id?: number;
    /**
     * See [[InteractionModule.type]]
     */
    type? :InteractionModuleType;
    /**
     * See [[InteractionModule.executionTime]]
     */
    executionTime?: string;
    /**
     * See [[InteractionModule.subscriptions]]
     */
    subscriptions? : Subscription[];
}

export abstract class InteractionModule {
    /**
     * Defines the start url for the given Module
     */
    url: string;
    /**
     * Is the Ref ID to make all the Modules in a usermodel unique. If more then one usermodel is in use, IDs can appear more than once too.
     * @protected
     */
    protected id: number;
    /**
     * Is the type of the module. See enum {@link InteractionModuleType} for more information.
     */
    type : InteractionModuleType;
    /**
     * Specify the time of the day this routine is called.\
     * See the documentation of [[Time]] for more Information.
     */
    executionTime: Time;
    /**
     *
     * @protected Is a list of all the members for a given module. They can vary in their meaning. For Youtube it could represent subscriptions, for instagram follows or for google news it could be relevant topics.
     */
    protected subscriptions: Subscription[];
    private static idCount = 0 // Todo: For auto generating Ids.

    /**
     * Is used to create a new [[InteractionModule]] from a json file.
     * @param See [[IInteractionModule]] for more documentation.
     */
    protected constructor({url, id, executionTime = "12:00", subscriptions=[], type }: IInteractionModule) {
        this.url = url
        if(id == undefined){
            throw new Error("ID cant be left empty when creating an Interaction Module")
        }else this.id = id
        if(type == undefined){
            throw new Error("Type cant be left empty when creating an Interaction Module")
        }else this.type = type
        this.executionTime = new Time(executionTime)
        this.subscriptions = subscriptions
    }

    /**
     * Run Module is the main function on every module. It gets called if the executionTime is now.
     * @param sessionManagement
     */
    abstract runModule(sessionManagement : SessionManagement) :  Promise<void>

    /**
     * This function is called on the fist start of the simulation. The function is used to setup the session. \
     * e.g. Accept Cookies, Log in Accounts, set Subscriptions, ...
     * @param sessionManagement
     */
    abstract runModuleSetup(sessionManagement : SessionManagement) :  Promise<void>

}

/**
 * No longer needed since the SessionManagement handles all the tracing of the user.
 * @deprecated
 */
export async function traceModule(browser: Browser, output : OutputConfiguration,module: InteractionModule){

    const context = await browser.newContext();

// Start tracing before creating / navigating a page.
    await context.tracing.start(
    {
        screenshots: true,
            snapshots: true
    });

    //await module.runModule(context, output)

// Stop tracing and export it into a zip archive.
    await context.tracing.stop(
    {
        path: output.getNewFilelocation("session.zip")
    });
}