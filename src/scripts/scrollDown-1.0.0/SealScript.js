const {AbstractSealScript} = require("../../AbstractSealScript");

exports.SealScript = class extends AbstractSealScript {
  constructor(scriptDirectory, inputDirectory) {
    super(scriptDirectory, inputDirectory);
  }

  run(browserContext, outputDirectory) {
    // TODO

    const simulationComplete = true;
    return simulationComplete;
  }
};

