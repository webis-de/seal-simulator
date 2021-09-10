const path = require('path');
const program = require('commander');
const seal = require('./seal');

////////////////////////////////////////////////////////////////////////////////
// Command line interface
////////////////////////////////////////////////////////////////////////////////

// Declare
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
const scriptDirectory = path.resolve(options.scriptDirectory);
const scriptModule = path.join(scriptDirectory, "SealScript");
const scriptFile = scriptModule + ".js";
const inputDirectory = options.inputDirectory;
const outputDirectory = options.outputDirectory;


////////////////////////////////////////////////////////////////////////////////
// Source SEAL script
////////////////////////////////////////////////////////////////////////////////
seal.log("script-source", {scriptFile: scriptFile});
const SealScript = require(scriptModule).SealScript;


////////////////////////////////////////////////////////////////////////////////
// Instantiate SEAL script
////////////////////////////////////////////////////////////////////////////////
seal.log("script-instantiate", {scriptDirectory: scriptDirectory, inputDirectory: inputDirectory});
const script = new SealScript(scriptDirectory, inputDirectory);


////////////////////////////////////////////////////////////////////////////////
// Create browser context options
////////////////////////////////////////////////////////////////////////////////
seal.log("browser-context-options-get");
const browserContextOptions = script.getBrowserContextOptions();
// TODO: add own stuff


////////////////////////////////////////////////////////////////////////////////
// Instantiate browser context
////////////////////////////////////////////////////////////////////////////////
seal.log("browser-context-instantiate", {browserContextOptions: browserContextOptions});
const browserContext = null; // TODO with state (from inputDirectory), proxy, tracing, ...


////////////////////////////////////////////////////////////////////////////////
// Run SEAL script
////////////////////////////////////////////////////////////////////////////////
seal.log("script-run", {outputDirectory, outputDirectory});
const simulationComplete = script.run(browserContext, outputDirectory);
seal.log("script-run-finished", {simulationComplete: simulationComplete});


////////////////////////////////////////////////////////////////////////////////
// Save
////////////////////////////////////////////////////////////////////////////////
seal.log("save", {outputDirectory, outputDirectory});
// TODO: on browser context


