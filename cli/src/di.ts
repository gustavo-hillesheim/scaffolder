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
import { ScaffoldCommand } from "./commands/scaffold.command";
import { CreateBlueprintCommand } from "./commands/create-blueprint.command";

const BLUEPRINTS_ROOT_DIR = normalize(__dirname + "\\..\\blueprints");

export const diContainer = new MinimalDIContainer();

diContainer.register(BlueprintService, () => createBlueprintService(BLUEPRINTS_ROOT_DIR));
diContainer.register(ScaffoldingService, () => createScaffoldingService());
diContainer.register(FileReader, () => createFileReader());
diContainer.register(FileWriter, () => createFileWriter());

diContainer.register(
  ScaffoldCommand,
  () => new ScaffoldCommand(diContainer.get(BlueprintService), diContainer.get(ScaffoldingService))
);
diContainer.register(
  CreateBlueprintCommand,
  () =>
    new CreateBlueprintCommand(
      diContainer.get(FileReader),
      diContainer.get(FileWriter),
      BLUEPRINTS_ROOT_DIR
    )
);
