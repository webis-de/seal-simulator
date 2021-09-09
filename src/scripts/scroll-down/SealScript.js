const SealScriptInterface = require("./SealScriptInterface").SealScriptInterface;

export class SealScript extends SealScriptInterface {
  constructor(scriptDirectory, inputDirectory) {
    super(scriptDirectory, inputDirectory);
    console.log("extended");
  }
};

