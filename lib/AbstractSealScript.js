const fs = require("fs-extra");
const path = require('path');
const playwright = require('playwright');

const constants = require('./constants');
const log = require('./log');

module.exports = class {

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
    this.#configuration = this.readOptions(constants.SCRIPT_CONFIGURATION_FILE);
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
      throw new Error("This script requires a "
        + constants.SCRIPT_CONFIGURATION_FILE
        + " (either in --input-directory or per --configuration-from-stdin) "
        + "that contains a value for '" + key + "'");
    }
  }

  getContextsDirectory(baseDirectory) {
    return path.join(baseDirectory, constants.BROWSER_CONTEXTS_DIRECTORY);
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
  // FUNCTIONALITY
  ////////////////////////////////////////////////////////////////////////////////

  async start(outputDirectory, runOptions = {}) {
    log("script-start", {
        outputDirectory: outputDirectory,
        runOptions: runOptions
    });

    // Store input options for provenance
    this.writeOptions(
      this.getConfiguration(),
      constants.SCRIPT_CONFIGURATION_FILE,
      outputDirectory);

    // Instantiate browser contexts
    const browserContexts =
      await this.#instantiateBrowserContexts(outputDirectory, runOptions);

    // Run
    const simulationComplete =
      await this.run(browserContexts, outputDirectory);
    log("script-run", {
      simulationComplete: simulationComplete
    });

    // Clean up
    for (const contextName in browserContexts) {
      const browserContext = browserContexts[contextName];
      browserContext.close().then(_ => {
        log("browser-context-closed", {
          contextName: contextName
        });
      });
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  // IMPLEMENTATION
  ////////////////////////////////////////////////////////////////////////////////

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
      path.join(constants.BROWSER_CONTEXTS_DIRECTORY, contextName, fileName);
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

  getBrowserContextsOptions() {
    const browserContextsOptions = this.readContextsOptions(
      constants.BROWSER_CONTEXT_OPTIONS_FILE);
    if (Object.keys(browserContextsOptions).length == 0) {
      // no explicit context defined: use default context
      browserContextsOptions[constants.BROWSER_CONTEXT_DEFAULT] = {};
    }
    return browserContextsOptions;
  }

  #findContextNames() {
    const contextNames = new Set();
    for (const baseDirectory of
        [ this.getInputDirectory(), this.getScriptDirectory() ]) {
      if (baseDirectory !== undefined) {
        const contextsDirectory = this.getContextsDirectory(baseDirectory);
        if (fs.existsSync(contextsDirectory)) {
          fs.readdirSync(contextsDirectory, { withFileTypes: true })
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
      browserContextOptions[constants.BROWSER_CONTEXT_DEFAULT] = {};
    }
    for (const contextName in browserContextsOptions) {
      this.writeContextOptions(
        browserContextsOptions[contextName], contextName,
        constants.BROWSER_CONTEXT_OPTIONS_FILE, outputDirectory);
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
    })).then(_ => browserContexts);
  }

  async #instantiateBrowserContext(
      contextName, browserContextOptions, outputDirectory, runOptions = {}) {
    const contextOutputDirectory =
      this.getContextDirectory(contextName, outputDirectory);
    fs.mkdirsSync(contextOutputDirectory, { recursive: true });
    const userDataDirectory =
      this.#copyUserDataDirectory(contextName, outputDirectory);

    const completeBrowserContextOptions = this.#completeBrowserContextOptions(
      contextName, browserContextOptions, outputDirectory, runOptions);
    const browserType =
      browserContextOptions[constants.BROWSER_CONTEXT_OPTION_BROWSER_TYPE]
      || constants.BROWSER_CONTEXT_OPTION_BROWSER_TYPE_DEFAULT;

    log("browser-context-instantiate", {
      contextName: contextName,
      browserType: browserType,
      browserContextOptions: completeBrowserContextOptions,
      userDataDirectory: userDataDirectory
    });
    const context = await playwright[browserType]
      .launchPersistentContext(userDataDirectory, completeBrowserContextOptions);
    log("browser-context-instantiated", { contextName: contextName });

    if (runOptions[constants.RUN_OPTION_TRACING]) {
      log("browser-context-trace", { contextName: contextName });
      context.tracing.start(
        { name: "run.trace", screenshots: true, snapshots: true });
    }
    return context;
  }

  #copyUserDataDirectory(contextName, outputDirectory) {
    const contextOutputDirectory =
      this.getContextDirectory(contextName, outputDirectory);
    const userDataDirectory = path.join(
      contextOutputDirectory, constants.BROWSER_CONTEXT_USER_DATA_DIRECTORY);
    for (const baseDirectory of
        [ this.getInputDirectory(), this.getScriptDirectory() ]) {
      if (baseDirectory !== undefined) {
        const sourceUserDataDirectory = path.join(
          this.getContextDirectory(contextName, baseDirectory),
          constants.BROWSER_CONTEXT_USER_DATA_DIRECTORY);
        if (fs.existsSync(sourceUserDataDirectory)) {
          log("browser-context-copy", {
            from: sourceUserDataDirectory,
            to: userDataDirectory
          });
          fs.copySync(sourceUserDataDirectory, userDataDirectory);
          break;
        }
      }
    }
    fs.mkdirsSync(userDataDirectory);
    return userDataDirectory;
  }

  #completeBrowserContextOptions(
      contextName, browserContextOptions, outputDirectory, runOptions) {
    const completeBrowserContextOptions =
      Object.assign({}, browserContextOptions);
    if (completeBrowserContextOptions["viewport"] === undefined) {
      completeBrowserContextOptions["viewport"] =
        constants.BROWSER_VIEWPORT_DEFAULT;
    }
    if (runOptions[constants.RUN_OPTION_PROXY]) {
      completeBrowserContextOptions["proxy"] = {
        server: runOptions[constants.RUN_OPTION_PROXY]
      };
    }
    if (runOptions[constants.RUN_OPTION_HAR]) {
      completeBrowserContextOptions["recordHar"] = {
        path: path.join(
          this.getContextDirectory(contextName, outputDirectory),
          constants.BROWSER_CONTEXT_HAR_FILE)
      };
    }
    if (runOptions[constants.RUN_OPTION_VIDEO_SCALE_FACTOR]) {
      const scaleFactor = runOptions[constants.RUN_OPTION_VIDEO_SCALE_FACTOR];
      const viewport = completeBrowserContextOptions["viewport"];
      completeBrowserContextOptions["recordVideo"] = { 
        dir: path.join(
          this.getContextDirectory(contextName, outputDirectory),
          constants.BROWSER_CONTEXT_VIDEO_DIRECTORY),
        size: {
            width: viewport.width * scaleFactor,
            height: viewport.height * scaleFactor
        }
      };
    }
      if (runOptions[constants.RUN_OPTION_TRACING]) {
          completeBrowserContextOptions["tracesDir"] = path.join(
              this.getContextDirectory(contextName, outputDirectory),
              constants.BROWSER_CONTEXT_TRACE_DIRECTORY);
      }
      if (runOptions[constants.RUN_OPTION_INSECURE]) {
          completeBrowserContextOptions["ignoreHTTPSErrors"] = true;
      }
      return completeBrowserContextOptions;
  }

};

