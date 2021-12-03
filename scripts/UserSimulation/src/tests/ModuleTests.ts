import {Time} from "../datamodels/Time";
import {chromium, devices, LaunchOptions} from "playwright";
import {Protocol} from "playwright/types/protocol";
import {Subscription} from "../datamodels/Subscription";
import {Usermodel} from "../datamodels/Usermodel";
import {InteractionModule} from "../interactionModules/InteractionModule";
import {OpenUrlModule} from "../interactionModules/general/OpenUrlModule";

export class ModuleTests {

    static runModuleTests() {
        console.log("-------------------ModuleTests Start--------------------")

        /*
        this.testYoutube().then(r => {
        })
        */
        // this.testNextModules()

        console.log("-------------------ModuleTests End----------------------")
    }

    static async testYoutube(subscriptions : Subscription[] = ModuleTests.DEFAULT_SUBSCRIPTIONS) {

        // Get Context
        const browser = await chromium.launch({headless: false})

        const browserContext = await browser.newContext({
            "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4641.0 Safari/537.36",
            "screen": {
                "width": 1792,
                "height": 1120
            },
            "viewport": {
                "width": 1280,
                "height": 720
            },
            "deviceScaleFactor": 2,
            "isMobile": false,
            "hasTouch": false,
            // @ts-ignore
            "defaultBrowserType": "chromium",
            //...devices['Desktop Chrome HiDPI'],
            "locale": "de-DE",
            "timezoneId": "Europe/Berlin",
        })


        const page = await browserContext.newPage() // Create pages, interact with UI elements, assert values  await browser.close();})();
        await page.goto("https://www.youtube.com/watch?v=PwE5NqeeFk0")
        await page.pause()
        await browser.close()
    }

    public static get DEFAULT_SUBSCRIPTIONS():Subscription[] {
        return [
            new Subscription({name : "ZDFheute Nachrichten" , representation : "UCeqKIgPQfNInOswGRWt48kQ"}),
            new Subscription({name : "Rammstein Official" , representation : "UCYp3rk70ACGXQ4gFAiMr1SQ"}),
            new Subscription({name : "Daily Dose Of Internet" , representation : "UCdC0An4ZPNr_YiFiYoVbwaw"})
        ]
    }

    static testNextModules(){
        let testusermodel = new Usermodel({
            freqentlyVisits : [
                new OpenUrlModule({url:"test",executionTime:"12:15"}),
                new OpenUrlModule({url:"test",executionTime:"12:00"}),
                new OpenUrlModule({url:"test",executionTime:"11:00"})
            ]
        })
        console.log(testusermodel.nextTime)
        console.log(testusermodel.nextModules)
        let i = 3
    }
}
