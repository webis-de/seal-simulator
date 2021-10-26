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
        }).build();
        for (let im of freqentlyVisits) {
            switch (im.type) {
                case InteractionModule_1.InteractionModuleType.OpenUrl: {
                    this.freqentlyVisits.push(new OpenUrlModule_1.OpenUrlModule({ url: im.url, executionTime: im.executionTime.toString() }));
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
}
exports.Usermodel = Usermodel;
