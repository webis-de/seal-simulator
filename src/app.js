const path = require('path');
const program = require('commander');

const seal = require('./seal');
const { BrowserContexts } = require('./BrowserContexts');

////////////////////////////////////////////////////////////////////////////////
// Command line interface
////////////////////////////////////////////////////////////////////////////////

// Declare
program.version('0.1.0');
program
  .requiredOption('-s, --script-directory <directory>', 'TODO description')
  .option('-i, --input-directory <directory>', 'TODO description', null)
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

const sealOptions = {}; // TODO


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
const browserContextOptions = script.getBrowserContextOptions();
seal.log("browser-contexts-options", browserContextOptions);


////////////////////////////////////////////////////////////////////////////////
// Create browser contexts
////////////////////////////////////////////////////////////////////////////////
const browserContexts = {}; 
for (const browserContextName in browserContextOptions) {
  const browserContext = await seal.startBrowserContext(browserContextName,
      browserContextOptions[browserContextName],
      scriptDirectory, inputDirectory, outputDirectory,
      sealOptions);
  Object.assign(browserContexts[browserContextName], browserContext);
}


////////////////////////////////////////////////////////////////////////////////
// Run SEAL script
////////////////////////////////////////////////////////////////////////////////
seal.log("script-run", {outputDirectory, outputDirectory});
const simulationComplete = script.run(browserContexts, outputDirectory);
seal.log("script-run-finished", {simulationComplete: simulationComplete});


////////////////////////////////////////////////////////////////////////////////
// Save
////////////////////////////////////////////////////////////////////////////////
seal.log("save", {outputDirectory, outputDirectory});
for (const browserContextName in browserContexts) {
  browserContexts[browserContextName].close();
}



