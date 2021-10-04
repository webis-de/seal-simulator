import {TICKPERIOD} from "../Constants";

/**
 * The class is used to set and read the execution Time.
 */

export class Time {
    time?: number
    atStart: boolean

    /**
     *
     * @param string Pass a time as a string. \
     * "1000" for 10:00
     * "1230" for 12:30
     * "905" for 9:05
     * "start" will be executed once at the start of the simulation.
     */

    constructor(string: string) {
        this.atStart = false
        if (string == "start") {
            this.atStart = true
        } else {
            this.time = parseInt(string)
        }

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

    executeOnFirstStart() : boolean{
        return this.atStart
    }

    toString(){
        if(this.time != null){
            return this.time.toString()
        }else if (this.atStart){
            return "start"
        }else {
            return ""
        }
    }
}