const fs = require("fs-extra");
const os = require("os");
const path = require('path');
const program = require('commander');

const seal = require('./seal');
const AbstractSealScript = require('./AbstractSealScript');

////////////////////////////////////////////////////////////////////////////////
// Command line interface
////////////////////////////////////////////////////////////////////////////////

// Declare
program.version(seal.VERSION);
program
  .requiredOption('-s, --script-directory <directory>',
    'the directory containing the SealScript.js and other run-independent '
    + 'files for the user simulation script')
  .option('-i, --input-directory <directory>',
    'the directory containing files for this specific run (conflicts with '
    + '--configuration-from-stdin)')
  .option('-c, --configuration-from-stdin',
    'create and use a temporary --input-directory containing a '
    + seal.DEFAULT_SCRIPT_CONFIGURATION_FILE + ' read from standard input '
    + '(conflicts with --input-directory)')
  .requiredOption('-o, --output-directory <directory>',
    'the directory to write the run output to (can later be --input-directory '
    + 'for another run to continue this one)')
  .option('-p, --proxy <address>',
    'use this proxy server for connecting to the Internet (e.g., '
    + '"http://myproxy.com:3128" or "socks5://myproxy.com:3128")')
  .option('-a, --har', 'store a HAR archive of the run')
  .option('-v, --video [scale-factor]',
    'store a video recording of the run, and optionally set its scale factor '
    + 'based on the viewport')
  .option('-t, --tracing', 'store a playwright trace of the run');

// Parse
program.parse(process.argv);
const options = program.opts();
seal.log('seal-run', { version: seal.VERSION })

const scriptDirectory = path.resolve(options.scriptDirectory);
let inputDirectory = options.inputDirectory;
if (options.configurationFromStdin !== undefined) {
  if (inputDirectory !== undefined) {
    throw new Error("--input-directory and --configuration-from-stdin can not "
      + "be specified at the same time");
  }
  inputDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "seal-input-"));
  const configurationString = fs.readFileSync(0); // read from STDIN
  const configurationFile =
    path.join(inputDirectory, seal.DEFAULT_SCRIPT_CONFIGURATION_FILE);
  seal.log("configuration-from-stdin", {
    file: configurationFile,
    configuration: JSON.parse(configurationString)
  });
  fs.writeFileSync(configurationFile, configurationString);
}
const outputDirectory = options.outputDirectory;

const runOptions = {};
if (options.proxy !== undefined) {
  runOptions[AbstractSealScript.RUN_OPTION_PROXY] = options.proxy;
}
if (options.har !== undefined) {
  runOptions[AbstractSealScript.RUN_OPTION_HAR] = true;
}
if (options.video !== undefined) {
  if (options.video === true) {
    runOptions[AbstractSealScript.RUN_OPTION_VIDEO_SCALE_FACTOR] =
      AbstractSealScript.DEFAULT_VIDEO_SCALE_FACTOR;
  } else {
    runOptions[AbstractSealScript.RUN_OPTION_VIDEO_SCALE_FACTOR] =
      parseFloat(options.video);
  }
}
if (options.tracing !== undefined) {
  runOptions[AbstractSealScript.RUN_OPTION_TRACING] = true;
}
seal.log("run-options-complete", runOptions);


////////////////////////////////////////////////////////////////////////////////
// RUN
////////////////////////////////////////////////////////////////////////////////

const script = AbstractSealScript.instantiate(scriptDirectory, inputDirectory);
script.start(outputDirectory, runOptions);

