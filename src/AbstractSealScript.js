const fs = require("fs");
const path = require('path');
const seal = require('./seal');

const readBrowserContextOptions = function(directory) {
  const file = path.join(directory, "seal", "browserContextOptions.json");
  if (fs.existsSync(file)) {
    const browserContextOptionsString = fs.readFileSync(file, "utf8");
    const browserContextOptions = JSON.parse(browserContextOptionsString);
    seal.log("browser-context-options-added", {source: file, browserContextOptions: browserContextOptions});
    return browserContextOptions;
  } else {
    return {};
  }
}

exports.AbstractSealScript = class {
  #scriptDirectory;
  #inputDirectory;
  contextOptions;
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
    const browserContextOptions = {};
    Object.assign(browserContextOptions, readBrowserContextOptions(this.getScriptDirectory()));
    if (this.getInputDirectory() !== null) {
      Object.assign(browserContextOptions, readBrowserContextOptions(this.getInputDirectory()));
    }
    return browserContextOptions;
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

