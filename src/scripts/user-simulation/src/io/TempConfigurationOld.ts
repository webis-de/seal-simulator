import {Usermodel} from "../datamodels/Usermodel";
import {OUTPUTDIRECTORY, TEMPFOLDER} from "../Constants";
const fs = require('fs');

/**
 * Representing a Configuration for Temporal Files
 * @module
 */
export class TempConfiguration {
    directory : string

    constructor(user:Usermodel) {
        this.directory = function () : string {
            let FOLDER = `${TEMPFOLDER}/${user.name}`
            if (!fs.existsSync(FOLDER)) {
                fs.mkdirSync(FOLDER)
            }
            return FOLDER
        }()
        this.writeUsermodel(user)
    }

    /**
     * Gets the path of the sessionState.\
     * e.g. temp/username/state.json
     */
    getSessionStatePath(): string {
        let sessionStatePath = `${this.directory}/state.json`
        //
        return sessionStatePath
    }
    /**
     * Writes down an internal usermodel object to a json file.
     * @param usermodel The usermodel that needs to be written
     */
    writeUsermodel(usermodel: Usermodel) {
        fs.writeFileSync(`${this.directory}/${usermodel.name}.json`, JSON.stringify(usermodel, null, 2), function (err: Error) {
            if (err) {
                console.log(err);
            }
        });
    }

    /**
     * Checks if the user already has a saved sessionState.
     */
    sessionPathExists() {
        if(fs.existsSync(this.getSessionStatePath()))
            return true;
        else return false;
    }
}