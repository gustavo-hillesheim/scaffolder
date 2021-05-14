import { Command } from "commander";
import { ScaffoldCommand } from "./commands/scaffold.command";
import { CreateBlueprintCommand } from "./commands/create-blueprint.command";
import { diContainer } from "./di";

const command = new Command("scaffold");

command.command("[blueprintName]").action(diContainer.get(ScaffoldCommand).execute);
command
  .command("create")
  .command("blueprint <blueprintName>")
  .option("-t, --targetDirectory <targetDirectory>", "Target directory to create a blueprint for")
  .action(diContainer.get(CreateBlueprintCommand).execute);

command.parse(process.argv);
