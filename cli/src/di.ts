import {
  BlueprintService,
  createBlueprintService,
  createFileReader,
  createFileWriter,
  createScaffoldingService,
  FileReader,
  FileWriter,
  ScaffoldingService,
} from "@gus_hill/scaffolding";
import { MinimalDIContainer } from "minimal-di";
import { normalize } from "path";
import { BuildCommand } from "./commands/build.command";
import { SaveBlueprintCommand } from "./commands/save-blueprint.command";
import { DeleteBlueprintCommand } from "./commands/delete-blueprint.command";
import { ListBlueprintsCommand } from "./commands/list-blueprints.command";

const RESOURCES_ROOT_DIR = normalize(__dirname + "\\..\\resources");
const BLUEPRINTS_ROOT_DIR = normalize(__dirname + "\\..\\blueprints");

export const diContainer = new MinimalDIContainer();

diContainer.register(BlueprintService, () => createBlueprintService(BLUEPRINTS_ROOT_DIR));
diContainer.register(ScaffoldingService, () => createScaffoldingService());
diContainer.register(FileReader, () => createFileReader());
diContainer.register(FileWriter, () => createFileWriter());

diContainer.register(
  BuildCommand,
  () => new BuildCommand(diContainer.get(BlueprintService), BLUEPRINTS_ROOT_DIR)
);
diContainer.register(
  ListBlueprintsCommand,
  () => new ListBlueprintsCommand(diContainer.get(BlueprintService))
);
diContainer.register(
  SaveBlueprintCommand,
  () =>
    new SaveBlueprintCommand(
      diContainer.get(FileReader),
      diContainer.get(BlueprintService),
      RESOURCES_ROOT_DIR
    )
);
diContainer.register(
  DeleteBlueprintCommand,
  () => new DeleteBlueprintCommand(diContainer.get(BlueprintService))
);
