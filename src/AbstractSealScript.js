const fs = require("fs-extra");
const path = require('path');

const seal = require('./seal');

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

  ////////////////////////////////////////////////////////////////////////////////
  // FUNCTIONALITY
  ////////////////////////////////////////////////////////////////////////////////

  getBrowserContextsOptions() {
    const browserContextsOptions = seal.readContextOptionsAll(
      seal.BROWSER_CONTEXT_OPTIONS_FILE,
      this.getScriptDirectory(), this.getInputDirectory());
    if (Object.keys(browserContextsOptions).length == 0) {
      // no explicit context defined: use default context
      browserContextsOptions[seal.DEFAULT_BROWSER_CONTEXT] =
        seal.readContextOptions(seal.DEFAULT_BROWSER_CONTEXT,
          seal.BROWSER_CONTEXT_OPTIONS_FILE,
          this.getScriptDirectory(), this.getInputDirectory());
    }
    return browserContextsOptions;
  }

  async run(browserContexts, outputDirectory) {
    throw new Error("Run method not implemented");
  }

  ////////////////////////////////////////////////////////////////////////////////
  // HELPERS
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

  readOptions(fileName) {
    const file = this.resolveFile(fileName);
    if (file !== undefined) {
      const json = fs.readFileSync(file, "utf8");
      return JSON.parse(json);
    } else {
      return {};
    }
  }

  writeOptions(options, fileName, outputDirectory) {
    fs.mkdirsSync(outputDirectory);
    const optionsFile = path.join(outputDirectory, fileName);
    fs.writeJsonSync(optionsFile, options);
  }

};

