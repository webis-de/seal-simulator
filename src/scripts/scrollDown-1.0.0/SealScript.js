const { AbstractSealScript } = require("../../AbstractSealScript");
const path = require('path');

const seal = require('../../seal');

const NAME = "ScrollDown";
const VERSION = "1.0.0";

const SCRIPT_OPTION_URL = "url";

exports.SealScript = class extends AbstractSealScript {

  #scriptOptions;

  constructor(scriptDirectory, inputDirectory) {
    super(NAME, VERSION, scriptDirectory, inputDirectory);
    this.#scriptOptions =
      this.readOptions(seal.DEFAULT_SCRIPT_CONFIGURATION_FILE);
    if (this.#scriptOptions[SCRIPT_OPTION_URL] === undefined) {
      throw new Error("This script requires an input directory that contains "
        + "at least a '" + seal.DEFAULT_SCRIPT_CONFIGURATION_FILE + "' with an '"
        + SCRIPT_OPTION_URL + "' attribute.");
    }
    seal.log("script-options-complete", this.#scriptOptions)
  }

  async run(browserContexts, outputDirectory) {
    const browserContext = browserContexts[seal.DEFAULT_BROWSER_CONTEXT];

    const page = await browserContext.newPage();
    await page.goto(this.#scriptOptions[SCRIPT_OPTION_URL]);
    await page.screenshot({
      path: path.join(outputDirectory, "screenshot.png"),
      fullPage: true
    });

    const simulationComplete = true;
    return simulationComplete;
  }
};

