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
const CONTEXTS_DIRECTORY = "browserContexts";
exports.CONTEXTS_DIRECTORY = CONTEXTS_DIRECTORY;

/**
 * Name of the directory in a context directory that contains the user data
 * (cookies, local storage).
 */
const CONTEXT_DIRECTORY_USER_DATA = "userData";
exports.CONTEXT_DIRECTORY_USER_DATA = CONTEXT_DIRECTORY_USER_DATA;

/**
 * Names of JSON files that contain browser context options as used in
 * Playwright.
 *
 * If the file is directly within the browser contexts directory
 * ({@link CONTEXTS_DIRECTORY}), it applies to all browser contexts. If it is
 * within a sub-directory, it applies only to the respective browser context.
 */
const BROWSER_CONTEXT_OPTIONS_FILE = "browser.json";
exports.BROWSER_CONTEXT_OPTIONS_FILE = BROWSER_CONTEXT_OPTIONS_FILE;

/**
 * Name of the default browser context.
 */
const DEFAULT_BROWSER_CONTEXT = "default";
exports.DEFAULT_BROWSER_CONTEXT = DEFAULT_BROWSER_CONTEXT;

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

// CONTEXT DIRECTORIES

const getContextsDirectory = function(baseDirectory) {
  return path.join(baseDirectory, CONTEXTS_DIRECTORY);
}
exports.getContextsDirectory = getContextsDirectory;

const getContextDirectory = function(contextName, baseDirectory) {
  return path.join(getContextsDirectory(baseDirectory), contextName);
}
exports.getContextDirectory = getContextDirectory;

// OPTIONS

const readOptions = function(fileName, scriptDirectory, inputDirectory) {
  for (baseDirectory of [ inputDirectory, scriptDirectory ]) {
    if (baseDirectory !== null) {
      const optionsFile = path.join(baseDirectory, fileName);
      if (fs.existsSync(optionsFile)) {
        return readJson(optionsFile);
      }
    }
  }
  return {};
}
exports.readOptions = readOptions;

const writeOptions = function(options, fileName, outputDirectory) {
  fs.mkdirsSync(outputDirectory);
  const optionsFile = path.join(outputDirectory, fileName);
  fs.writeJsonSync(optionsFile, options);
}
exports.writeOptions = writeOptions;

const readContextNames = function(scriptDirectory, inputDirectory) {
  const contextNames = new Set();
  for (baseDirectory of [ inputDirectory, scriptDirectory ]) {
    if (baseDirectory !== null) {
      const contextsDirectory = getContextsDirectory(baseDirectory);
      if (fs.existsSync(contextsDirectory)) {
        fs.readdirSync(contextsDirectory, {withFileTypes: true})
          .filter(contextDirectory => contextDirectory.isDirectory())
          .forEach(contextDirectory => {
            contextNames.add(contextDirectory.name);
          });
      }
    }
  }
  return Array.from(contextNames);
}
exports.readContextNames = readContextNames;

const readContextOptions = function(
    contextName, fileName, scriptDirectory, inputDirectory) {
  const contextOptions = {};
  for (baseDirectory of [ inputDirectory, scriptDirectory ]) {
    if (baseDirectory !== null) {
      const genericContextOptionsFile =
        path.join(getContextsDirectory(baseDirectory), fileName);
      const specificContextOptionsFile =
        path.join(getContextDirectory(contextName, baseDirectory), fileName);
      if (fs.existsSync(genericContextOptionsFile)
          || fs.existsSync(specificContextOptionsFile)) {
        Object.assign(contextOptions,
          readJsonIfExists(genericContextOptionsFile));
        Object.assign(contextOptions,
          readJsonIfExists(specificContextOptionsFile));
        break;
      }
    }
  }
  return contextOptions;
}
exports.readContextOptions = readContextOptions;

const readContextOptionsAll = function(fileName, scriptDirectory, inputDirectory) {
  const contextNames = readContextNames(scriptDirectory, inputDirectory);

  const contextOptions = {};
  contextNames.forEach(contextName => {
    contextOptions[contextName] = readContextOptions(
      contextName, scriptDirectory, inputDirectory);
  });
  return contextOptions;
}
exports.readContextOptionsAll = readContextOptionsAll;

const writeContextOptions = function(
    contextOptions, contextName, fileName, outputDirectory) {
  const contextDirectory =
    getContextDirectory(contextName, outputDirectory);
  fs.mkdirsSync(contextDirectory);
  const contextOptionsFile = path.join(contextDirectory, fileName);
  fs.writeJsonSync(contextOptionsFile, contextOptions);
}
exports.writeContextOptions = writeContextOptions;

