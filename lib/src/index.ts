import { di } from "./di";
import { FileReader, FileWriter } from "./components";
import { BlueprintService, ScaffoldingService } from "./services";

export * from "./components";
export * from "./services";
export * from "./types";
export * from "./utils";

export function createScaffoldingService(): ScaffoldingService {
  return di.get(ScaffoldingService);
}

export function createFileReader(): FileReader {
  return di.get(FileReader);
}

export function createFileWriter(): FileWriter {
  return di.get(FileWriter);
}

export function createBlueprintService(blueprintsDirectory: string): BlueprintService {
  return new BlueprintService(createFileReader(), createFileWriter(), blueprintsDirectory);
}
