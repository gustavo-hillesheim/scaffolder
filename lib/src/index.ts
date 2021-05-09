import { diContainer } from "./di";
import { FileReader, FileWriter } from "./components";
import { BlueprintService, ScaffoldingService } from "./services";

export * from "./components";
export * from "./services";
export * from "./types";
export * from "./utils";

export function createScaffoldingService(): ScaffoldingService {
  return diContainer.get(ScaffoldingService);
}

export function createFileReader(): FileReader {
  return diContainer.get(FileReader);
}

export function createFileWriter(): FileWriter {
  return diContainer.get(FileWriter);
}

export function createBlueprintService(templatesDirectory: string): BlueprintService {
  return new BlueprintService(diContainer.get(FileReader), templatesDirectory);
}
