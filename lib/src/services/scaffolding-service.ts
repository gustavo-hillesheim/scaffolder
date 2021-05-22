import { normalize, sep } from "path";
import {
  Directory,
  ProjectBlueprint,
  FileBlueprint,
  DirectoryBlueprint,
  File,
  UnknownBlueprintTypeError,
} from "../types";
import { FileWriter } from "../components/file-writer";

export class ScaffoldingService {
  constructor(private readonly fileWriter: FileWriter) {}

  async build(buildDefinition: BuildDefinition): Promise<void> {
    const baseDirectory = this.getBaseDirectory(buildDefinition);

    for (const item of buildDefinition.blueprint.items) {
      if (item instanceof FileBlueprint) {
        await this.buildFile(item, baseDirectory);
      } else if (item instanceof DirectoryBlueprint) {
        await this.buildDirectory(item, baseDirectory);
      } else {
        throw new UnknownBlueprintTypeError((item as any).constructor.name);
      }
    }
  }

  private getBaseDirectory(buildDefinition: BuildDefinition): string {
    if (buildDefinition.outputDirectory) {
      return normalize(buildDefinition.outputDirectory + sep);
    }
    return normalize(process.cwd() + sep);
  }

  private async buildFile(file: FileBlueprint, baseDirectory: string): Promise<void> {
    const finalFilePath = `${baseDirectory}${file.name}`;
    await this.fileWriter.writeFile(new File(finalFilePath, file.content));
  }

  private async buildDirectory(
    directory: DirectoryBlueprint,
    baseDirectory: string
  ): Promise<void> {
    const finalDirectoryPath = `${baseDirectory}${directory.name}`;
    await this.fileWriter.createDirectory(new Directory(finalDirectoryPath));
    await this.build({
      blueprint: {
        items: directory.children,
      },
      outputDirectory: finalDirectoryPath,
    });
  }
}

export interface BuildDefinition {
  blueprint: ProjectBlueprint;
  outputDirectory?: string;
}
