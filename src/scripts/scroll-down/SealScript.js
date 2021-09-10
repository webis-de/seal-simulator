const {AbstractSealScript} = require("../../AbstractSealScript");

exports.SealScript = class extends AbstractSealScript {
  constructor(scriptDirectory, inputDirectory) {
    super(scriptDirectory, inputDirectory);
    console.log("extended");
  }

  run(string){
    super.run(`Message from Script, ${string}`)
  }
};

