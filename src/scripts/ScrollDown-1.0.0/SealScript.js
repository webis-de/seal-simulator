const fs = require("fs-extra");
const path = require('path');

const { AbstractSealScript } = require("../../AbstractSealScript");
const seal = require('../../seal');

const NAME = "ScrollDown";
const VERSION = "1.0.0";

const SCRIPT_OPTION_URL = "url";
const SCRIPT_OPTION_MIN_HEIGHT = "minHeigth";
const DEFAULT_MIN_HEIGHT = 663;

exports.SealScript = class extends AbstractSealScript {

  #scriptOptions;
  #url;
  #minHeight;

  constructor(scriptDirectory, inputDirectory) {
    super(NAME, VERSION, scriptDirectory, inputDirectory);
    this.#scriptOptions =
      this.readOptions(seal.DEFAULT_SCRIPT_CONFIGURATION_FILE);
    if (this.#scriptOptions[SCRIPT_OPTION_URL] === undefined) {
      throw new Error("This script requires an input directory that contains "
        + "at least a '" + seal.DEFAULT_SCRIPT_CONFIGURATION_FILE + "' with an '"
        + SCRIPT_OPTION_URL + "' attribute.");
    } else {
      this.#url = this.#scriptOptions[SCRIPT_OPTION_URL];
    }
    if (this.#scriptOptions[SCRIPT_OPTION_MIN_HEIGHT] === undefined) {
      this.#minHeight = DEFAULT_MIN_HEIGHT;
    } else {
      this.#minHeight = this.#scriptOptions[SCRIPT_OPTION_MIN_HEIGHT];
    }
    seal.log("script-options-complete", this.#scriptOptions)
  }

  async run(browserContexts, outputDirectory) {
    const browserContext = browserContexts[seal.DEFAULT_BROWSER_CONTEXT];

    const page = await browserContext.newPage();
    await page.goto(this.#url);

    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');

    const viewportSize = page.viewportSize();
    viewportSize.height = await seal.getScrollHeight(page);
    await page.setViewportSize(viewportSize); 

    const nodesSnapshot = seal.getNodesSnapshot(page)
      .then(nodes => fs.writeFile(path.join(outputDirectory, "nodes.jsonl"), nodes));

    await page.screenshot({
      path: path.join(outputDirectory, "screenshot.png"),
      fullPage: true 
    });

    const domSnapshot = seal.getDomSnapshot(page)
      .then(dom => fs.writeFile(path.join(outputDirectory, "dom.html"), dom));

    await nodesSnapshot;
    await domSnapshot;
    const simulationComplete = true;
    return simulationComplete;
  }
};

