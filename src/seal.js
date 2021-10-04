const fs = require("fs-extra");
const path = require('path');
const playwright = require('playwright');

////////////////////////////////////////////////////////////////////////////////
// CONSTANTS
////////////////////////////////////////////////////////////////////////////////

/**
 * Name of the directory in the script, input, or output directories that
 * contains serialized data for each browser context.
 *
 * The directory contains one directory for each available browser context,
 * with the name of that directory being the context name.
 */
const BROWSER_CONTEXTS_DIRECTORY_NAME = "browserContexts";
exports.BROWSER_CONTEXTS_DIRECTORY_NAME = BROWSER_CONTEXTS_DIRECTORY_NAME;

/**
 * Name of the directory in a browser context directory that contains the user
 * data (cookies, local storage).
 */
const BROWSER_CONTEXT_USER_DATA_DIRECTORY_NAME = "userData";
exports.BROWSER_CONTEXT_USER_DATA_DIRECTORY_NAME =
  BROWSER_CONTEXT_USER_DATA_DIRECTORY_NAME;

/**
 * Names of JSON files that contain browser context options as used in
 * Playwright.
 *
 * If the file is directly within the browser contexts directory
 * ({@link BROWSER_CONTEXTS_DIRECTORY_NAME}), it applies to all browser contexts. If
 * it is within a sub-directory, it applies only to the respective browser
 * context.
 */
const BROWSER_CONTEXT_OPTIONS_FILE_NAME = "options.json";
exports.BROWSER_CONTEXT_OPTIONS_FILE_NAME = BROWSER_CONTEXT_OPTIONS_FILE_NAME;

/**
 * Name of the default browser context.
 */
const DEFAULT_BROWSER_CONTEXT_NAME = "default";
exports.DEFAULT_BROWSER_CONTEXT_NAME = DEFAULT_BROWSER_CONTEXT_NAME;

/**
 * Browser context option that specified the type of browser to use.
 */
const BROWSER_CONTEXT_OPTION_BROWSER_TYPE = "browserType";
exports.BROWSER_CONTEXT_OPTION_BROWSER_TYPE = BROWSER_CONTEXT_OPTION_BROWSER_TYPE;

/**
 * Default browser to use unless specified otherwise using
 * {@link BROWSER_CONTEXT_OPTION_BROWSER_TYPE}.
 */
const DEFAULT_BROWSER_TYPE = "chromium";
exports.DEFAULT_BROWSER_TYPE = DEFAULT_BROWSER_TYPE;

////////////////////////////////////////////////////////////////////////////////
// STATIC FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

const log = function(name, attributes = {}) {
  const record = Object.assign({timestamp: true, event: true}, attributes);
  record.timestamp = new Date().toISOString();
  record.event = name;
  console.log(JSON.stringify(record));
}
exports.log = log;

// IO UTILITIES

const readJson = function(jsonFile) {
  const json = fs.readFileSync(jsonFile, "utf8");
  return JSON.parse(json);
}
exports.readJson = readJson;

const readJsonIfExists = function(jsonFile) {
  if (fs.existsSync(jsonFile)) {
    return readJson(jsonFile);
  } else {
    return {};
  }
}
exports.readJsonIfExists = readJsonIfExists;

// BROWSER CONTEXT

