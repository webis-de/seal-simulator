const { AbstractSealScript } = require("../../AbstractSealScript");
const path = require('path');

const seal = require('../../seal');

exports.SealScript = class extends AbstractSealScript {

  #runOptions;

  constructor(scriptDirectory, inputDirectory) {
    super(scriptDirectory, inputDirectory);
    this.#runOptions = this.readOptions("run.json");
    if (this.#runOptions["url"] === undefined) {
      throw new Error("This script requires an input directory that contains "
        + "at least a 'run.json' with an 'url' attribute.");
    }
    seal.log("script-options", this.#runOptions)
  }

  async run(browserContexts, outputDirectory) {
    const browserContext = browserContexts[seal.DEFAULT_BROWSER_CONTEXT];

    const page = await browserContext.newPage();
    await page.goto(this.#runOptions["url"]);
    await page.screenshot({
      path: path.join(outputDirectory, "screenshot.png"),
      fullPage: true
    });

    const simulationComplete = true;
    return simulationComplete;
  }
};

