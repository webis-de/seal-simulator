const seal = require('../../seal');
const SealScriptInterface = require("../../SealScriptInterface").SealScriptInterface;

exports.SealScript = class extends SealScriptInterface {
  constructor(scriptDirectory, inputDirectory) {
    super(scriptDirectory, inputDirectory);
  }

  run(browserContext, outputDirectory) {
    // TODO

    const simulationComplete = true;
    return simulationComplete;
  }
};

