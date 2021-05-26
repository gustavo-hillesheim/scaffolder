import { Command } from "commander";
import { BlueprintService, ScaffoldingService } from "@gus_hill/scaffolding";

import { BuildCommand } from "./commands/build.command";
import { SaveBlueprintCommand } from "./commands/save-blueprint.command";
import { DeleteBlueprintCommand } from "./commands/delete-blueprint.command";
import { ListBlueprintsCommand } from "./commands/list-blueprints.command";
import { diContainer } from "./di";

export const blueprintService = diContainer.get(BlueprintService);
export const scaffoldingService = diContainer.get(ScaffoldingService);

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
