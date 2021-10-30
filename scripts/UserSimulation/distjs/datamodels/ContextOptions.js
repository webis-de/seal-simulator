"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextOptions = void 0;
const playwright_1 = require("playwright");
class ContextOptions {
    constructor({ device = 'Desktop Chrome HiDPI', locale = `de-DE`, timezoneId = `Europe/Berlin`, geolocation = undefined }) {
        this.device = device;
        this.locale = locale;
        this.timezoneId = timezoneId;
        this.geolocation = geolocation;
    }
    build() {
        // let usedDevice = devices[this.device]
        let contextOptions = {
            ...playwright_1.devices[this.device],
            locale: this.locale,
            timezoneId: this.timezoneId,
        };
        let i = 3;
        if (this.geolocation != undefined) {
            contextOptions.geolocation = this.geolocation;
            contextOptions.permissions = [`geolocation`];
        }
        return contextOptions;
    }
}
exports.ContextOptions = ContextOptions;
