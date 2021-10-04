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

  constructor(scriptDirectory, inputDirectory = null) {
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

  run(browserContexts, outputDirectory) {
    throw new Error("Run method not implemented");
  }

};

