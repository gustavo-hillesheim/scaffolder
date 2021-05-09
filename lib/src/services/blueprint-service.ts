import { Directory, ProjectBlueprint } from "../types";
import { FileReader } from "../components/file-reader";
import { createBlueprint } from "../utils";
import { basename } from "path";

export class BlueprintService {
  constructor(
    private readonly fileReader: FileReader,
    private readonly blueprintsRootDirectory: string
  ) {}

  async loadBlueprint(blueprintName: string): Promise<ProjectBlueprint> {
    const files = await this.fileReader.readAll(
      `${this.blueprintsRootDirectory}\\${blueprintName}`,
      {
        recursive: true,
      }
    );
    return { items: files.map(createBlueprint) };
  }

  async listBlueprints(): Promise<string[]> {
    return this.fileReader
      .listAll(this.blueprintsRootDirectory, {
        recursive: false,
      })
      .then((files) =>
        files.filter((file) => file instanceof Directory).map((file) => basename(file.path))
      );
  }
}
