import {Usermodel} from "../datamodels/Usermodel";
import {OUTPUTDIRECTORY, TEMPFOLDER} from "../Constants";
const fs = require('fs');

/**
 * Representing an Output Configuration
 * @module
 */
export class OutputConfiguration {

    /**
     * Holds the current directory for the output and temp files
     */
    _directory: string
    /**
     * Holds the current directory for the output, depending on the date
     */
    _outDirectory: string
    /**
     * Holds the current directory for the temp files like state.json, usermodel.json, and contextoptions
     */
    _tempDirectory: string
    /**
     * Holds the current executed User, so the output directory can be named after the user.
     */
    _user: Usermodel
    /**
     * TODO Keeps track of the number of traces or files already created.
     */
    _fileCounter: number //Todo: Check for override. Can be fatal mistake.
    /**
     *
     * @private
     */
    _sourceDirectory: string
    private _date: Date

    /**
     * Set current date.
     * Set directory with date. (e.g. "out/date/")
     * Set filecouner to 0
     */
    constructor(outputDirectory: string, user: Usermodel) {
        this._date = new Date()
        this._sourceDirectory = outputDirectory

        this._directory = `${outputDirectory}/scriptOutput`
        this.directory // Will create the folder if not there
        this._outDirectory = `${(this._directory)}/${this.dateFormated}`
        this._tempDirectory = `${this._directory}/temp`
        this.directory // Will create the folder if not there

        this._user = user
        this._fileCounter = 0

        this.writeOutput()

    }

    /**
     * Write Output for next execution:
     * 1. Write the Usermodel to name.json
     * 2. Write the ContextOptions of the User
     */
    writeOutput(){
        this.writeUsermodel(this._user)
        this.writeContextOptions(this._user)
    }

    /**
     * Create the directory just when its used
     */
    get directory() : string{
        return this.createIfNotThere(this._directory)
    }

    /**
     * Create the outDirectory just when its used
     */
    get outDirectory() : string{
        return this.createIfNotThere(this._outDirectory)
    }

    /**
     * Create the tempDirectory just when its used
     */
    get tempDirectory() : string{
        return this.createIfNotThere(this._tempDirectory)
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

    /**
     * Getter for Date.
     */
    get date(): Date {
        return this._date
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
    createIfNotThere(directory : string): string{
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory)
        }
        return directory
    }

    /**
     * Appends the [[OutputConfiguration._fileCounter]] to the filename.
     * @param name (e.g. 1trace.zip, 2info.pdf, ...)
     */
    getNewFilelocation(name : string) : string{
        this._fileCounter++
        return `${this.outDirectory}/${this._fileCounter}${name}`
    }
/*
    get userDirectory():string{
        return `${this.directory}/${this._user.name}`
    }*/

    isDirEmpty(dirname: string) {
        return fs.promises.readdir(dirname).then((files: any) => {
            return files.length === 0;
        });
    }

    // Temp Configuration


    /**
     * Gets the path of the sessionState.\
     * e.g. outputdirectory/temp/state.json
     */
    getSessionStatePath(): string {
        let sessionStatePath = `${this.tempDirectory}/state.json`
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
     * Writes down the ContextOptions for a specific user. They can be read from the file or by calling user.contextOptions.build()
     */
    writeContextOptions(usermodel : Usermodel){
        this.createIfNotThere(`${this._sourceDirectory}/browserContexts`)
        this.createIfNotThere(`${this._sourceDirectory}/browserContexts/default`)
        fs.writeFileSync(`${this._sourceDirectory}/browserContexts/default/browser.json`, JSON.stringify(usermodel.contextOptions.build(), null, 2), function (err: Error) {
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