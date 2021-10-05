const { AbstractSealScript } = require("../../AbstractSealScript");

exports.SealScript = class extends AbstractSealScript {

  constructor(scriptDirectory, inputDirectory) {
    super(scriptDirectory, inputDirectory);
  }

  async run(browserContexts, outputDirectory) {
    // TODO

    const simulationComplete = true;
    return simulationComplete;
  }
};

