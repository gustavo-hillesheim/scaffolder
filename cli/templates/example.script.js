const { createBlueprintService, createScaffoldingService } = require("scaffolding");

async function scaffold() {
  const blueprintService = createBlueprintService(__dirname);
  const scaffoldingService = createScaffoldingService();

  await scaffoldingService.build({
    projectBlueprint: await blueprintService.loadBlueprint("test"),
  });
}

scaffold();
