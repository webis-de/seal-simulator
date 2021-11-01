import {Time} from "../datamodels/Time";

export class UnitTests{

    static runUnitTests() {
        this.testTime()
    }

    public static testTime() {

        // Test 1
        let time1 = new Time(760)
        let time2 = new Time("12:40")
        if (!time1.equals(time2)) {
            throw new Error(`Test failed: ${time1} != ${time2}`)
        }

        // Test 2
        let test2failed = false
        try {
            let time3 = new Time("15:60")
            test2failed = true
            let time4 = new Time("25:50")
            test2failed = true
        } catch (e) {

        }
        let time3 = new Time("15:30")
        let time4 = new Time("15:50")
        if (test2failed) {
            throw new Error(`Test failed should not create times with more than 24 hours or 60 minutes `)
        }

        // Test 3
        if (time3.minus(time4) != -20) {
            throw Error(`Test failed, division is not -20`)
        }
        if (time4.minus(time3) != 20) {
            throw Error(`Test failed, division is not 20`)
        }

        // Test 4
        let time5 = Time.getCurrentTime() // User Debugging to see if the time is right
        if(!time5.isNow()){
            throw Error(`Test failed, the current Time is not created right or the time check is broken.`)
        }
        // console.log(time5)

        //Test 5
        //Change Time one that is accepted (e.g. 10 min in past)
        let time6 = new Time("11:20")
        if(!time6.isNow()){
        //    throw Error(`Test failed, the current Time is not created right or the time check is broken.`)
        }

    }
}