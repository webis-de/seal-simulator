"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempConfiguration = void 0;
const Constants_1 = require("../Constants");
const fs = require('fs');
/**
 * Representing a Configuration for Temporal Files
 * @module
 */
class TempConfiguration {
    constructor(user) {
        this.directory = function () {
            let FOLDER = `${Constants_1.TEMPFOLDER}/${user.name}`;
            if (!fs.existsSync(FOLDER)) {
                fs.mkdirSync(FOLDER);
            }
            return FOLDER;
        }();
        this.writeUsermodel(user);
    }
    /**
     * Gets the path of the sessionState.\
     * e.g. temp/username/state.json
     */
    getSessionStatePath() {
        let sessionStatePath = `${this.directory}/state.json`;
        //
        return sessionStatePath;
    }
    /**
     * Writes down an internal usermodel object to a json file.
     * @param usermodel The usermodel that needs to be written
     */
    writeUsermodel(usermodel) {
        fs.writeFileSync(`${this.directory}/${usermodel.name}.json`, JSON.stringify(usermodel, null, 2), function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
    /**
     * Checks if the user already has a saved sessionState.
     */
    sessionPathExists() {
        if (fs.existsSync(this.getSessionStatePath()))
            return true;
        else
            return false;
    }
}
exports.TempConfiguration = TempConfiguration;
