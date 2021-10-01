import {Usermodel} from "../datamodels/Usermodel";
import {OUTPUTDIRECTORY} from "../Constants";
const fs = require('fs');

/**
 * Representing an Output Configuration
 * @module
 */
export class OutputConfiguration {

    /**
     * Holds the current directory for the output, depending on the date
     */
    directory: string
    /**
     * Holds the current executed User, so the output directory can be named after the user.
     */
    _user : Usermodel
    /**
     * TODO Keeps track of the number of traces or files already created.
     */
    _fileCounter : number //Todo: Check for override. Can be fatal mistake.
    private _date: Date

    /**
     * Set current date.
     * Set directory with date. (e.g. "out/date/")
     * Set filecouner to 0
     */
    constructor(outputDirectory: string) {
        this._date = new Date()
        this.directory = `${(outputDirectory)}/${this.dateFormated}`
        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory)
        }
        this._user = new Usermodel({})
        this._fileCounter = 0
    }

    /**
     * @return Date in format "year-month-day"\
     * e.g. "2021-12-30"
     */
    get dateFormated(): string {
        let ye = new Intl.DateTimeFormat('de', {year: 'numeric'}).format(this.date);
        let mo = new Intl.DateTimeFormat('de', {month: '2-digit'}).format(this.date);
        let da = new Intl.DateTimeFormat('de', {day: '2-digit'}).format(this.date);
        return `${ye}-${mo}-${da}`
    }

    get date(): Date {
        return this._date
    }

    /**
     * By setting the user also the directory will be created.
     * @param user
     */
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
    }

    /**
     * Appends the [[OutputConfiguration._fileCounter]] to the filename.
     * @param name (e.g. 1trace.zip, 2info.pdf, ...)
     */
    getNewFilelocation(name : string) : string{
        this._fileCounter++
        return `${this.userDirectory}/${this._fileCounter}${name}`
    }

    get userDirectory():string{
        return `${this.directory}/${this._user.name}`
    }

    isDirEmpty(dirname: string) {
        return fs.promises.readdir(dirname).then((files: any) => {
            return files.length === 0;
        });
    }
}