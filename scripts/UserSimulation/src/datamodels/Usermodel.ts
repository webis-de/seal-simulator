// This Interface represents the Usermodel-Input from the json file
import {InteractionModule, InteractionModuleType} from "../interactionModules/InteractionModule";
import {Influence} from "./Influence";
import {OpenUrlModule} from "../interactionModules/general/OpenUrlModule";
import {Time} from "./Time";
import {ManualUrlModule} from "../interactionModules/general/ManualUrlModule";
import {BrowserContextOptions, Geolocation} from "playwright";
import {ContextOptions} from "./ContextOptions";

/**
 * The format of the json files that can be Used as an input.
 */
export interface IUsermodel {
    /**
     * Serves as a **unique identifier**.\
     * Is used to find the Session of the User with all its temp files.\
     * Is then used to write the output.
     */
    name?: string
    /**
     * Write down the interests of the user in format of [[IInfluence]]\
     * e.g. Hardrock, Metal, Juli Zeh...
     * @optional is used for building additional [[IInteractionModul]]
     */
    interests?: Influence[];
    /**
     * Write down the sources the user is influenced by in format of [[IInfluence]]\
     * e.g. Youtube, Google News, Reddit...
     * @optional is used for building additional [[IInteractionModul]]
     */
    influencedBy?: Influence[];
    /**
     * Write down the device that is used.\
     * Will emulate the website on the given device.\
     * Available devices can be found in [here](https://github.com/microsoft/playwright/blob/272759f296731faeaf8915f6e5a9270934e3c730/src/server/deviceDescriptorsSource.json)
     * @default Desktop Chrome HiDPI
     * @optional is used for building additional [[IInteractionModul]]
     */
    device?: string;
    /**
     * Sets a geolocation of the User and allows the browser to access the location of the user.
     * @default no geolocation permission
     */
    geolocation? : Geolocation
    /**
     * Sets the locale/language of the user
     * @Default de-DE
     */
    locale? : string
    /**
     * Sets the timezone of the User.
     * @default Europe/Berlin
     */
    timezoneId? : string
    /**
     * Represents the Routine of the User.\
     * Read the Documentation for [[IInteractionModule]] for more information.
     */
    freqentlyVisits?: InteractionModule[];
    /**
     * @alpha Will later be used to generate [[InteractionModule]]s from the interests and influences.
     */
    useBuilder?: boolean;

}


export class Usermodel {
    name: string
    contextOptions : ContextOptions
    intrests: Influence[]
    influencedBy: Influence[]
    freqentlyVisits: InteractionModule[]
    useBuilder: boolean

    /**
     * This is an essential part of the automated creation of the usermodel\
     * It needs to work of incomplete input json Data, from files, in form of the [[IUsermodel]]\
     * It also needs to work with complete json Data, from temp files\
     * It has a default User "Kevin" that is used as an empty user, by calling:
     *  ```typescript
     * new Usermodel({}) //empty user -> "Kevin"
     * ```
     *
     * @param intrests See [[IUsermodel]] for more documentation.
     * @param influencedBy See [[IUsermodel]] for more documentation.
     * @param freqentlyVisits See [[IUsermodel]] for more documentation.
     * @param useBuilder See [[IUsermodel]] for more documentation.
     * @param name See [[IUsermodel]] for more documentation.
     * @param device See [[IUsermodel]] for more documentation.
     */
    constructor({
                    interests = [],
                    influencedBy = [],
                    freqentlyVisits = [],
                    useBuilder = false,
                    name = "Kevin",
                    device = 'Desktop Chrome HiDPI',
                    locale = `de-DE`,
                    timezoneId = `Europe/Berlin`,
                    geolocation = undefined
                }: IUsermodel) {
        this.name = name
        this.intrests = interests
        this.influencedBy = influencedBy
        this.useBuilder = useBuilder
        this.freqentlyVisits = []
        this.contextOptions = new ContextOptions({
            device : device,
            locale: locale,
            timezoneId : timezoneId,
            geolocation:geolocation
        })

        for (let im of freqentlyVisits) {
            switch (+InteractionModuleType[im.type]) {
                case InteractionModuleType.OpenUrl: {
                    this.freqentlyVisits.push(new OpenUrlModule({url : im.url}))
                    break
                }
                case InteractionModuleType.ManualUrl: {
                    this.freqentlyVisits.push(new ManualUrlModule(im.url))
                    break
                }
                default: {
                    // Solution from: https://github.com/microsoft/TypeScript/issues/17198
                    let allPossibleInteractionModuleTypes = Object.keys(InteractionModuleType).filter(k => typeof InteractionModuleType[k as any] === `number`)
                    console.log(`No Module found for ... Please only use ${allPossibleInteractionModuleTypes}`)
                    break
                }

            }

        }
        // console.log(this)
    }

    /**
     * Get all [[InteractionModule]]s of the user.
     */
    get modules(): InteractionModule[] {
        return this.freqentlyVisits
    }

    toJSON() : IUsermodel{
        return {
            name : this.name,
            device : this.contextOptions.device,
            locale : this.contextOptions.locale,
            timezoneId : this.contextOptions.timezoneId,
            geolocation : this.contextOptions.geolocation,
            interests : this.intrests,
            influencedBy : this.influencedBy,
            freqentlyVisits : this.freqentlyVisits,
            useBuilder : this.useBuilder
        }
    }
}