const seal = require('./seal');

exports.AbstractSealScript = class {

  #scriptDirectory;
  #inputDirectory;

  constructor(scriptDirectory, inputDirectory = null) {
    this.#scriptDirectory = scriptDirectory;
    this.#inputDirectory = inputDirectory;
  }

  getScriptDirectory() {
    return this.#scriptDirectory;
  }

  getInputDirectory() {
    return this.#inputDirectory;
  }

  getBrowserContextOptions() {
    const browserContextOptions = seal.readBrowserContextOptionsAll(
      this.getScriptDirectory(), this.getInputDirectory());
    if (Object.keys(browserContextOptions).length == 0) {
      // no explicit context defined: use default context
      browserContextOptions[seal.DEFAULT_BROWSER_CONTEXT_NAME] =
        seal.readBrowserContextOptions(seal.DEFAULT_BROWSER_CONTEXT_NAME,
          this.getScriptDirectory(), this.getInputDirectory());
    }
    return browserContextOptions;
  }

  run(browserContexts, outputDirectory) {
    throw new Error("Run method not implemented");
  }
};

