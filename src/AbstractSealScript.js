const fs = require("fs-extra");
const path = require('path');

const seal = require('./seal');


//////////////////////////////////////////////////////////////////////////////////
// CLASS
//////////////////////////////////////////////////////////////////////////////////

exports.AbstractSealScript = class {

  ////////////////////////////////////////////////////////////////////////////////
  // MEMBERS
  ////////////////////////////////////////////////////////////////////////////////

  #scriptDirectory;
  #inputDirectory;

  ////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  ////////////////////////////////////////////////////////////////////////////////

  constructor(scriptDirectory, inputDirectory = undefined) {
    this.#scriptDirectory = scriptDirectory;
    this.#inputDirectory = inputDirectory;
  }

  ////////////////////////////////////////////////////////////////////////////////
  // GETTERS
  ////////////////////////////////////////////////////////////////////////////////

  getScriptDirectory() {
    return this.#scriptDirectory;
  }

  getInputDirectory() {
    return this.#inputDirectory;
  }

  getContextsDirectory(baseDirectory) {
    return path.join(baseDirectory, seal.CONTEXTS_DIRECTORY);
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

  getBrowserContextsOptions() {
    const browserContextsOptions = this.readContextsOptions(
      seal.BROWSER_CONTEXT_OPTIONS_FILE);
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
      path.join(seal.CONTEXTS_DIRECTORY, contextName, fileName);
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

};

