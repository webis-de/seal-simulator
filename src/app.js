const fs = require("fs-extra");
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
    'specifies the directory containing the SealScript.js and other '
    + 'run-independent files for the user simulation script')
  .option('-i, --input-directory <directory>',
    'specifies the directory containing files for this specific run')
  .requiredOption('-o, --output-directory <directory>',
    'specifies the directory to write the run output to (must not exist yet; '
    + 'can later be --input-directory for another run to continue this one)')
  .option('-p, --proxy <address>', 'specifies a proxy server for connecting to '
    + 'the Internet (e.g., "http://myproxy.com:3128" or '
    + '"socks5://myproxy.com:3128")')
  .option('-a, --har', 'specifies to store a HAR archive of the run')
  .option('-v, --video [scale-factor]', 'specifies to store a video '
    + 'recording of the run, and optionally its scale factor based on the '
    + 'viewport')
  .option('-t, --tracing', 'specifies to store a playwright trace of the '
    + 'run');

// Parse
program.parse(process.argv);
const options = program.opts();
seal.log('seal-run', { version: seal.VERSION })

const scriptDirectory = path.resolve(options.scriptDirectory);
const inputDirectory = options.inputDirectory;

const outputDirectory = options.outputDirectory;
if (fs.existsSync(outputDirectory)) {
  throw new Error("Output directory '" + outputDirectory + "' already exists.");
}

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

