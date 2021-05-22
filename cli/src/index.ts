import { Command } from "commander";
import { BuildCommand } from "./commands/build.command";
import { SaveBlueprintCommand } from "./commands/save-blueprint.command";
import { DeleteBlueprintCommand } from "./commands/delete-blueprint.command";
import { ListBlueprintsCommand } from "./commands/list-blueprints.command";
import { diContainer } from "./di";

const command = new Command("scaffold");

command.command("build <blueprintName>").action(diContainer.get(BuildCommand).execute);

command
  .command("saveBlueprint <blueprintName>")
  .option("-t, --targetDirectory <targetDirectory>", "Target directory to create a save for")
  .option(
    "-o, --override",
    "Flag indicating that if the blueprint already exists, it should be overwritten"
  )
  .action(diContainer.get(SaveBlueprintCommand).execute);

command.command("listBlueprints").action(diContainer.get(ListBlueprintsCommand).execute);

command
  .command("deleteBlueprint <blueprintName>")
  .action(diContainer.get(DeleteBlueprintCommand).execute);

command.parse(process.argv);
