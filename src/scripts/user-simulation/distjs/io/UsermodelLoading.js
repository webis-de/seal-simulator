"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSimulations = exports.readUsermodels = exports.writeUsermodel = void 0;
const Usermodel_1 = require("../datamodels/Usermodel");
const Constants_1 = require("../Constants");
const SessionManagement_1 = require("./SessionManagement");
const fs = require('fs');
const p = require('path');
function writeUsermodel(usermodel, path) {
    fs.writeFileSync(Constants_1.TEMPFOLDER + path, JSON.stringify(usermodel, null, 2), function (err) {
        if (err) {
            console.log(err);
        }
    });
}
exports.writeUsermodel = writeUsermodel;
function readUsermodels(inputDirectory) {
    let usermodels = [];
    try {
        // Get the files as an array
        let fullPath = function genFullPath() {
            return inputDirectory;
        }();
        const files = fs.readdirSync(fullPath);
        // Loop files
        for (const file of files) {
            // Get the full paths
            const fromPath = p.join(fullPath, file);
            // Stat the file to see if we have a file or dir
            const stat = fs.statSync(fromPath);
            if (stat.isFile()) {
                console.log(`Start loading from ${fromPath}`);
                // Read the usermodel and add it to the List
                usermodels.push(readUsermodel(fromPath));
            }
            else if (stat.isDirectory())
                console.log("'%s' is a directory.", fromPath);
            else {
                console.log("'%s' is not identified.", fromPath);
            }
        }
    }
    catch (e) {
        // Catch anything bad that happens
        console.error("Reading Usermodels went wrong!", e);
    }
    return usermodels;
}
exports.readUsermodels = readUsermodels;
function readUsermodel(path) {
    let usermodel = function genUsermodel() {
        let userstring = fs.readFileSync(path).toString();
        let userjson = JSON.parse(userstring);
        return new Usermodel_1.Usermodel(userjson);
    }();
    return usermodel;
}
async function runInteractionModules(sessionManagement) {
    // output.user = user
    let modules = await sessionManagement.user.modules;
    for (const indexModul of modules) {
        if (indexModul.executionTime.isNow()) {
            await indexModul.runModule(sessionManagement);
        }
    }
}
async function runSimulations(users, browser, outputDirectory) {
    /*for (let user of users) {
    }*/
    let user = users[0];
    let sessionManager = new SessionManagement_1.SessionManagement(user, browser, outputDirectory);
    await sessionManager.setupSession();
    // TODO await runInteractionModules(sessionManager)
    await sessionManager.finishSession();
}
exports.runSimulations = runSimulations;
