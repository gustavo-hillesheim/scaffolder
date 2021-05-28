import { Command } from "commander";

import { BuildCommand } from "./commands/build.command";
import { SaveBlueprintCommand } from "./commands/save-blueprint.command";
import { DeleteBlueprintCommand } from "./commands/delete-blueprint.command";
import { ListBlueprintsCommand } from "./commands/list-blueprints.command";
import { diContainer } from "./di";

function runCli(args: string[]) {
  const command = new Command("scaffold");

  command
    .command("build <blueprintName>")
    .allowUnknownOption(true)
    .action(diContainer.get(BuildCommand).execute);

  command
    .command("saveBlueprint <blueprintName>")
    .option("-t, --targetDirectory <targetDirectory>", "Target directory to create a save for")
    .option(
      "-o, --override",
      "Flag indicating that if the blueprint already exists, it should be overwritten"
    )
    .option(
      "-nw, --no-wrapper",
      "Flag indicating that should not add wrapping directory to the blueprint. " +
        "If this option is not specified, the directory being saved will be added to the blueprint, otherwise, only the content will be added",
      false
    )
    .action(diContainer.get(SaveBlueprintCommand).execute);

  command.command("listBlueprints").action(diContainer.get(ListBlueprintsCommand).execute);

  command
    .command("deleteBlueprint <blueprintName>")
    .action(diContainer.get(DeleteBlueprintCommand).execute);

  command.parse(args);
}

const isMainModule = require.main === module;
if (isMainModule) {
  runCli(process.argv);
}
