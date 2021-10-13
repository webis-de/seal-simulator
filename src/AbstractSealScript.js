const fs = require("fs-extra");
const path = require('path');
const playwright = require('playwright');

const seal = require('./seal');


////////////////////////////////////////////////////////////////////////////////
// CONSTANTS: DIRECTORY STRUCTURE
////////////////////////////////////////////////////////////////////////////////

/**
 * Name of the directory in the script, input, or output directories that
 * contains serialized data for each browser context.
 *
 * The directory contains one directory for each available browser context,
 * with the name of that directory being the context name.
 */
const CONTEXTS_DIRECTORY = "browserContexts";
exports.CONTEXTS_DIRECTORY = CONTEXTS_DIRECTORY;

/**
 * Name of the directory in a context directory that contains the user data
 * (cookies, local storage).
 */
const CONTEXT_USER_DATA_DIRECTORY = "userData";
exports.CONTEXT_USER_DATA_DIRECTORY = CONTEXT_USER_DATA_DIRECTORY;

/**
 * Name of the file in a context directory that contains the run's HAR archive.
 */
const CONTEXT_HAR_FILE = "archive.har";
exports.CONTEXT_HAR_FILE = CONTEXT_HAR_FILE;

/**
 * Name of the directory in a context directory that contains the run's video
 * recordings.
 */
const CONTEXT_VIDEO_DIR = "video";
exports.CONTEXT_VIDEO_DIR = CONTEXT_VIDEO_DIR;

/**
 * Name of the directory in a context directory that contains the run's
 * playwright traces.
 */
const CONTEXT_TRACE_DIR = "trace";
exports.CONTEXT_TRACE_DIR = CONTEXT_TRACE_DIR;

/**
 * Names of JSON files that contain browser context options as used in
 * Playwright.
 *
 * If the file is directly within the browser contexts directory
 * ({@link CONTEXTS_DIRECTORY}), it applies to all browser contexts. If it is
 * within a sub-directory, it applies only to the respective browser context.
 */
const BROWSER_CONTEXT_OPTIONS_FILE = "browser.json";
exports.BROWSER_CONTEXT_OPTIONS_FILE = BROWSER_CONTEXT_OPTIONS_FILE;

/**
 * Name for the main script configuration file in the input directory.
 */
const SCRIPT_CONFIGURATION_FILE = "config.json";
exports.SCRIPT_CONFIGURATION_FILE = SCRIPT_CONFIGURATION_FILE;

/**
 * Name for storing the input configuration in the output directory.
 */
const OUTPUT_SCRIPT_CONFIGURATION_FILE = "original-" + SCRIPT_CONFIGURATION_FILE;
exports.OUTPUT_SCRIPT_CONFIGURATION_FILE = OUTPUT_SCRIPT_CONFIGURATION_FILE;

////////////////////////////////////////////////////////////////////////////////
// CONSTANTS: ADDITIONAL CONTEXT OPTIONS
////////////////////////////////////////////////////////////////////////////////

/**
 * Context option that specified the type of browser to use.
 */
const CONTEXT_OPTION_BROWSER_TYPE = "browserType";
exports.CONTEXT_OPTION_BROWSER_TYPE = CONTEXT_OPTION_BROWSER_TYPE;

/**
 * Default browser to use unless specified otherwise using
 * {@link BROWSER_CONTEXT_OPTION_BROWSER_TYPE}.
 */
const DEFAULT_BROWSER_TYPE = "chromium";
exports.DEFAULT_BROWSER_TYPE = DEFAULT_BROWSER_TYPE;

////////////////////////////////////////////////////////////////////////////////
// CONSTANTS: RUN OPTIONS
////////////////////////////////////////////////////////////////////////////////

/**
 * Option to specify the proxy to use (absent for none).
 */
const RUN_OPTION_PROXY = "proxy";
exports.RUN_OPTION_PROXY = RUN_OPTION_PROXY;

/**
 * Option to specify to store a HAR archive of the run.
 */
const RUN_OPTION_HAR = "har";
exports.RUN_OPTION_HAR = RUN_OPTION_HAR;

/**
 * Option to specify to store a video recording of the run and at which scale
 * factor.
 */
