import {Time} from "../datamodels/Time";
import {chromium, devices, LaunchOptions} from "playwright";
import {Protocol} from "playwright/types/protocol";

export class ModuleTests {

    static runModuleTests() {
        this.testYoutube().then(r => {
        })
    }

    static async testYoutube() {

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
}
