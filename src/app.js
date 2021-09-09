const { program } = require('commander');
program.version('0.1.0');
program
  .option('-s, --script-directory <directory>', 'TODO description');
program.parse(process.argv);
const options = program.opts();

if (options.scriptDirectory) {
  console.log(`- ${options.scriptDirectory}`);
}

console.log(`Hello World`);

