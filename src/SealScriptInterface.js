exports.SealScriptInterface = class {
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
    return null; // TODO: some sensible defaults
  }

  run(browserContext, outputDirectory) {
    return false; // TODO: throw
  }
};

