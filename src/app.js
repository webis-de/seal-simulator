const fs = require("fs-extra");
const path = require('path');
const playwright = require('playwright');
const program = require('commander');

const seal = require('./seal');


////////////////////////////////////////////////////////////////////////////////
// CONSTANTS
////////////////////////////////////////////////////////////////////////////////

/**
 * Context option that specified the type of browser to use.
 */
const CONTEXT_OPTION_BROWSER_TYPE = "browserType";

/**
 * Default browser to use unless specified otherwise using
 * {@link BROWSER_CONTEXT_OPTION_BROWSER_TYPE}.
 */
const DEFAULT_BROWSER_TYPE = "chromium";

/**
 * Option to specify the proxy to use (absent for none).
 */
const RUN_OPTION_PROXY = "proxy";


////////////////////////////////////////////////////////////////////////////////
// Command line interface
////////////////////////////////////////////////////////////////////////////////

// Declare
program.version('0.1.0');
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
    + 'the Internet');

// Parse
program.parse(process.argv);
const options = program.opts();

// Validate
const scriptDirectory = path.resolve(options.scriptDirectory);
if (!fs.existsSync(scriptDirectory)) {
  throw new Error("Script directory '" + scriptDirectory + "' does not exist.");
}
if (!fs.statSync(scriptDirectory).isDirectory()) {
  throw new Error("Script directory '" + scriptDirectory + "' is not a directory.");
}
const scriptModule = path.join(scriptDirectory, "SealScript");
const scriptFile = scriptModule + ".js";
if (!fs.existsSync(scriptFile)) {
  throw new Error("Script file '" + scriptFile + "' does not exist.");
}

const inputDirectory = options.inputDirectory;
if (inputDirectory !== undefined) {
  if (!fs.existsSync(inputDirectory)) {
    throw new Error("Input directory '" + inputDirectory + "' does not exist.");
  }
  if (!fs.statSync(inputDirectory).isDirectory()) {
    throw new Error("Input directory '" + inputDirectory + "' is not a directory.");
  }
}

const outputDirectory = options.outputDirectory;
if (fs.existsSync(outputDirectory)) {
  throw new Error("Output directory '" + outputDirectory + "' already exists.");
}

const runOptions = {};
if (options.proxy !== undefined) {
  runOptions[RUN_OPTION_PROXY] = options.proxy;
}
// TODO
// video, tracing, HAR


////////////////////////////////////////////////////////////////////////////////
// RUN
////////////////////////////////////////////////////////////////////////////////

// Instantiate SEAL script
seal.log("script-source", {
  scriptFile: scriptFile
});
const SealScript = require(scriptModule).SealScript;

seal.log("script-instantiate", {
  scriptDirectory: scriptDirectory,
  inputDirectory: inputDirectory
});
const script = new SealScript(scriptDirectory, inputDirectory);


// Create browser context options
const browserContextsOptions = script.getBrowserContextsOptions();
if (Object.keys(browserContextsOptions).length == 0) {
  browserContextOptions[seal.DEFAULT_BROWSER_CONTEXT] = {};
}
seal.log("browser-contexts-options", browserContextsOptions);
for (const contextName in browserContextsOptions) {
  script.writeContextOptions(
    browserContextsOptions[contextName], contextName,
    seal.BROWSER_CONTEXT_OPTIONS_FILE, outputDirectory);
}


// Create browser contexts
instantiateBrowserContexts(browserContextsOptions,
    scriptDirectory, inputDirectory, outputDirectory, runOptions)
  .then(browserContexts => {
    // Run script
    seal.log("script-run", {outputDirectory, outputDirectory});
    script.run(browserContexts, outputDirectory)
      .then(simulationComplete => {
        seal.log("script-run-finished", {simulationComplete: simulationComplete});

        // Clean up
        seal.log("save", {outputDirectory, outputDirectory});
        for (const contextName in browserContexts) {
          browserContexts[contextName].close().then(_ => {
            seal.log("browser-context-closed", {contextName: contextName});
          });
        }
      });
  });


////////////////////////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////////////////////////

async function instantiateBrowserContexts(
    browserContextsOptions,
    scriptDirectory, inputDirectory, outputDirectory,
    runOptions = {}) {
  const browserContexts = {}; 
  return Promise.all(Object.keys(browserContextsOptions).map(
    browserContextName => {
      return instantiateBrowserContext(browserContextName,
          browserContextsOptions[browserContextName],
          scriptDirectory, inputDirectory, outputDirectory,
          runOptions)
        .then(browserContext => {
          browserContexts[browserContextName] = browserContext;
        });
  })).then(_ =>{ return browserContexts; });
}

async function instantiateBrowserContext(
    contextName, browserContextOptions,
    scriptDirectory, inputDirectory, outputDirectory,
    runOptions = {}) {
  const contextOutputDirectory =
    script.getContextDirectory(contextName, outputDirectory);
  fs.mkdirsSync(contextOutputDirectory, { recursive: true });

  // Copy existing user data directory
  const userDataDirectory = path.join(
    contextOutputDirectory, seal.CONTEXT_DIRECTORY_USER_DATA);
  for (baseDirectory of [ inputDirectory, scriptDirectory ]) {
    if (baseDirectory !== undefined) {
      const sourceUserDataDirectory = path.join(
        script.getContextDirectory(contextName, baseDirectory),
        seal.CONTEXT_DIRECTORY_USER_DATA);
      if (fs.existsSync(sourceUserDataDirectory)) {
        seal.log("user-data-copy", {
          from: sourceUserDataDirectory,
          to: userDataDirectory
        });
        fs.copySync(sourceUserDataDirectory, userDataDirectory);
        break;
      }
    }
  }
  fs.mkdirsSync(userDataDirectory);

  // Set context options depending on SEAL options
  const completeBrowserContextOptions =
    Object.assign({}, browserContextOptions);
  // TODO

  // Launch context
  const browserType =
    browserContextOptions[CONTEXT_OPTION_BROWSER_TYPE] || DEFAULT_BROWSER_TYPE;
  seal.log("browser-context-instantiate", {
    browserType: browserType,
    browserContextOptions: completeBrowserContextOptions,
    userDataDirectory: userDataDirectory
  });
  const context = playwright[browserType]
    .launchPersistentContext(userDataDirectory, completeBrowserContextOptions);
  return context;
}

