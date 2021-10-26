const fs = require("fs-extra");
const path = require('path');

const packageInfo = fs.readJsonSync(path.join(__dirname, "..", "package.json"));

module.exports = Object.freeze({
  /**
   * Current version of SEAL
   */
  VERSION: packageInfo.version,

  /**
   * Name of the directory in the script, input, or output directories that
   * contains serialized data for each browser context.
   *
   * The directory contains one directory for each available browser context,
   * with the name of that directory being the context name.
   */
  BROWSER_CONTEXTS_DIRECTORY: "browserContexts",

  /**
   * Name of the default browser context
   */
  BROWSER_CONTEXT_DEFAULT: 'default',

  /**
   * Name of the file in a browser context directory that contains the run's HAR
   * archive.
   */
  BROWSER_CONTEXT_HAR_FILE: "archive.har",

  /**
   * Name of the JSON file in a browser context directory that contains the
   * browser context options used by Playwright.
   */
  BROWSER_CONTEXT_OPTIONS_FILE: "browser.json",

  /**
   * Name of the directory in a browser context directory that contains the
   * run's playwright traces.
   */
  BROWSER_CONTEXT_TRACE_DIRECTORY: "trace",

  /**
   * Context option that specified the type of browser to use.
   */
  BROWSER_CONTEXT_OPTION_BROWSER_TYPE: "browserType",

  /**
   * Default browser to use unless specified otherwise using
   * {@link BROWSER_CONTEXT_OPTION_BROWSER_TYPE}.
   */
  BROWSER_CONTEXT_OPTION_BROWSER_TYPE_DEFAULT: "chromium",

  /**
   * Name of the directory in a browser context directory that contains the user
   * data (cookies, local storage).
   */
  BROWSER_CONTEXT_USER_DATA_DIRECTORY: "userData",

  /**
   * Name of the directory in a browser context directory that contains the
   * run's video recordings.
   */
  BROWSER_CONTEXT_VIDEO_DIRECTORY: "video",

  /**
   * Default width and height for the browser viewport.
   */
  BROWSER_VIEWPORT_DEFAULT: { width: 1280, height: 720 },

  /**
   * Option to specify to store a HAR archive of the run.
   */
  RUN_OPTION_HAR: "har",

  /**
   * Option to specify that HTTPS errors should be ignored.
   */
  RUN_OPTION_INSECURE: "insecure",

  /**
   * Option to specify the proxy to use (absent for none).
   */
  RUN_OPTION_PROXY: "proxy",

  /**
   * Option to specify to store a playwright trace of the run.
   */
  RUN_OPTION_TRACING: "tracing",

  /**
   * Option to specify to store a video recording of the run and at which scale
   * factor.
   */
  RUN_OPTION_VIDEO_SCALE_FACTOR: "video",

  /**
   * Default value for {@link RUN_OPTION_VIDEO_SCALE_FACTOR}
   */
  RUN_OPTION_VIDEO_SCALE_FACTOR_DEFAULT: 1.0,

  /**
   * Name for the main script configuration file in the input directory.
   */
  SCRIPT_CONFIGURATION_FILE: "config.json"

});
