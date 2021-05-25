const { BlueprintService, ScaffoldingService } = require("@gus_hill/scaffolding");
const { Command } = require("commander");
const { diContainer } = require("../../build/di");

function parseArguments(args) {
  const command = new Command("<outputDirectory>");
  return command.parse(args);
}

async function buildBlueprint({ blueprintName, outputDirectory }) {
  const blueprintService = diContainer.get(BlueprintService);
  const blueprint = await blueprintService.loadBlueprint(blueprintName);
  const files = blueprint.items.find((item) => item.name === "files").children;

  const scaffoldingService = diContainer.get(ScaffoldingService);
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
