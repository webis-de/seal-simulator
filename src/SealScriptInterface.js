exports.SealScriptInterface = class {
  constructor(scriptDirectory, inputDirectory) {
    console.log(scriptDirectory);
    console.log(inputDirectory);
  }

  foo() {
    console.log("foo");
  }
};

