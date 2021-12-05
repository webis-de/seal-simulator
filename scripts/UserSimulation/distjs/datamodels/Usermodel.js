"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usermodel = void 0;
// This Interface represents the Usermodel-Input from the json file
const InteractionModule_1 = require("../interactionModules/InteractionModule");
const OpenUrlModule_1 = require("../interactionModules/general/OpenUrlModule");
const ManualUrlModule_1 = require("../interactionModules/general/ManualUrlModule");
const ContextOptions_1 = require("./ContextOptions");
const UsermodelLoading_1 = require("../io/UsermodelLoading");
class Usermodel {
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
    constructor({ interests = [], influencedBy = [], freqentlyVisits = [], useBuilder = false, name = "Kevin", device = 'Desktop Chrome HiDPI', locale = `de-DE`, timezoneId = `Europe/Berlin`, geolocation = undefined }) {
        this.name = name;
        this.interests = interests;
        this.influencedBy = influencedBy;
        this.useBuilder = useBuilder;
        this.freqentlyVisits = [];
        this.contextOptions = new ContextOptions_1.ContextOptions({
            device: device,
            locale: locale,
            timezoneId: timezoneId,
            geolocation: geolocation
        });
        for (let im of freqentlyVisits) {
            switch (im.type) {
                case InteractionModule_1.InteractionModuleType.OpenUrl: {
                    this.freqentlyVisits.push(new OpenUrlModule_1.OpenUrlModule({
                        url: im.url,
                        executionTime: im.executionTime.toString()
                    }));
                    break;
                }
                case InteractionModule_1.InteractionModuleType.ManualUrl: {
                    this.freqentlyVisits.push(new ManualUrlModule_1.ManualUrlModule(im.url));
                    break;
                }
                default: {
                    // Solution from: https://github.com/microsoft/TypeScript/issues/17198
                    let allPossibleInteractionModuleTypes = Object.values(InteractionModule_1.InteractionModuleType);
                    console.log(`No Module found for ... Please only use ${allPossibleInteractionModuleTypes}`);
                    break;
                }
            }
        }
        // console.log(this)
    }
    /**
     * Get all [[InteractionModule]]s of the user.
     */
    get modules() {
        return this.freqentlyVisits;
    }
    get nextModules() {
        let nextTime = this.nextTime;
        return this.modules.filter(value => value.timeToExecution() == nextTime);
    }
    get startModules() {
        // TODO Add Modules that got a setupMethod (needsSetup)
        return this.modules.filter(value => value.executionTime.isAtStart);
    }
    get nextTime() {
        let nextTimeArray = this.modules.map(value => {
            return value.timeToExecution();
        });
        return Math.min(...nextTimeArray);
        function old() {
            let nextTimeArrayPositives = nextTimeArray.filter(num => num >= 1);
            // If there are Modules in the Future of the same Day
            // -> nextTimeArrayPositives is not Empty
            // -> take the Module that's next in the line
            if (nextTimeArrayPositives.length > 0) {
                return Math.min(...nextTimeArrayPositives);
            }
            else {
                //If the are no more Modules on the same day left return the first of the next day
                // -> first one of nextTimeArrayNegatives
                return Math.min(...nextTimeArray);
            }
        }
    }
    toJSON() {
        return {
            name: this.name,
            device: this.contextOptions.device,
            locale: this.contextOptions.locale,
            timezoneId: this.contextOptions.timezoneId,
            geolocation: this.contextOptions.geolocation,
            interests: this.interests,
            influencedBy: this.influencedBy,
            freqentlyVisits: UsermodelLoading_1.arrayToJson(this.freqentlyVisits),
            useBuilder: this.useBuilder
        };
    }
    toString() {
        return `My name is ${this.name} ${this.interestsToString()}\n${this.influenceToString()}\n`;
    }
    interestsToString() {
        let interests = this.interests;
        let text = function () {
            switch (interests.length) {
                case 0:
                    return `and sadly there is nothing that is interesting for me.`;
                case 1:
                    return `and I am very interested in ${interests[0].name}.`;
                default: {
                    let interestsArrayString = `and my interests are `;
                    for (let i = 0; i < interests.length; i++) {
                        switch (i + 1) {
                            case interests.length:
                                interestsArrayString += ` and especially ${interests[0].name}.`;
                                break;
                            case (interests.length - 1):
                                interestsArrayString += `${interests[i + 1].name}`;
                                break;
                            default:
                                interestsArrayString += `${interests[i + 1].name}, `;
                                break;
                        }
                    }
                    return interestsArrayString;
                }
            }
        };
        return text();
    }
    influenceToString() {
        let influences = this.influencedBy;
        let text = function () {
            switch (influences.length) {
                case 0:
                    return `I think I am very independent, so there’s nothing that causes an influence on my behaviour in the web.`;
                case 1:
                    return `In the recent time ${influences[0].name} is quite an influence for me.`;
                default: {
                    let influencesArrayString = `In the recent time ${influences[0].name} is quite an influence for me. I also consume `;
                    for (let i = 1; i < influences.length; i++) {
                        switch (i) {
                            case (influences.length - 1): // Last Influence in Array
                                influencesArrayString += `or ${influences[i].name}.`;
                                break;
                            case (influences.length - 2): // Second Last Influence in Array
                                influencesArrayString += `${influences[i].name} `;
                                break;
                            default:
                                influencesArrayString += `${influences[i].name}, `;
                                break;
                        }
                    }
                    return influencesArrayString;
                }
            }
        };
        return text();
    }
}
exports.Usermodel = Usermodel;
