#!/usr/bin/env node

const fs = require("fs-extra");
const fsPromises = require("fs/promises");
const os = require("os");
const path = require('path');
const program = require('commander');
const child_process = require('child_process');

const seal = require('../lib/index.js');

const COLLECTION_NAME = "seal";

////////////////////////////////////////////////////////////////////////////////
// Command line interface
////////////////////////////////////////////////////////////////////////////////

// Declare
program
    .version(seal.constants.VERSION)
    .usage('[options] '
        + '--archive-directory <directory>')
    .description('Starts a web archiving proxy server which archives to '
        + '--archive-directory')
    .requiredOption('-a, --archive-directory <directory>',
        'the directory to store the web archive files in')
    .option('-p, --port <integer>', 'the port to start the proxy at', '8080')
    .option('-t, --tmp-directory <directory>',
        'the directory to store temporary files in');

// Parse
program.parse(process.argv);
const options = program.opts();
seal.log('start', options);

const archiveDirectory = path.resolve(options.archiveDirectory);
const tmpDirectory = getTmpDirectory(options);
const port = options.port;

// Run
pywbInit(tmpDirectory, archiveDirectory)
    .then(() => pywbStart(tmpDirectory, port))
    .then(() => seal.log("proxy-started"));

// Done


////////////////////////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////////////////////////

function getTmpDirectory(options) {
    if (options.tmpDirectory !== undefined) {
        return options.tmpDirectory;
    } else {
        const tmpDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "seal-pywb-"));
        seal.log("temporary-pywb-directory", {
            tmpDirectory: tmpDirectory,
        });
        return tmpDirectory;
    }
}

function openWriteStream(file, mode = "w") {
    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(file, {flags: mode});
        stream.on("open", () => {
            resolve(stream);
        });
        if (!stream.pending) {
            resolve(stream);
        }
    });
}

async function pywbInit(tmpDirectory, archiveDirectory) {
    fs.ensureDirSync(tmpDirectory);
    fs.ensureDirSync(archiveDirectory);

    const commandLog =
        await openWriteStream(path.join(archiveDirectory, "pywbInit.log"), "a");
    const commandErr =
        await openWriteStream(path.join(archiveDirectory, "pywbInit.err"), "a");

    const command = "wb-manager";
    const args = ["init", COLLECTION_NAME];
    const options = {
        cwd: tmpDirectory,
        timeout: 10 * 1000,
        stdio: ['pipe', commandLog, commandErr]
    };

    seal.log("wayback-init", {command: command, args: args});
    const wbManager = child_process.spawnSync(command, args, options);
    if (wbManager.status !== 0) {
        throw new Error("Failed to initialize wayback collection");
    }

    const collectionDirectory =
        path.join(tmpDirectory, "collections", COLLECTION_NAME);
    const collectionArchiveDirectory =
        path.join(collectionDirectory, "archive");
    fs.rmdirSync(collectionArchiveDirectory);
    seal.log("wayback-link", {
        from: collectionArchiveDirectory,
        to: archiveDirectory
    });
    fs.symlinkSync(archiveDirectory, collectionArchiveDirectory);

    const config = "proxy:\n"
        + "  enable_content_rewrite: false\n";
    fs.writeFileSync(path.join(tmpDirectory, "config.yaml"), config);
}

async function pywbStart(tmpDirectory, port) {
    const commandLog =
        await openWriteStream(path.join(archiveDirectory, "pywbStart.log"), "a");
    const commandErr =
        await openWriteStream(path.join(archiveDirectory, "pywbStart.err"), "a");

    const command = "wayback";
    const args = [
        "--bind", "127.0.0.1",
        "--proxy", COLLECTION_NAME,
        "--proxy-record",
        "--port", port,
        "--enable-auto-fetch"
    ];
    const options = {
        cwd: tmpDirectory,
        stdio: ['pipe', commandLog, commandErr]
    };

    seal.log("wayback-start", {command: command, args: args});
    const wayback = child_process.spawn(command, args, options);
    wayback.on('exit', (code, signal) => {
        if (code !== 0) {
            if (signal === null) {
                seal.log("proxy-failed", {code: code});
                throw new Error("Failed proxy");
            } else {
                seal.log("proxy-terminated", {signal: signal});
            }
        }
    });

    process.on('SIGTERM', (signal) => {
        seal.log("proxy-terminate", {signal: signal});
        wayback.kill();
    });
    return wayback;
}

