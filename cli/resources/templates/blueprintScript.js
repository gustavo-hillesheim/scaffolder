const { Command } = require("commander");
const { blueprintService, scaffoldingService } = require("../../build");

function parseArguments(args) {
  const command = new Command("<outputDirectory>");
  return command.parse(args);
}

async function buildBlueprint({ blueprintName, outputDirectory }) {
  const blueprint = await blueprintService.loadBlueprint(blueprintName);
  const files = blueprint.items.find((item) => item.name === "files").children;

  await scaffoldingService.build({
    blueprint: {
      items: files,
    },
    outputDirectory,
  });
}

async function main(args) {
  const parsedArgs = parseArguments(args);
  await buildBlueprint({
    outputDirectory: parsedArgs.args[0],
    blueprintName: "{blueprintName}",
  });
}

main(process.argv).catch((e) => console.error(`Error while building blueprint: ${e.message}`));
