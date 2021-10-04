const fs = require("fs");
const path = require('path');

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

////////////////////////////////////////////////////////////////////////////////
// STATIC FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

log = function(name, attributes = {}) {
  const record = Object.assign({timestamp: true, event: true}, attributes);
  record.timestamp = new Date().toISOString();
  record.event = name;
  console.log(JSON.stringify(record));
}
exports.log = log;

// READING BROWSER CONTEXT OPTIONS

readBrowserContextOptionsAll(scriptDirectory, inputDirectory) {
  listDirectories = (parent) => {
    return fs.readdirSync(parent, {withFileTypes: true})
      .filter(child => child.isDirectory())
      .map(directory => directory.name);
  }

  const browserContextNames = new Set(listDirectories(path.join(
    scriptDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME)));
  listDirectories(path.join(
    inputDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME)).forEach(directoryName => {
      browserContextNames.add(directoryName);
    });

  const browserContextOptions = {};
  browserContextNames.forEach(browserContextName => {
    browserContextOptions[browserContextName] = readBrowserContextOptions(
      browserContextName, scriptDirectory, inputDirectory);
  });
  return browserContextOptions;
}
exports.readBrowserContextOptions = readBrowserContextOptions;


readBrowserContextOptions(browserContextName, scriptDirectory, inputDirectory) {
  const browserContextOptions = {};
  Object.assign(browserContextOptions, readJsonIfExists(path.join(
    scriptDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME,
    BROWSER_CONTEXT_OPTIONS_FILE_NAME)));
  Object.assign(browserContextOptions, readJsonIfExists(path.join(
    scriptDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME,
    browserContextName, BROWSER_CONTEXT_OPTIONS_FILE_NAME)));
  Object.assign(browserContextOptions, readJsonIfExists(path.join(
    inputDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME,
    BROWSER_CONTEXT_OPTIONS_FILE_NAME)));
  Object.assign(browserContextOptions, readJsonIfExists(path.join(
    inputDirectory, BROWSER_CONTEXTS_DIRECTORY_NAME,
    browserContextName, BROWSER_CONTEXT_OPTIONS_FILE_NAME)));
  return browserContextOptions;
}
exports.readBrowserContextOptions = readBrowserContextOptions;

// IO UTILITIES

readJsonIfExists(jsonFile) {
  if (fs.existsSync(jsonFile)) {
    const json = fs.readFileSync(jsonFile, "utf8");
    return JSON.parse(json);
  } else {
    return {};
  }
}
exports.readJsonIfExists = readJsonIfExists;

