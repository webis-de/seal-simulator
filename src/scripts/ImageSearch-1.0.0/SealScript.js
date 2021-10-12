const fs = require("fs-extra");
const http = require("http");
const https = require("https");
const path = require('path');

const { AbstractSealScript } = require("../../AbstractSealScript");
const seal = require('../../seal');

const NAME = "ImageSearch";
const VERSION = "1.0.0";

const SCRIPT_OPTION_QUERY = "query";
const SCRIPT_OPTION_NUM_PAGES = "numPages";
const DEFAULT_NUM_PAGES = 3;

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
        const imageDirectory = path.join(outputDirectory, "results", imageNumber.toString().padStart(6, '0'));
        fs.mkdirsSync(imageDirectory);
        await page.waitForTimeout(1000);
        await imageContainer.click();
        await page.waitForTimeout(1000);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        const imageProxyLink = await page.$('a:has-text("View image anonymously")');
        const imageProxyUrl = await imageProxyLink.getAttribute("href");
        const imageUrl = new URL(imageProxyUrl).searchParams.get("piurl");
        fs.writeFileSync(path.join(imageDirectory, "image-url.txt"), imageUrl);
        const suffix = imageUrl.replace(/.*\./, "").replace(/\?.*/, "");
        seal.log("download-image", {
          rank: imageNumber + 1,
          page: pageNumber,
          imageUrl: imageUrl
        });
        const writeImage = (response) => {
          const imageFileStream = fs.createWriteStream(path.join(imageDirectory, "image." + suffix));
          response.pipe(imageFileStream);
        };
        const imageRequestProtocol = imageUrl.replace(/:.*/, ":");
        const imageRequest = imageRequestProtocol === "http:"
          ? http.get(imageUrl, writeImage)
          : https.get(imageUrl, writeImage);
        imageRequest.on("error", (error) => {
          console.log("request error", error);
        });
        imageRequest.end();

        const sourceLink = await page.$(".expanded-site-links > a");
        const sourceUrl = await sourceLink.getAttribute("href");
        fs.writeFileSync(path.join(imageDirectory, "source-url.txt"), sourceUrl);

        ++imageNumber;
        
        const closeButton = await page.$(".expanded-image-drawer > button");
        await closeButton.click();
      }

      await page.click('button:has-text("Next")');
      await page.waitForLoadState("domcontentloaded");
      await page.waitForLoadState("networkidle");
    }

    return true;
  }
};

