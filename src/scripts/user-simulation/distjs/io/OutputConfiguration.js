"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputConfiguration = void 0;
const Usermodel_1 = require("../datamodels/Usermodel");
const Constants_1 = require("../Constants");
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
    constructor() {
        this._date = new Date();
        this.directory = `${(Constants_1.OUTPUTDIRECTORY)}/${this.dateFormated}`;
        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory);
        }
        this._user = new Usermodel_1.Usermodel({});
        this._fileCounter = 0;
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
    get date() {
        return this._date;
    }
    /**
     * By setting the user also the directory will be created.
     * @param user
     */
    set user(user) {
        this._user = user;
        if (fs.existsSync(this.userDirectory)) {
            if (!this.isDirEmpty(this.userDirectory)) {
                let i = 0;
            }
        }
        else {
            fs.mkdirSync(this.userDirectory);
        }
        this._fileCounter = 0;
    }
    /**
     * Appends the [[OutputConfiguration._fileCounter]] to the filename.
     * @param name (e.g. 1trace.zip, 2info.pdf, ...)
     */
    getNewFilelocation(name) {
        this._fileCounter++;
        return `${this.userDirectory}/${this._fileCounter}${name}`;
    }
    get userDirectory() {
        return `${this.directory}/${this._user.name}`;
    }
    isDirEmpty(dirname) {
        return fs.promises.readdir(dirname).then((files) => {
            return files.length === 0;
        });
    }
}
exports.OutputConfiguration = OutputConfiguration;
