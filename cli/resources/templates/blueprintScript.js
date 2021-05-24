const { createScaffoldingService, createBlueprintService } = require("@gus_hill/scaffolding");

async function main(args) {
  const outputDirectory = args[0];

  const blueprintService = createBlueprintService();
  const blueprint = await blueprintService.loadBlueprint("{blueprintName}");

  const scaffoldingService = createScaffoldingService();
  await scaffoldingService.build({
    blueprint,
    outputDirectory,
  });
}

main(process.argv.slice(2));
