import { Command } from "commander";
import { createBlueprintService, createScaffolderService, ProjectBlueprint } from "scaffolder";
import { normalize } from "path";

const PROJECT_ROOT_DIR = normalize(__dirname + "\\..\\blueprints");

const command = new Command("scaffold");
const blueprintService = createBlueprintService(PROJECT_ROOT_DIR);
const scaffolderService = createScaffolderService();

command.command("build [blueprintName]").action(async (blueprintName: string) => {
  if (!blueprintName) {
    const blueprints = await blueprintService.listBlueprints();
    console.log("No blueprint was informed.");
    if (blueprints.length === 0) {
      console.log(
        "There is no blueprint available. Use 'blueprint create' in a directory to create a blueprint of it."
      );
    } else {
      console.log("Available blueprints:");
      blueprints.forEach((blueprint) => {
        console.log(`- ${blueprint}`);
      });
    }
  } else {
    console.log(`Building blueprint "${blueprintName}"`);
    const projectBlueprint = await blueprintService.loadBlueprint(blueprintName);
    await scaffolderService.build({
      projectBlueprint: projectBlueprint as ProjectBlueprint,
    });
  }
});

command.parse(process.argv);
