"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputConfiguration = void 0;
const fs = require('fs');
/**
 * Representing an Output Configuration
 * @module
 */
class OutputConfiguration {
    /**
     * Set current date.
     * Set directory with date. (e.g. "out/date/")
     * Set filecouner to 0
     */
    constructor(outputDirectory, user) {
        this._date = new Date();
        this.directory = this.createIfNotThere(`${outputDirectory}/${user.name}`);
        this.outDirectory = this.createIfNotThere(`${(this.directory)}/${this.dateFormated}`);
        this.tempDirectory = this.createIfNotThere(`${this.directory}/temp`);
        this._user = user;
        this._fileCounter = 0;
        this.writeUsermodel(user);
        this.writeContextOptions(user);
    }
    /**
     * @return Date in format "year-month-day"\
     * e.g. "2021-12-30"
     */
    get dateFormated() {
        let ye = new Intl.DateTimeFormat('de', { year: 'numeric' }).format(this.date);
        let mo = new Intl.DateTimeFormat('de', { month: '2-digit' }).format(this.date);
        let da = new Intl.DateTimeFormat('de', { day: '2-digit' }).format(this.date);
        return `${ye}-${mo}-${da}`;
    }
    /**
     * Getter for Date.
     */
    get date() {
        return this._date;
    }
    /*
        /!**
         * By setting the user also the directory will be created.
         * @param user
         *!/
        set user(user : Usermodel){
            this._user = user
            if (fs.existsSync(this.userDirectory)) {
                if(!this.isDirEmpty(this.userDirectory)){
                    let i = 0
                }
            }else{
                fs.mkdirSync(this.userDirectory)
            }
            this._fileCounter = 0
        }*/
    /**
     * Checks if the Directory exists and if not, will create the directory.
     */
    createIfNotThere(directory) {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }
        return directory;
    }
    /**
     * Appends the [[OutputConfiguration._fileCounter]] to the filename.
     * @param name (e.g. 1trace.zip, 2info.pdf, ...)
     */
    getNewFilelocation(name) {
        this._fileCounter++;
        return `${this.outDirectory}/${this._fileCounter}${name}`;
    }
    /*
        get userDirectory():string{
            return `${this.directory}/${this._user.name}`
        }*/
    isDirEmpty(dirname) {
        return fs.promises.readdir(dirname).then((files) => {
            return files.length === 0;
        });
    }
    // Temp Configuration
    /**
     * Gets the path of the sessionState.\
     * e.g. outputdirectory/temp/state.json
     */
    getSessionStatePath() {
        let sessionStatePath = `${this.tempDirectory}/state.json`;
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
     * Writes down the ContextOptions for a specific user. They can be read from the file or by calling user.contextOptions.build()
     */
    writeContextOptions(usermodel) {
        fs.writeFileSync(`${this.tempDirectory}/contextOptions.json`, JSON.stringify(usermodel.contextOptions.build(), null, 2), function (err) {
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
exports.OutputConfiguration = OutputConfiguration;
