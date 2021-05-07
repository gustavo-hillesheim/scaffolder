import { Command } from "commander";
import { createBlueprintService } from "scaffolding";
import { normalize } from "path";

const PROJECT_ROOT_DIR = normalize(__dirname + "\\..\\templates");

const command = new Command("scaffold");
const blueprintService = createBlueprintService(PROJECT_ROOT_DIR);

const blueprintCommand = command.command("blueprint");

blueprintCommand.command("build [blueprint]").action(async (template: string) => {
  if (!template) {
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
  }
});

command.parse(process.argv);
