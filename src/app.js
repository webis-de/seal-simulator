const fs = require("fs-extra");
const path = require('path');
const playwright = require('playwright');
const program = require('commander');

const seal = require('./seal');

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


// Create browser contexts
instantiateBrowserContexts(browserContextsOptions,
    scriptDirectory, inputDirectory, outputDirectory, sealOptions)
  .then(browserContexts => {
    // Run script
    seal.log("script-run", {outputDirectory, outputDirectory});
    const simulationComplete = script.run(browserContexts, outputDirectory);
    seal.log("script-run-finished", {simulationComplete: simulationComplete});

    // Clean up
    seal.log("save", {outputDirectory, outputDirectory});
    for (const contextName in browserContexts) {
      browserContexts[contextName].close().then(_ => {
        seal.writeContextOptions(
          browserContextsOptions[contextName], contextName,
          seal.BROWSER_CONTEXT_OPTIONS_FILE, outputDirectory);
        seal.log("browser-context-closed", {contextName: contextName});
      });
    }
});


////////////////////////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////////////////////////

async function instantiateBrowserContexts(
    browserContextsOptions,
    scriptDirectory, inputDirectory, outputDirectory,
    sealOptions = {}) {
  const browserContexts = {}; 
  return Promise.all(Object.keys(browserContextsOptions).map(
    browserContextName => {
      return instantiateBrowserContext(browserContextName,
          browserContextsOptions[browserContextName],
          scriptDirectory, inputDirectory, outputDirectory,
          sealOptions)
        .then(browserContext => {
          browserContexts[browserContextName] = browserContext;
        });
  })).then(_ =>{ return browserContexts; });
}

async function instantiateBrowserContext(
    contextName, browserContextOptions,
    scriptDirectory, inputDirectory, outputDirectory,
    sealOptions = {}) {
  const contextOutputDirectory =
    seal.getContextDirectory(contextName, outputDirectory);
  fs.mkdirsSync(contextOutputDirectory, { recursive: true });

  // Copy existing user data directory
  const userDataDirectory = path.join(
    contextOutputDirectory, seal.CONTEXT_DIRECTORY_USER_DATA);
  for (baseDirectory of [ inputDirectory, scriptDirectory ]) {
    if (baseDirectory !== null) {
      const sourceUserDataDirectory = path.join(
        seal.getContextDirectory(contextName, baseDirectory),
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

