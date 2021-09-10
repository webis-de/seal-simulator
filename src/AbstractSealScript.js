exports.AbstractSealScript = class {
  #scriptDirectory;
  #inputDirectory;
  constructor(scriptDirectory, inputDirectory) {
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
    return {}; // TODO: read json file from script and input directories if they exist
  }

  run(browserContext, outputDirectory) {
    throw new Error("Run method not implemented");
  }
};

