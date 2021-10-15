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
    private _time: integer

    /**
     * Displayes the execution Time of the Transaction Module in format "hh:mm" or "atStart"
     * @private
     */
    private _timeAsString : string

    /**
     *
     * @param string Pass a time as a string. \
     * "1000" for 10:00
     * "1230" for 12:30
     * "905" for 9:05
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
                this.timeAsString = time
                break;
            default:
                throw new Error("Time needs to be a String or a Number")
        }
        if(time type == string){

        }else{

        }

    }

    set timeAsString(time : string){
        this._timeAsString = time
        this._time = this.convertStringTimeToTime(time)
        this.checkTime()
    }

    set time(time : number){
        this._time = time
        this._timeAsString =
    }

    convertStringTimeToTime(timeAsString : string) : number {
        if(timeAsString == "atStart"){
            return -1
        }
        let splitedStrings = timeAsString.split(":")
        let hours = parseInt(splitedStrings[0])
        let minutes = parseInt(splitedStrings[1])
        return hours*60 + minutes
    }

    convertTimeToStringTime(time : number) : string{
        if(time == -1){
            return "atStart"
        }
        let hours = Math.floor(time / 60)
        let minutes = parseInt(splitedStrings[1])
        return `${}:${}`
    }

    isNow() : boolean{
        let now = new Date()
        let dateStringNow = now.getHours().toString() + now.getMinutes().toString() // "930"
        let timePeriod = TICKPERIOD / 60000 // timeperiod in min
        if(this.time != null) {
            // TODO 1000 - 930 = 70 ... Liegt aber nur 30 min zurück nicht 70. Besser mit echten Zeiten rechnen
            // Less than 0 means execution is in future.
            let timeDifference = parseInt(dateStringNow) - this.time
            // timeDifference needs to be between 0 and the timePeriod of the ExecutionIntervall
            return (timeDifference < timePeriod && timeDifference >= 0)
        }else{
            return false
        }
    }

    plus(time : Time): Time {
        let newTime = new Time(time._time + this._time)
        while(newTime > 1440){
            newTime.
        }
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
}