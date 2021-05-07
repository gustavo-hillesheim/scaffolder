import { normalize, sep } from "path";
import { Directory, ProjectBlueprint, FileBlueprint, DirectoryBlueprint, File } from "../types";
import { FileWriter } from "../components/file-writer";

export class ScaffolderService {
  constructor(private readonly fileWriter: FileWriter) {}

  async build(buildDefinition: BuildDefinition): Promise<void> {
    const baseDirectory = this.getBaseDirectory(buildDefinition);
    for (const item of buildDefinition.projectBlueprint.items) {
      if (item instanceof FileBlueprint) {
        await this.buildFile(item, baseDirectory);
      } else if (item instanceof DirectoryBlueprint) {
        await this.buildDirectory(item, baseDirectory);
      } else {
        throw new Error("Unknown file type");
      }
    }
  }

  private getBaseDirectory(buildDefinition: BuildDefinition): string {
    if (buildDefinition.baseDirectory) {
      return normalize(buildDefinition.baseDirectory + sep);
    }
    return normalize(process.cwd() + sep);
  }

  private async buildFile(file: FileBlueprint, baseDirectory: string): Promise<void> {
    const finalFilePath = `${baseDirectory}${file.name}`;
    await this.fileWriter.createFile(new File(finalFilePath, file.content));
  }

  private async buildDirectory(
    directory: DirectoryBlueprint,
    baseDirectory: string
  ): Promise<void> {
    const finalDirectoryPath = `${baseDirectory}${directory.name}`;
    await this.fileWriter.createDirectory(new Directory(finalDirectoryPath));
    if (directory.children) {
      this.build({
        projectBlueprint: {
          items: directory.children,
        },
        baseDirectory: finalDirectoryPath,
      });
    }
  }
}

export interface BuildDefinition {
  projectBlueprint: ProjectBlueprint;
  baseDirectory?: string;
}
