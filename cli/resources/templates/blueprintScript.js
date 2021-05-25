const { BlueprintService, ScaffoldingService } = require("@gus_hill/scaffolding");
const { diContainer } = require("../../build/di");

async function main(args) {
  const outputDirectory = args[0];

  const blueprintService = diContainer.get(BlueprintService);
  const blueprint = await blueprintService.loadBlueprint("{blueprintName}");
  const files = blueprint.items.find((item) => item.name === "files").children;

  const scaffoldingService = diContainer.get(ScaffoldingService);
  await scaffoldingService.build({
    blueprint: {
      items: files,
    },
    outputDirectory,
  });
}

main(process.argv.slice(2));
