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

  run(browserContexts, outputDirectory) {
    throw new Error("Run method not implemented");
  }
};

