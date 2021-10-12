const fs = require("fs-extra");
const https = require("https");
const path = require('path');

const { AbstractSealScript } = require("../../AbstractSealScript");
const seal = require('../../seal');

const NAME = "ImageSearch";
const VERSION = "1.0.0";

const SCRIPT_OPTION_QUERY = "query";
const SCRIPT_OPTION_NUM_PAGES = "numPages";
const DEFAULT_NUM_PAGES = 10;

const BASE_URL = "https://www.startpage.com";
const HOME_URL = "https://www.startpage.com/en/pics.html";
const HOME_QUERY_BOX = "#query"

exports.SealScript = class extends AbstractSealScript {

  #query;
  #numPages;

  constructor(scriptDirectory, inputDirectory) {
    super(NAME, VERSION, scriptDirectory, inputDirectory);
    const scriptOptions = this.readOptions(seal.DEFAULT_SCRIPT_CONFIGURATION_FILE);
    if (scriptOptions[SCRIPT_OPTION_QUERY] === undefined) {
      throw new Error("This script requires an input directory that contains "
        + "at least a '" + seal.DEFAULT_SCRIPT_CONFIGURATION_FILE + "' with an '"
        + SCRIPT_OPTION_QUERY + "' attribute.");
    } else {
      this.#query = scriptOptions[SCRIPT_OPTION_QUERY];
    }
    if (scriptOptions[SCRIPT_OPTION_NUM_PAGES] === undefined) {
      this.#numPages = DEFAULT_NUM_PAGES;
    } else {
      this.#numPages = scriptOptions[SCRIPT_OPTION_NUM_PAGES];
    }
    seal.log("script-options-complete", {
      query: this.#query,
      numPages: this.#numPages
    })
  }

  async run(browserContexts, outputDirectory) {
    const browserContext = browserContexts[seal.DEFAULT_BROWSER_CONTEXT];

    const page = await browserContext.newPage();
    await page.goto(HOME_URL);
    await page.fill(HOME_QUERY_BOX, this.#query);
    await page.keyboard.press("Enter");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("networkidle");

    let imageNumber = 0;
    for (let pageNumber = 1; pageNumber <= this.#numPages; ++pageNumber) {
      const imageContainers = await page.$$(".image-container");
      for (const imageContainer of imageContainers) {
        const html = await imageContainer.innerHTML();
        const imageDirectory = path.join(outputDirectory, "results", imageNumber.toString());
        fs.mkdirsSync(imageDirectory);
        await page.waitForTimeout(1000);
        await imageContainer.click();
        await page.waitForTimeout(1000);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        const image = await page.$(".expanded-image-container > img");
        const imageUrl = BASE_URL + await image.getAttribute("src");
        console.log(imageUrl);
        https.get(imageUrl, response => {
          const imageFileStream = fs.createWriteStream(path.join(imageDirectory, "image"));
          response.pipe(imageFileStream);
        });

        const sourceLink = await page.$(".expanded-site-links > a");
        const sourceUrl = await sourceLink.getAttribute("href");
        fs.writeFileSync(path.join(imageDirectory, "source.txt"), sourceUrl);

        ++imageNumber;
        
        const closeButton = await page.$(".expanded-image-drawer > button");
        await closeButton.click();
      }

      // TODO: hit "Next" button

      await page.waitForLoadState("domcontentloaded");
      await page.waitForLoadState("networkidle");
    }

    return true;
  }
};

