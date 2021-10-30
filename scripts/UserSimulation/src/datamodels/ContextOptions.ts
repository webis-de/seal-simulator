import {BrowserContextOptions, devices, Geolocation} from "playwright";

export interface IContextOptions {
    device: string
    geolocation? : Geolocation
    locale : string
    timezoneId : string
}

export class ContextOptions{
    device: string
    // geolocation: { longitude: 48.858455, latitude: 2.294474 },  permissions: ['geolocation']
    geolocation? : Geolocation
    locale : string
    timezoneId : string
    constructor({
                    device = 'Desktop Chrome HiDPI',
                    locale = `de-DE`,
                    timezoneId = `Europe/Berlin`,
                    geolocation = undefined
                }:IContextOptions) {
        this.device = device
        this.locale = locale
        this.timezoneId = timezoneId
        this.geolocation = geolocation
    }

    build() : BrowserContextOptions{
        // let usedDevice = devices[this.device]
        let contextOptions: BrowserContextOptions = {
            ...devices[this.device],
            locale: this.locale,
            timezoneId: this.timezoneId,
        }
        let i = 3
        if(this.geolocation != undefined){
            contextOptions.geolocation = this.geolocation
            contextOptions.permissions = [`geolocation`]
        }

        return contextOptions
    }
}