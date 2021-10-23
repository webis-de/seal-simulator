"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSimulations = exports.readUsermodelFormInputDirectory = exports.writeUsermodel = void 0;
const Usermodel_1 = require("../datamodels/Usermodel");
const Constants_1 = require("../Constants");
const SessionManagement_1 = require("./SessionManagement");
const fs = __importStar(require("fs"));
const p = __importStar(require("path"));
function writeUsermodel(usermodel, path) {
    // @ts-ignore
    fs.writeFileSync(Constants_1.TEMPFOLDER + path, JSON.stringify(usermodel, null, 2), function (err) {
        if (err) {
            console.log(err);
        }
    });
}
exports.writeUsermodel = writeUsermodel;
function readUsermodelFormInputDirectory(inputDirectory) {
    /**
     * If the old output directory now ist the input directory, we take the:
     *     -> inputDirectory/scriptOutput/name.json
     * otherwise (First Start of the Simulation) we take:
     *     -> inputDirectory/name.json
     */
    const oldScriptPath = `${inputDirectory}/scriptOutput`;
    if (fs.existsSync(oldScriptPath)) {
        let files = fs.readdirSync(oldScriptPath);
        files = files.filter(file => {
            let stat = fs.statSync(p.join(oldScriptPath, file));
            return stat.isFile();
        });
        const usermodelPath = p.join(oldScriptPath, files[0]);
        console.log(`Usermodel found at ${usermodelPath}`);
        return readUsermodel(usermodelPath);
    }
    else {
        const files = fs.readdirSync(inputDirectory);
        const usermodelPath = p.join(inputDirectory, files[0]);
        console.log(`Usermodel found at ${usermodelPath}`);
        return readUsermodel(usermodelPath);
    }
}
exports.readUsermodelFormInputDirectory = readUsermodelFormInputDirectory;
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
    let modules = sessionManagement.user.modules;
    for (const indexModul of modules) {
        if (indexModul.executionTime.isNow()) {
            await indexModul.runModule(sessionManagement);
        }
    }
}

async function runSimulations(user, browserContext, outputDirectory) {
    /*for (let user of users) {
    }*/
    let sessionManager = new SessionManagement_1.SessionManagement(user, browserContext, outputDirectory);
    await sessionManager.setupSession();
    await runInteractionModules(sessionManager);
    await sessionManager.finishSession();
}
exports.runSimulations = runSimulations;
