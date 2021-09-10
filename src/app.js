const Seal = require('./seal');

////////////////////////////////////////////////////////////////////////////////
// Command line interface
////////////////////////////////////////////////////////////////////////////////

// Declare
const { program } = require('commander');
program.version('0.1.0');
program
  .requiredOption('-s, --script-directory <directory>', 'TODO description')
  .requiredOption('-i, --input-directory <directory>', 'TODO description')
  .requiredOption('-o, --output-directory <directory>', 'TODO description')
  .option('-p, --proxy <address>', 'TODO description');

// Parse
program.parse(process.argv);
const options = program.opts();

// Validate
const resolve = require('path').resolve;
const scriptDirectory = resolve(options.scriptDirectory);
const scriptFile = scriptDirectory + "/SealScript";
const inputDirectory = options.inputDirectory;
const outputDirectory = options.outputDirectory;


////////////////////////////////////////////////////////////////////////////////
// Source SEAL script
////////////////////////////////////////////////////////////////////////////////
Seal.log("script-source", {scriptFile: scriptFile + ".js"});
const SealScript = require(scriptFile).SealScript;


////////////////////////////////////////////////////////////////////////////////
// Instantiate SEAL script
////////////////////////////////////////////////////////////////////////////////
Seal.log("script-instantiate", {scriptDirectory: scriptDirectory, inputDirectory: inputDirectory});
const script = new SealScript(scriptDirectory, inputDirectory);


////////////////////////////////////////////////////////////////////////////////
// Create browser context options
////////////////////////////////////////////////////////////////////////////////
Seal.log("browser-context-options-get");
const browserContextOptions = script.getBrowserContextOptions();
// TODO: add own stuff


////////////////////////////////////////////////////////////////////////////////
// Instantiate browser context
////////////////////////////////////////////////////////////////////////////////
Seal.log("browser-context-instantiate", {browserContextOptions: browserContextOptions});
const browserContext = null; // TODO with state (from inputDirectory), proxy, tracing, ...


////////////////////////////////////////////////////////////////////////////////
// Run SEAL script
////////////////////////////////////////////////////////////////////////////////
Seal.log("script-run", {outputDirectory, outputDirectory});
const simulationComplete = script.run(browserContext, outputDirectory);
Seal.log("script-run-finished", {simulationComplete: simulationComplete});


////////////////////////////////////////////////////////////////////////////////
// Save
////////////////////////////////////////////////////////////////////////////////
Seal.log("save", {outputDirectory, outputDirectory});
// TODO: on browser context


