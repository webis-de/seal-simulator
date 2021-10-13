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

  constructor(scriptDirectory, inputDirectory) {
    super(NAME, VERSION, scriptDirectory, inputDirectory);
    this.setConfigurationRequired(SCRIPT_OPTION_URL);
    this.setConfigurationDefault(
      SCRIPT_OPTION_MIN_HEIGHT, DEFAULT_MIN_HEIGHT);
  }

  async run(browserContexts, outputDirectory) {
    const browserContext = browserContexts[seal.DEFAULT_BROWSER_CONTEXT];

    const page = await browserContext.newPage();
    await page.goto(this.getConfiguration(SCRIPT_OPTION_URL));

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

