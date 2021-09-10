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
    constructor(string) {
        this.atStart = false;
        if (string == "start") {
            this.atStart = true;
        }
        else {
            this.time = parseInt(string);
        }
    }
    isNow() {
        let now = new Date();
        let dateStringNow = now.getHours().toString() + now.getMinutes().toString(); // "930"
        let timePeriod = Constants_1.TICKPERIOD / 60000; // timeperiod in min
        if (this.time != null) {
            // Less than 0 means execution is in future.
            let timeDifference = parseInt(dateStringNow) - this.time;
            // timeDifference needs to be between 0 and the timePeriod of the ExecutionIntervall
            return (timeDifference < timePeriod && timeDifference >= 0);
        }
        else {
            return false;
        }
    }
    executeOnFirstStart() {
        return this.atStart;
    }
    toString() {
        if (this.time != null) {
            return this.time.toString();
        }
        else if (this.atStart) {
            return "start";
        }
        else {
            return "";
        }
    }
}
exports.Time = Time;
