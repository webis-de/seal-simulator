const fs = require("fs");
const path = require('path');
const playwright = require('playwright');
const seal = require('./seal');

// TODO: move constants to seal

/**
 * Name of the directory in the script, input, or output directories that
 * contains serialized data for each browser context.
 */
const BROWSER_CONTEXTS_DIRECTORY_NAME = "browserContext";

/**
 * Names of JSON files that contain browser context options as used in
 * Playwright.
 *
 * If the file is directly within the browser contexts directory
 * ({@link BROWSER_CONTEXTS_DIRECTORY_NAME}), it applies to all browser contexts. If
 * it is within a sub-directory, it applies only to the respective browser
 * context.
 */
const BROWSER_CONTEXT_OPTIONS_FILE_NAME = "browserContextOptions.json";

/**
 * Name of the default browser context.
 */
const DEFAULT_BROWSER_CONTEXT_NAME = "default";

/**
 * Factory for SEAL scripts to create Playwright BrowserContexts.
 */
class BrowserContexts {

  //////////////////////////////////////////////////////////////////////////////
  // MEMBERS
  //////////////////////////////////////////////////////////////////////////////

  #scriptDirectory;
  #inputDirectory;
  #outputDirectory;
  #forcedBrowserContextOptions;
  #commonScriptBrowserContextOptions;
  #commonInputBrowserContextOptions;
  #browserContextOptionsByName;
  #browserContextsByName;
  #browsersByName;