const RUN_OPTION_VIDEO_SCALE_FACTOR = "video";
exports.RUN_OPTION_VIDEO_SCALE_FACTOR = RUN_OPTION_VIDEO_SCALE_FACTOR;

/**
 * Default value for the scale factor of recorded videos.
 */
const DEFAULT_VIDEO_SCALE_FACTOR = 1.0;
exports.DEFAULT_VIDEO_SCALE_FACTOR = DEFAULT_VIDEO_SCALE_FACTOR;

/**
 * Option to specify to store a playwright trace of the run.
 */
const RUN_OPTION_TRACING = "tracing";
exports.RUN_OPTION_TRACING = RUN_OPTION_TRACING;

////////////////////////////////////////////////////////////////////////////////
// CONSTANTS: BROWSER
////////////////////////////////////////////////////////////////////////////////

/**
 * Default width and height for the browser viewport.
 */
const DEFAULT_BROWSER_VIEWPORT = { width: 1280, height: 720 };
exports.DEFAULT_BROWSER_VIEWPORT = DEFAULT_BROWSER_VIEWPORT;


//////////////////////////////////////////////////////////////////////////////////
// STATIC FUNCTIONS
//////////////////////////////////////////////////////////////////////////////////

function instantiate(scriptDirectory, inputDirectory) {
  // Validate script directory
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

  // Validate input directory
  if (inputDirectory !== undefined) {
    if (!fs.existsSync(inputDirectory)) {
      throw new Error("Input directory '" + inputDirectory + "' does not exist.");
    }
    if (!fs.statSync(inputDirectory).isDirectory()) {
      throw new Error("Input directory '" + inputDirectory + "' is not a directory.");
    }
  }

  // Sourcing
  seal.log("script-source", {
    scriptFile: scriptFile
  });
  const SealScript = require(scriptModule).SealScript;

  // Actual instantiating
  const script = new SealScript(scriptDirectory, inputDirectory);
  seal.log("script-source-complete", {
    name: script.getName(),
    version: script.getVersion()
  });
  return script;
}
exports.instantiate = instantiate;

//////////////////////////////////////////////////////////////////////////////////
// CLASS
//////////////////////////////////////////////////////////////////////////////////