const startBrowserContext = async function(
    browserContextName, browserContextOptions,
    scriptDirectory, inputDirectory, outputDirectory,
    sealOptions = {}) {
  // Copy or create user data directory
  const contextOutputDirectory = path.join(
    outputDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME, browserContextName);
  fs.mkdirSync(contextOutputDirectory, { recursive: true });
  const userDataDirectory = path.join(
    contextOutputDirectory, BROWSER_CONTEXT_USER_DATA_DIRECTORY_NAME);
  if (inputDirectory !== null && fs.existsSync(path.join(
      inputDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME, browserContextName,
      BROWSER_CONTEXT_USER_DATA_DIRECTORY_NAME))) {
    // copy from existing user data directory in input directory
    fs.copySync(
      path.join(inputDirectory,
        BROWSER_CONTEXTS_DIRECTORY_NAME, browserContextName,
        BROWSER_CONTEXT_USER_DATA_DIRECTORY_NAME),
      userDataDirectory);
  } else if (fs.existsSync(path.join(
      scriptDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME, browserContextName,
      BROWSER_CONTEXT_USER_DATA_DIRECTORY_NAME)) {
    // copy from existing user data directory in script directory
    fs.copySync(
      path.join(scriptDirectory,
        BROWSER_CONTEXTS_DIRECTORY_NAME, browserContextName,
        BROWSER_CONTEXT_USER_DATA_DIRECTORY_NAME),
      userDataDirectory);
  } else {
    // create new data directory
    fs.mkdirSync(userDataDirectory);
  }

  // Launch
  const browserType =
    browserContextOptions[BROWSER_CONTEXT_OPTION_BROWSER_TYPE]
    || DEFAULT_BROWSER_TYPE;
  const browserContext = playwright[browserType]
    .launchPersistentContext(userDataDirectory, browserContextOptions);
  return browserContext;
}
exports.startBrowserContext = startBrowserContext;

// READING BROWSER CONTEXT OPTIONS

const readBrowserContextOptions = function(
    browserContextName, scriptDirectory, inputDirectory) {
  const browserContextOptions = {};

  // Read options from the input directory if files exist
  if (inputDirectory !== null) {
    const genericBrowserContextOptionsFile = path.join(
      inputDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME,
      BROWSER_CONTEXT_OPTIONS_FILE_NAME);
    const specificBrowserContextOptionsFile = path.join(
      inputDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME,
      browserContextName, BROWSER_CONTEXT_OPTIONS_FILE_NAME);
    if (fs.existsSync(genericBrowserContextOptionsFile)
        || fs.existsSync(specificBrowserContextOptionsFile)) {
      Object.assign(browserContextOptions,
        readJsonIfExists(genericBrowserContextOptionsFile));
      Object.assign(browserContextOptions,
        readJsonIfExists(specificBrowserContextOptionsFile));
      return browserContextOptions;
    }
  }

  // input directory == null or contains bo browser context options file
  // => use browser context options file from script directory
  const genericBrowserContextOptionsFile = path.join(
    scriptDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME,
    BROWSER_CONTEXT_OPTIONS_FILE_NAME);
  const specificBrowserContextOptionsFile = path.join(
    scriptDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME,
    browserContextName, BROWSER_CONTEXT_OPTIONS_FILE_NAME);
  Object.assign(browserContextOptions,
    readJsonIfExists(genericBrowserContextOptionsFile));
  Object.assign(browserContextOptions,
    readJsonIfExists(specificBrowserContextOptionsFile));
  return browserContextOptions;
}
exports.readBrowserContextOptions = readBrowserContextOptions;

const readBrowserContextOptionsAll = function(scriptDirectory, inputDirectory) {
  const listDirectories = (parent) => {
    if (fs.existsSync(parent)) {
      return fs.readdirSync(parent, {withFileTypes: true})
        .filter(child => child.isDirectory())
        .map(directory => directory.name);
    } else {
      return [];
    }
  }

  const browserContextNames = new Set(listDirectories(path.join(
    scriptDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME)));
  if (inputDirectory !== null) {
    listDirectories(path.join(
      inputDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME)).forEach(
        directoryName => browserContextNames.add(directoryName));
  }

  const browserContextOptions = {};
  browserContextNames.forEach(browserContextName => {
    browserContextOptions[browserContextName] = readBrowserContextOptions(
      browserContextName, scriptDirectory, inputDirectory);
  });
  return browserContextOptions;
}
exports.readBrowserContextOptionsAll = readBrowserContextOptionsAll;

