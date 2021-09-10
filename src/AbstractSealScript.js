exports.AbstractSealScript = class {
  #scriptDirectory;
  #inputDirectory;
  contextOptions;
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

  getNewContext(contextOptions){
    this.contextOptions = contextOptions
    // TODO : Hier müssen wir noch mal reden... Ich würde am liebsten, wenn ich einen neuen Context brauch einfach einen anfordern und da die contextOptions mit schicken.
    return newContext
  }

  run(browserContext, outputDirectory) {
    throw new Error("Run method not implemented");
  }
};

