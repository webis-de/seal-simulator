import {TICKPERIOD} from "../Constants";

/**
 * The class is used to set and read the execution Time.
 */

export class Time {
    /**
     * 0 till 1440 represents all minutes of a Day
     * -1 means execute at Start
     * @private
     */
    private _time: number

    /**
     * Displayes the execution Time of the Transaction Module in format "hh:mm" or "atStart"
     * @private
     */
    private _timeAsString : string

    /**
     *
     * @param string Pass a time as a string. \
     * "10:00" for 10:00
     * "12:30" for 12:30
     * "09:05" for 9:05
     * "start" will be executed once at the start of the simulation.
     */

    constructor(time : any) {
        switch (typeof time) {
            case "string":
                this._time = 0 // will be overwritten
                this._timeAsString = "" // will be overwritten
                this.timeAsString = time
                break;
            case "number":
                this._time = 0 // will be overwritten
                this._timeAsString = "" // will be overwritten
                this.time = time
                break;
            default:
                throw new Error("Time needs to be a String or a Number")
        }
    }

    set timeAsString(time : string){
        this._timeAsString = time
        this._time = this.convertStringTimeToTime(time)
        this.checkTime()
    }

    set time(time : number){
        this._time = time
        this._timeAsString = this.convertTimeToStringTime(time)
        this.checkTime()
    }

    convertStringTimeToTime(timeAsString : string) : number {
        if(timeAsString == "atStart"){
            return -1
        }
        if(!timeAsString.includes(":") && timeAsString.length >= 4 && timeAsString.length <= 5)
            throw Error("The Time is not in the right format. it needs to be like \"hh:mm\" or \"atStart\"")
        let splitedStrings = timeAsString.split(":")
        let hours = parseInt(splitedStrings[0])
        if(hours > 24){
            throw Error("The time can't have more than 24 hours.")
        }
        let minutes = parseInt(splitedStrings[1])
        if(minutes >= 60){
            throw Error("The time can't have more than 60 minutes.")
        }
        return hours*60 + minutes
    }

    convertTimeToStringTime(time : number) : string{
        if(time == -1){
            return "atStart"
        }
        return `${this.hours}:${this.minutes}`
    }

    isNow() : boolean{
        /**
         * check if it the Module should be executed Only Once
         */
        if(this.executeOnFirstStart()){
            return false
        }
        /**
         * Sets the timer for the periodicly executing SealScript
         */
        let timePeriod = TICKPERIOD / 60000
        let currentTime = Time.getCurrentTime()
        let timeDifference = currentTime.minus(this)
        return (timeDifference < timePeriod && timeDifference >= 0)
        /*let dateStringNow = now.getHours().toString() + now.getMinutes().toString() // "930"
         // timeperiod in min
        if(this.time != null) {
            // Less than 0 means execution is in future.
            let timeDifference = parseInt(dateStringNow) - this.time
            // timeDifference needs to be between 0 and the timePeriod of the ExecutionIntervall
            return (timeDifference < timePeriod && timeDifference >= 0)
        }else{
            return false
        }*/
    }

    plus(time : Time): number {
        // let newTime = new Time( this._time + time._time)
        /*while(newTime._time > 1440){
            newTime = newTime.minus(new Time(1440))
        }*/
        return this._time + time._time
    }

    minus(time : Time): number {
        // let newTime = new Time( this._time - time._time)
        /*while(newTime._time < 0){
            newTime = newTime.plus(new Time(1440))
        }*/
        return this._time - time._time
    }

    get hours(): number {
        return Math.floor(this._time / 60)
    }

    get minutes(): number {
        return this._time - (this.hours * 60)
    }

    get isAtStart(): boolean {
        return this._time == -1
    }

    equals(time: Time): boolean {
        return (time._time == this._time)
    }

    public static getCurrentTime(): Time {
        let now = new Date()
        return new Time(now.getHours() * 60 + now.getMinutes())
    }

    private toDate() : Date{
        let now = new Date()
        now.setHours(this.hours)
        now.setMinutes(this.minutes)
        return now
    }

    private checkTime(){
        if(this._time < -1 || this._time >1440){
            throw new Error("The Time needs to be between -1 and 1440")
        }
    }

    executeOnFirstStart() : boolean{
        return (this._time == -1)
    }

    toString(){
        return this._timeAsString
    }

    toJson(){
        return this.toString()
    }

    getDifferenceInMinutes() : number {
        // let minutesNow = new Date().getMinutes()
        // let minutesTime = this.toDate().getMinutes()
        return this.minus(Time.getCurrentTime())
    }
}