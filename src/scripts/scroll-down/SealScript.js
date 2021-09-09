const SealScriptInterface = require("../../SealScriptInterface").SealScriptInterface;

exports.SealScript = class extends SealScriptInterface {
  constructor(scriptDirectory, inputDirectory) {
    super(scriptDirectory, inputDirectory);
    console.log("extended");
  }
};