exports.AbstractSealScript = class {

  ////////////////////////////////////////////////////////////////////////////////
  // MEMBERS
  ////////////////////////////////////////////////////////////////////////////////

  #name;
  #version;
  #scriptDirectory;
  #inputDirectory;
  #configuration;

  ////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  ////////////////////////////////////////////////////////////////////////////////

  constructor(name, version, scriptDirectory, inputDirectory = undefined) {
    this.#name = name;
    this.#version = version;
    this.#scriptDirectory = scriptDirectory;
    this.#inputDirectory = inputDirectory;
    this.#configuration = this.readOptions(SCRIPT_CONFIGURATION_FILE);
    seal.log("script-instantiate", {
      scriptDirectory: scriptDirectory,
      inputDirectory: inputDirectory,
      configuration: this.#configuration
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  // GETTERS
  ////////////////////////////////////////////////////////////////////////////////

  getName() {
    return this.#name;
  }

  getVersion() {
    return this.#version;
  }

  getScriptDirectory() {
    return this.#scriptDirectory;
  }

  getInputDirectory() {
    return this.#inputDirectory;
  }

  getConfiguration(key = undefined) {
    if (key === undefined) {
      return this.#configuration;
    } else {
      return this.#configuration[key];
    }
  }

  setConfigurationDefault(key, defaultValue) {
    const configuration = this.getConfiguration();
    if (configuration[key] === undefined) {
      configuration[key] = defaultValue;
    }
  }

  setConfigurationRequired(key) {
    const value = this.getConfiguration(key);
    if (value === undefined) {
      throw new Error("This script requires a " + SCRIPT_CONFIGURATION_FILE
        + " (either in --input-directory or per --configuration-from-stdin) "
        + "that contains a value for '" + key + "'");
    }
  }

  getContextsDirectory(baseDirectory) {
    return path.join(baseDirectory, CONTEXTS_DIRECTORY);
  }

  getScriptContextsDirectory() {
    return this.getContextsDirectory(this.getScriptDirectory());
  }

  getInputContextsDirectory() {
    return this.getContextsDirectory(this.getInputDirectory());
  }

  getContextDirectory(contextName, baseDirectory) {
    return path.join(this.getContextsDirectory(baseDirectory), contextName);
  }

  getScriptContextDirectory(contextName) {
    return this.getContextDirectory(contextName, this.getScriptDirectory());
  }

  getInputContextDirectory(contextName) {
    return this.getContextDirectory(contextName, this.getInputDirectory());
  }

  ////////////////////////////////////////////////////////////////////////////////
  // FUNCTIONALITY: MAIN
  ////////////////////////////////////////////////////////////////////////////////

  async start(outputDirectory, runOptions = {}) {
    this.writeOptions(
      this.getConfiguration(), OUTPUT_SCRIPT_CONFIGURATION_FILE, outputDirectory);

    const browserContexts =
      await this.#instantiateBrowserContexts(outputDirectory, runOptions);

    seal.log("script-run", {outputDirectory, outputDirectory});
    const simulationComplete =
      await this.run(browserContexts, outputDirectory);
    seal.log("script-run-complete", { simulationComplete: simulationComplete });

    // Clean up
    seal.log("save", { outputDirectory: outputDirectory });
    for (const contextName in browserContexts) {
      const browserContext = browserContexts[contextName];
      browserContext.close().then(_ => {
        seal.log("browser-context-closed", {contextName: contextName});
      });
    }
  }

  getBrowserContextsOptions() {
    const browserContextsOptions = this.readContextsOptions(
      BROWSER_CONTEXT_OPTIONS_FILE);
    if (Object.keys(browserContextsOptions).length == 0) {
      // no explicit context defined: use default context
      browserContextsOptions[seal.DEFAULT_BROWSER_CONTEXT] = {};
    }
    return browserContextsOptions;
  }

  async run(browserContexts, outputDirectory) {
    throw new Error("Run method not implemented");
  }

  ////////////////////////////////////////////////////////////////////////////////
  // FUNCTIONALITY: FILE RESOLUTION
  ////////////////////////////////////////////////////////////////////////////////

  resolveFile(fileName) {
    for (const baseDirectory of
        [ this.getInputDirectory(), this.getScriptDirectory() ]) {
      if (baseDirectory !== undefined) {
        const file = path.join(baseDirectory, fileName);
        if (fs.existsSync(file)) {
          return file;
        }
      }
    }
    return undefined;
  }

  resolveContextFile(contextName, fileName) {
    const contextFileName =
      path.join(CONTEXTS_DIRECTORY, contextName, fileName);
    return this.resolveFile(contextFileName);
  }

  readOptions(fileName) {
    const file = this.resolveFile(fileName);
    if (file !== undefined) {
      const json = fs.readFileSync(file, "utf8");
      return JSON.parse(json);
    } else {
      return {};
    }
  }

  readContextOptions(contextName, fileName) {
    const file = this.resolveContextFile(contextName, fileName);
    if (file !== undefined) {
      const json = fs.readFileSync(file, "utf8");
      return JSON.parse(json);
    } else {
      return {};
    }
  }

  readContextsOptions(fileName) {
   const contextNames = this.#findContextNames(
     this.getScriptDirectory(), this.getInputDirectory());

    const contextsOptions = {};
    contextNames.forEach(contextName => {
      contextsOptions[contextName] =
        this.readContextOptions(contextName, fileName);
    });
    return contextsOptions;
  }

  writeOptions(options, fileName, outputDirectory) {
    fs.mkdirsSync(outputDirectory);
    const optionsFile = path.join(outputDirectory, fileName);
    fs.writeJsonSync(optionsFile, options);
  }

  writeContextOptions(options, contextName, fileName, outputDirectory) {
    const contextDirectory = this.getContextDirectory(contextName, outputDirectory);
    fs.mkdirsSync(contextDirectory);
    const contextOptionsFile = path.join(contextDirectory, fileName);
    fs.writeJsonSync(contextOptionsFile, options);
  }

  ////////////////////////////////////////////////////////////////////////////////
  // HELPERS
  ////////////////////////////////////////////////////////////////////////////////

  #findContextNames() {
    const contextNames = new Set();
    for (const baseDirectory of
        [ this.getInputDirectory(), this.getScriptDirectory() ]) {
      if (baseDirectory !== undefined) {
        const contextsDirectory = this.getContextsDirectory(baseDirectory);
        if (fs.existsSync(contextsDirectory)) {
          fs.readdirSync(contextsDirectory, {withFileTypes: true})
            .filter(contextDirectory => contextDirectory.isDirectory())
            .forEach(contextDirectory => {
              contextNames.add(contextDirectory.name);
            });
        }
      }
    }
    return Array.from(contextNames);
  }

  async #instantiateBrowserContexts(outputDirectory, runOptions = {}) {
    const browserContextsOptions = this.getBrowserContextsOptions();
    if (Object.keys(browserContextsOptions).length == 0) {
      browserContextOptions[seal.DEFAULT_BROWSER_CONTEXT] = {};
    }
    seal.log("browser-contexts-options-complete", browserContextsOptions);
    for (const contextName in browserContextsOptions) {
      this.writeContextOptions(
        browserContextsOptions[contextName], contextName,
        BROWSER_CONTEXT_OPTIONS_FILE, outputDirectory);
    }

    const browserContexts = {}; 
    return Promise.all(Object.keys(browserContextsOptions).map(
      browserContextName => {
        return this.#instantiateBrowserContext(browserContextName,
            browserContextsOptions[browserContextName],
            outputDirectory, runOptions)
          .then(browserContext => {
            browserContexts[browserContextName] = browserContext;
          });
    })).then(_ =>{ return browserContexts; });
  }

  async #instantiateBrowserContext(
      contextName, browserContextOptions,
      outputDirectory, runOptions = {}) {
    const contextOutputDirectory =
      this.getContextDirectory(contextName, outputDirectory);
    fs.mkdirsSync(contextOutputDirectory, { recursive: true });

    // Copy existing user data directory
    const userDataDirectory = path.join(
      contextOutputDirectory, CONTEXT_USER_DATA_DIRECTORY);
    for (const baseDirectory of
        [ this.getInputDirectory(), this.getScriptDirectory() ]) {
      if (baseDirectory !== undefined) {
        const sourceUserDataDirectory = path.join(
          this.getContextDirectory(contextName, baseDirectory),
          CONTEXT_USER_DATA_DIRECTORY);
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

    // Set context options from run options
    const completeBrowserContextOptions =
      Object.assign({}, browserContextOptions);
    if (completeBrowserContextOptions["viewport"] === undefined) {
      completeBrowserContextOptions["viewport"] = DEFAULT_BROWSER_VIEWPORT;
    }
    if (runOptions[RUN_OPTION_PROXY]) {
      completeBrowserContextOptions["proxy"] = {
        server: runOptions[RUN_OPTION_PROXY]
      };
    }
    if (runOptions[RUN_OPTION_HAR]) {
      completeBrowserContextOptions["recordHar"] = {
        path: path.join(
          this.getContextDirectory(contextName, outputDirectory),
          CONTEXT_HAR_FILE)
      };
    }
    if (runOptions[RUN_OPTION_VIDEO_SCALE_FACTOR]) {
      const scaleFactor = runOptions[RUN_OPTION_VIDEO_SCALE_FACTOR];
      const viewport = completeBrowserContextOptions["viewport"];
      completeBrowserContextOptions["recordVideo"] = { 
        dir: path.join(
          this.getContextDirectory(contextName, outputDirectory),
          CONTEXT_VIDEO_DIR),
        size: {
          width: viewport.width * scaleFactor,
          height: viewport.height * scaleFactor
        }
      };
    }
    if (runOptions[RUN_OPTION_TRACING]) {
      completeBrowserContextOptions["tracesDir"] = path.join(
        this.getContextDirectory(contextName, outputDirectory),
        CONTEXT_TRACE_DIR);
    }

    // Launch context
    const browserType =
      browserContextOptions[CONTEXT_OPTION_BROWSER_TYPE] || DEFAULT_BROWSER_TYPE;
    seal.log("browser-context-instantiate", {
      browserType: browserType,
      browserContextOptions: completeBrowserContextOptions,
      userDataDirectory: userDataDirectory
    });
    const context = await playwright[browserType]
      .launchPersistentContext(userDataDirectory, completeBrowserContextOptions);
    if (runOptions[RUN_OPTION_TRACING]) {
      context.tracing.start(
        { name: "run.trace", screenshots: true, snapshots: true });
    }
    return context;
  }

};

