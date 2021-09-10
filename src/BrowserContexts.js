const fs = require("fs");
const path = require('path');
const seal = require('./seal');

/*
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
*/

const browserContextDirectoryName = "browserContext";
const browserContextOptionsFileName = "browserContextOptions.json";
const defaultBrowserContextName = "default";

exports.BrowserContexts = class {

  #scriptDirectory;
  #inputDirectory;
  #forcedBrowserContextOptions;
  #outputDirectory;
  #browserContextOptions;
  #browserContexts;

  constructor(scriptDirectory, inputDirectory, outputDirectory, forcedBrowserContextOptions = {}) {
    this.#scriptDirectory = scriptDirectory;
    this.#inputDirectory = inputDirectory;
    this.#forcedBrowserContextOptions = forcedBrowserContextOptions;
    this.#outputDirectory = outputDirectory;
    this.#browserContextOptions = {};
    this.#browserContexts = {};
    // TODO: read default and all based on script and input directory
  }

  addBrowserContextOptionsFromFile(browserContextOptionsFile, browserContextName = defaultBrowserContextName) {
    const browserContextOptionsString = fs.readFileSync(browserContextOptionsFile, "utf8");
    const browserContextOptions = JSON.parse(browserContextOptionsString);
    this.addBrowserContextOptions(browserContextName);
  }

  addBrowserContextOptions(browserContextOptions, browserContextName = defaultBrowserContextName) {
    for (const [key, value] of Object.entries(browserContextOptions)) {
      this.addBrowserContextOption(key, value, browserContextName);
    }
  }

  addBrowserContextOption(key, value, browserContextName = defaultBrowserContextName) {
    // TODO
  }

  // TODO

  #getScriptDirectory() {
    return this.#scriptDirectory;
  }

  getOptions(browserContextName = defaultBrowserContextName, ignoreForcedOptions = false) {
    return null; // TODO
  }

  get(browserContextName = defaultBrowserContextName) {
    if (browserContextName in this.#browserContexts) {
      return this.#browserContexts[browserContextName];
    }

    const browserContextOptions = this.getOptions(browserContextName);
    return null; // TODO
  }

  save() {
    // TODO: save options (ignoring forced)
    // TODO: save state
  }

};

