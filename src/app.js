require.cache = {};

// Command line interface
const { program } = require('commander');
program.version('0.1.0');
program
  .requiredOption('-s, --script-directory <directory>', 'TODO description')
  .requiredOption('-i, --input-directory <directory>', 'TODO description')
  .requiredOption('-o, --output-directory <directory>', 'TODO description')
  .option('-p, --proxy <address>', 'TODO description');
program.parse(process.argv);
const options = program.opts();

const resolve = require('path').resolve;

// Source SEAL script
// const SealScript = require(resolve(options.scriptDirectory + "/SealScript")).SealScript;
const SealScript = require("./SealScriptInterface").SealScriptInterface;
const script = new SealScript(options.scriptDirectory, options.inputDirectory);
script.foo();


