import {Usermodel} from "../datamodels/Usermodel";
import {InteractionModule, traceModule} from "../interactionModules/InteractionModule";
import {OutputConfiguration} from "./OutputConfiguration";
import {Protocol} from "playwright/types/protocol";
import {Browser} from "playwright";
import {INPUTUSERMODELFOLDER, TEMPFOLDER} from "../Constants";
import {SessionManagement} from "./SessionManagement";
import * as fs from 'fs';
import * as p from 'path';

export function writeUsermodel(usermodel: Usermodel, path: string) {
    // @ts-ignore
    fs.writeFileSync(TEMPFOLDER + path, JSON.stringify(usermodel, null, 2), function (err: Error) {
        if (err) {
            console.log(err);
        }
    });
}

export function readUsermodelFormInputDirectory(inputDirectory: string): Usermodel {
    /**
     * If the old output directory now ist the input directory, we take the:
     *     -> inputDirectory/scriptOutput/name.json
     * otherwise (First Start of the Simulation) we take:
     *     -> inputDirectory/name.json
     */
    const oldScriptPath = `${inputDirectory}/scriptOutput`
    if (fs.existsSync(oldScriptPath)) {
        let files = fs.readdirSync(oldScriptPath);
        files = files.filter( file => {
            let stat = fs.statSync(p.join(oldScriptPath,file))
            return stat.isFile();
        })
        const usermodelPath = p.join(oldScriptPath, files[0])
        console.log(`Usermodel found at ${usermodelPath}`)
        return readUsermodel(usermodelPath)
    } else {
        const files = fs.readdirSync(inputDirectory);
        const usermodelPath = p.join(inputDirectory, files[0])
        console.log(`Usermodel found at ${usermodelPath}`)
        return readUsermodel(usermodelPath)
    }

}

/*
        // Loop files
        for (const file of files) {
            // Get the full paths
            const fromPath = p.join(fullPath, file);

            // Stat the file to see if we have a file or dir
            const stat = fs.statSync(fromPath);

            if (stat.isFile()) {
                // console.log(`Start loading from ${fromPath}`)
                // Read the usermodel and add it to the List
            } else if (stat.isDirectory()){
                /!**
                 * pathToUsermodel model refers to out/scriptOutput/name.json
                 *!/
                const pathToUsermodel = p.join(fromPath,file) + ".json"
                usermodels.push(readUsermodel(pathToUsermodel))
            }
            // console.log("'%s' is a directory.", fromPath);
            else {
                // console.log("'%s' is not identified.", fromPath);
            }
        }


    }

    return usermodels*/


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
