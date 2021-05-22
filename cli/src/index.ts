import { Command } from "commander";
import { BuildCommand } from "./commands/build.command";
import { CreateBlueprintCommand } from "./commands/create-blueprint.command";
import { DeleteBlueprintCommand } from "./commands/delete-blueprint.command";
import { ListBlueprintsCommand } from "./commands/list-blueprints.command";
import { diContainer } from "./di";

const command = new Command("scaffold");

command.command("build <blueprintName>").action(diContainer.get(BuildCommand).execute);

command
  .command("createBlueprint <blueprintName>")
  .option("-t, --targetDirectory <targetDirectory>", "Target directory to create a blueprint for")
  .action(diContainer.get(CreateBlueprintCommand).execute);

command.command("listBlueprints").action(diContainer.get(ListBlueprintsCommand).execute);

command
  .command("deleteBlueprint <blueprintName>")
  .action(diContainer.get(DeleteBlueprintCommand).execute);

command.parse(process.argv);
