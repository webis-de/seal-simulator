const fs = require("fs-extra");
const path = require('path');
const playwright = require('playwright');

////////////////////////////////////////////////////////////////////////////////
// CONSTANTS
////////////////////////////////////////////////////////////////////////////////

/**
 * Current version of SEAL.
 */
const VERSION = '0.1.0';
exports.VERSION = VERSION

/**
 * Default name for the main script configuration file in the input directory.
 */
const DEFAULT_SCRIPT_CONFIGURATION_FILE = "run.json";
exports.DEFAULT_SCRIPT_CONFIGURATION_FILE = DEFAULT_SCRIPT_CONFIGURATION_FILE;

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

