import {Usermodel} from "../datamodels/Usermodel";
import {InteractionModule, traceModule} from "../interactionModules/InteractionModule";
import {OutputConfiguration} from "./OutputConfiguration";
import {Protocol} from "playwright/types/protocol";
import {Browser} from "playwright";
import {INPUTUSERMODELFOLDER, TEMPFOLDER} from "../Constants";
import {SessionManagement} from "./SessionManagement";

const fs = require('fs');
const p = require('path');

export function writeUsermodel(usermodel: Usermodel, path: string) {
    fs.writeFileSync(TEMPFOLDER + path, JSON.stringify(usermodel, null, 2), function (err: Error) {
        if (err) {
            console.log(err);
        }
    });
}

export function readUsermodels(inputDirectory: string): Usermodel[] {

    let usermodels: Usermodel[] = [];

    try {
        // Get the files as an array
        let fullPath = function genFullPath(): string {
            return inputDirectory
        }();
        const files = fs.readdirSync(fullPath);

        // Loop files
        for (const file of files) {
            // Get the full paths
            const fromPath = p.join(fullPath, file);

            // Stat the file to see if we have a file or dir
            const stat = fs.statSync(fromPath);

            if (stat.isFile()) {
                // console.log(`Start loading from ${fromPath}`)
                // Read the usermodel and add it to the List
                usermodels.push(readUsermodel(fromPath))
            } else if (stat.isDirectory()){}
                // console.log("'%s' is a directory.", fromPath);
            else {
                // console.log("'%s' is not identified.", fromPath);
            }
        }


    } catch (e) {
        // Catch anything bad that happens
        console.error("Reading Usermodels went wrong!", e);
    }

    return usermodels
}

function readUsermodel(path: string): Usermodel {
    let usermodel = function genUsermodel(): Usermodel {
        let userstring = fs.readFileSync(path).toString()
        let userjson = JSON.parse(userstring)
        return new Usermodel(userjson)
    }()
    return usermodel
}

async function runInteractionModules(sessionManagement: SessionManagement) {
    // output.user = user
    let modules = sessionManagement.user.modules
    for (const indexModul of modules) {
        if (indexModul.executionTime.isNow()) {
            await indexModul.runModule(sessionManagement);
        }
    }
}

export async function runSimulations(user: Usermodel, browser: Browser, outputDirectory: string) {
    /*for (let user of users) {
    }*/

    let sessionManager = new SessionManagement(user, browser, outputDirectory)

    await sessionManager.setupSession()

    await runInteractionModules(sessionManager)

    await sessionManager.finishSession()

}