  //////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTION
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Creates a new BrowserContext factory for a SEAL script.
   * @param {string} scriptDirectory  The directory of the employed SEAL script.
   * @param {string} inputDirectory   The directory with the input files for the
   * SEAL script.
   * @param {string} outputDirectory  The directory to which the output of the
   * SEAL script is written.
   * @param {Object} [forcedBrowserContextOptions={}]  Options are are enforced
   * on all browser contexts. In a string value, the expression
   * '%browserContextName%' is replaced with the name of respective browser
   * context.
   */
  constructor(
      scriptDirectory, inputDirectory, outputDirectory,
      forcedBrowserContextOptions = {}) {
    this.#scriptDirectory = scriptDirectory;
    this.#inputDirectory = inputDirectory;
    this.#outputDirectory = outputDirectory;
    this.#forcedBrowserContextOptions = forcedBrowserContextOptions;
    this.#commonScriptBrowserContextOptions =
      this.#readBrowserContextOptionsFromFileIfExists(
        path.join(scriptDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME,
          BROWSER_CONTEXT_OPTIONS_FILE_NAME));
    if (inputDirectory == null) {
      this.#commonScriptBrowserContextOptions = {};
    } else {
      this.#commonInputBrowserContextOptions =
        this.#readBrowserContextOptionsFromFileIfExists(
          path.join(inputDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME,
            BROWSER_CONTEXT_OPTIONS_FILE_NAME));
    }
    this.#browserContextOptionsByName = {};
    this.#browserContextsByName = {};
    this.#browsersByName = {};
 
    // Initialize all browser context options for which directories exist
    const getDefinedBrowserContextNames = function(mainDirectory) {
      if (mainDirectory == null) { return []; }

      const browserContextsDirectory =
        path.join(mainDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME);
      if (!fs.existsSync(browserContextsDirectory)) { return []; }

      return fs.readdirSync(BROWSER_CONTEXTS_DIRECTORY_NAME, {withFileTypes: true})
        .filter(child => child.isDirectory())
        .map(directory => directory.name);
    };
    const scriptDefinedBrowserContextNames =
      getDefinedBrowserContextNames(scriptDirectory);
    const inputDefinedBrowserContextNames =
      getDefinedBrowserContextNames(inputDirectory);
    const definedBrowserContextNames = new Set(
      scriptDefinedBrowserContextNames.concat(inputDefinedBrowserContextNames));
    definedBrowserContextNames.forEach(this.#initializeBrowserContextOptions);
  }

  //////////////////////////////////////////////////////////////////////////////
  // GETTERS
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Gets the directory of the employed SEAL script.
   * @return {string} The directory
   */
  #getScriptDirectory() {
    return this.#scriptDirectory;
  }

  /**
   * Gets the directory with the input files for the SEAL script.
   * @return {string} The directory
   */
  #getInputDirectory() {
    return this.#inputDirectory;
  }

  /**
   * Gets the directory to which the output of the SEAL script is written.
   * @return {string} The directory
   */
  #getOutputDirectory() {
    return this.#outputDirectory;
  }

  #getForcedBrowserContextOptions() {
    return this.#forcedBrowserContextOptions;
  }

  #getCommonScriptBrowserContextOptions() {
    return this.#commonScriptBrowserContextOptions;
  }

  #getCommonInputBrowserContextOptions() {
    return this.#commonInputBrowserContextOptions;
  }

  #getBrowserContextOptionsByName() {
    return this.#browserContextOptionsByName;
  }

  #getBrowserContextOptions(browserContextName = DEFAULT_BROWSER_CONTEXT_NAME) {
    const browserContextOptions = this.#getBrowserContextOptions();
    if (!(browserContextName in browserContextOptions)) {
      this.#initializeBrowserContextOptions(browserContextName);
    }
    return browserContextOptions[browserContextName];
  }

  #getBrowserContextsByName() {
    return this.#browserContextsByName;
  }

  getBrowserContextNames() {
    return Object.keys(this.#getBrowserContextOptions());
  }

  #getBrowsersByName() {
    return this.#browsersByName;
  }

  async #getBrowser(browserName) {
    const browsersByName = this.#getBrowsersByName();
    if (!(browserName in browsersByName)) {
      browsersByName[browserName] = await playwright[browserName].launch();
    }
    return browsersByName[browserName];
  }

  //////////////////////////////////////////////////////////////////////////////
  // SETTERS
  //////////////////////////////////////////////////////////////////////////////

  addBrowserContextOptionsFromFile(
      browserContextOptionsFile,
      browserContextName = DEFAULT_BROWSER_CONTEXT_NAME) {
    const browserContextOptions =
      this.#readBrowserContextOptionsFromFile(browserContextOptionsFile);
    this.addBrowserContextOptions(browserContextOptions, browserContextName);
  }

  addBrowserContextOptions(
      browserContextOptions, browserContextName = DEFAULT_BROWSER_CONTEXT_NAME) {
    for (const [key, value] of Object.entries(browserContextOptions)) {
      this.addBrowserContextOption(key, value, browserContextName);
    }
  }

  addBrowserContextOption(
      key, value, browserContextName = DEFAULT_BROWSER_CONTEXT_NAME) {
    const browserContextOptions =
      this.#getBrowserContextOptions(browserContextName);
    browserContextOptions[key] = value;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FUNCTIONALITY
  //////////////////////////////////////////////////////////////////////////////

  async get(browserContextName = DEFAULT_BROWSER_CONTEXT_NAME) {
    const browserContextsByName = this.#getBrowserContextsByName();
    if (browserContextName in browserContextsByName) {
      return browserContextsByName[browserContextName];
    }

    const browser = await this.#getBrowser("chromium");

    const browserContextOptions =
      this.#getBrowserContextOptions(browserContextName);
    this.#enforceBrowserContextOptions(
      browserContextOptions, this.#getForcedBrowserContextOptions(),
      browserContextName);

    const browserContext = await browser.newContext(browserContextOptions);
    browserContextsByName[browserContextName] = browserContext;
    return browserContext;
  }

  save() {
    // TODO: save options
    // TODO: copy common input options to output
    // TODO: save state
  }

  //////////////////////////////////////////////////////////////////////////////
  // HELPERS
  //////////////////////////////////////////////////////////////////////////////

  #initializeBrowserContextOptions(browserContextName) {
    const browserContextOptions = Object.assign({},
      this.#getCommonScriptBrowserContextOptions(),
      this.#readBrowserContextOptionsFromFileIfExists(
        path.join(this.#getScriptDirectory(), BROWSER_CONTEXTS_DIRECTORY_NAME,
          browserContextName, BROWSER_CONTEXT_OPTIONS_FILE_NAME)),
      this.#getCommonInputBrowserContextOptions(),
      this.#readBrowserContextOptionsFromFileIfExists(
        path.join(this.#getInputDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME,
          browserContextName, BROWSER_CONTEXT_OPTIONS_FILE_NAME)));

    const browserContextOptionsByName = this.#getBrowserContextOptionsByName();
    if (browserContextName in browserContextOptionsByName) {
      throw new Error("Browser context options were already initialized for: "
        + browserContextName);
    }
    browserContextOptionsByName[browserContextName] = browserContextOptions;
  }

  #enforceBrowserContextOptions(options, forced, browserContextName) {
    for (const [key, value] of Object.entries(forced)) {
      if (typeof(value) === "string") {
        options[key] = 
          value.replaceAll(/%browserContextName%/g, browserContextName);
      } else if (Array.isArray(value)) {
        options[key] = [];
        this.#enforceBrowserContextOptions(
          options[key], value, browserContextName);
      } else if (typeof(value) === "object") {
        if (typeof(options[key] !== "object") || Array.isArray(options[key])) {
          options[key] = {};
        }
        this.#enforceBrowserContextOptions(
          options[key], value, browserContextOptions);
      } else {
        options[key] = value;
      }
    }
  }

  #readBrowserContextOptionsFromFileIfExists(browserContextOptionsFile) {
    if (fs.existsSync(browserContextOptionsFile)) {
      return this.#readBrowserContextOptionsFromFile(browserContextOptionsFile);
    } else {
      return {};
    }
  }

  #readBrowserContextOptionsFromFile(browserContextOptionsFile) {
    const browserContextOptionsString =
      fs.readFileSync(browserContextOptionsFile, "utf8");
    const browserContextOptions = JSON.parse(browserContextOptionsString);
    return browserContextOptions;
  }

};

exports.BrowserContexts = BrowserContexts;
