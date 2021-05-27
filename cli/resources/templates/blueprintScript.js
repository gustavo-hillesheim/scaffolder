const { Command } = require("commander");
const { buildBlueprint, parseVariables } = require("../../build/blueprint-script-utils");

async function main(args) {
  const command = new Command("<outputDirectory>").allowUnknownOption(true).parse(args);
  const blueprintName = "{blueprintName}";

  await buildBlueprint({
    outputDirectory: command.args[0],
    blueprintName,
    variables: parseVariables(command.args.slice(1)),
  })
    .then(() => console.log(`Built blueprint "${blueprintName}" successfully!`))
    .catch((e) => console.error(`Error while building blueprint: ${e.message}`));
}

main(process.argv);
