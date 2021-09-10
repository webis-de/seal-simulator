exports.AbstractSealScript = class {
  constructor(scriptDirectory, inputDirectory) {
    console.log(scriptDirectory);
    console.log(inputDirectory);
  }

  async getNewContext(contextOptions){
    let context = await getBrowser().newContext(contextOptions)
    // hier irgendwie den context bekommen
    return context
  }

  run(string) {
    console.log(`Message from superclass, ${string}`);
  }
};

