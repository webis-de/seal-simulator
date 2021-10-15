"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Time = void 0;
const Constants_1 = require("../Constants");
/**
 * The class is used to set and read the execution Time.
 */
class Time {
    /**
     *
     * @param string Pass a time as a string. \
     * "1000" for 10:00
     * "1230" for 12:30
     * "905" for 9:05
     * "start" will be executed once at the start of the simulation.
     */
    constructor(time) {
        switch (typeof time) {
            case "string":
                this._time = 0; // will be overwritten
                this._timeAsString = ""; // will be overwritten
                this.timeAsString = time;
                break;
            case "number":
                this._time = 0; // will be overwritten
                this._timeAsString = ""; // will be overwritten
                this.timeAsString = time;
                break;
            default:
                throw new Error("Time needs to be a String or a Number");
        }
        if (time)
            type == string;
        {
        }
        {
        }
    }
    set timeAsString(time) {
        this._timeAsString = time;
        this._time = this.convertStringTimeToTime(time);
        this.checkTime();
    }
    set time(time) {
        this._time = time;
        this._timeAsString =
        ;
    }
    convertStringTimeToTime(timeAsString) {
        if (timeAsString == "atStart") {
            return -1;
        }
        let splitedStrings = timeAsString.split(":");
        let hours = parseInt(splitedStrings[0]);
        let minutes = parseInt(splitedStrings[1]);
        return hours * 60 + minutes;
    }
    convertTimeToStringTime(time) {
        if (time == -1) {
            return "atStart";
        }
        let hours = Math.floor(time / 60);
        let minutes = parseInt(splitedStrings[1]);
        return `${}:${}`;
    }
    isNow() {
        let now = new Date();
        let dateStringNow = now.getHours().toString() + now.getMinutes().toString(); // "930"
        let timePeriod = Constants_1.TICKPERIOD / 60000; // timeperiod in min
        if (this.time != null) {
            // TODO 1000 - 930 = 70 ... Liegt aber nur 30 min zurück nicht 70. Besser mit echten Zeiten rechnen
            // Less than 0 means execution is in future.
            let timeDifference = parseInt(dateStringNow) - this.time;
            // timeDifference needs to be between 0 and the timePeriod of the ExecutionIntervall
            return (timeDifference < timePeriod && timeDifference >= 0);
        }
        else {
            return false;
        }
    }
    plus(time) {
        let newTime = new Time(time._time + this._time);
        while (newTime > 1440) {
            newTime.
            ;
        }
    }
    checkTime() {
        if (this._time < -1 || this._time > 1440) {
            throw new Error("The Time needs to be between -1 and 1440");
        }
    }
    executeOnFirstStart() {
        return (this._time == -1);
    }
    toString() {
        return this._timeAsString;
    }
}
exports.Time = Time;
