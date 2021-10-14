const fs = require("fs-extra");
const path = require("path");
const log = require("./log")

const source = function(scriptDirectory) {
  log("script-source", {
    scriptDirectory: scriptDirectory
  });

  // Validation
  if (!fs.existsSync(scriptDirectory)) {
    throw new Error(
      "Script directory '" + scriptDirectory + "' does not exist.");
  }
  if (!fs.statSync(scriptDirectory).isDirectory()) {
    throw new Error(
      "Script directory '" + scriptDirectory + "' is not a directory.");
  }
  const scriptModule = path.join(scriptDirectory, "SealScript");
  const scriptFile = scriptModule + ".js";
  if (!fs.existsSync(scriptFile)) {
    throw new Error("Script file '" + scriptFile + "' does not exist.");
  }

  // Execution
  const SealScript = require(scriptModule).SealScript;
  log("script-sourced", {
    scriptFile: scriptFile
  });
  return SealScript;
}

const instantiate = function(scriptDirectory, inputDirectory) {
  const SealScript = source(scriptDirectory);

  log("script-instantiate", {
    scriptDirectory: scriptDirectory,
    inputDirectory: inputDirectory
  });

  // Validation
  if (inputDirectory !== undefined) {
    if (!fs.existsSync(inputDirectory)) {
      throw new Error(
        "Input directory '" + inputDirectory + "' does not exist.");
    }
    if (!fs.statSync(inputDirectory).isDirectory()) {
      throw new Error(
        "Input directory '" + inputDirectory + "' is not a directory.");
    }
  }

  // Execution
  const script = new SealScript(scriptDirectory, inputDirectory);
  log("script-instantiated", {
    name: script.getName(),
    version: script.getVersion(),
    configuration: script.getConfiguration()
  });
  return script;
}
module.exports.instantiate = instantiate;

