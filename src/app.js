const { program } = require('commander');
program.version('0.1.0');
program
  .requiredOption('-s, --script-directory <directory>', 'TODO description')
  .requiredOption('-i, --input-directory <directory>', 'TODO description')
  .requiredOption('-o, --output-directory <directory>', 'TODO description')
  .option('-p, --script-directory <directory>', 'TODO description');
program.parse(process.argv);
const options = program.opts();

if (options.scriptDirectory) {
  console.log(`- ${options.scriptDirectory}`);
}

console.log(`Hello World`);

