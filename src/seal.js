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

