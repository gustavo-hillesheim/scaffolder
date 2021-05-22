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
import { TemplateProcessor, TemplateVariables } from "../components";

export class ScaffoldingService {
  constructor(
    private readonly fileWriter: FileWriter,
    private readonly templateProcessor: TemplateProcessor
  ) {}

  async build(buildDefinition: BuildDefinition): Promise<void> {
    const baseDirectory = this.getBaseDirectory(buildDefinition);
    buildDefinition.variables ||= {};

    for (const item of buildDefinition.blueprint.items) {
      if (item instanceof FileBlueprint) {
        await this.buildFile(item, baseDirectory, buildDefinition.variables);
      } else if (item instanceof DirectoryBlueprint) {
        await this.buildDirectory(item, baseDirectory, buildDefinition.variables);
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

  private async buildFile(
    file: FileBlueprint,
    baseDirectory: string,
    variables: TemplateVariables
  ): Promise<void> {
    const processedFileName = this.templateProcessor.process(file.name, variables);
    const processedFileContent = file.content
      ? this.templateProcessor.process(file.content, variables)
      : "";
    const finalFilePath = `${baseDirectory}${processedFileName}`;
    await this.fileWriter.writeFile(new File(finalFilePath, processedFileContent));
  }

  private async buildDirectory(
    directory: DirectoryBlueprint,
    baseDirectory: string,
    variables: TemplateVariables
  ): Promise<void> {
    const processedDirectoryName = this.templateProcessor.process(directory.name, variables);
    const finalDirectoryPath = `${baseDirectory}${processedDirectoryName}`;
    await this.fileWriter.createDirectory(new Directory(finalDirectoryPath));
    await this.build({
      blueprint: {
        items: directory.children,
      },
      outputDirectory: finalDirectoryPath,
      variables,
    });
  }
}

export interface BuildDefinition {
  blueprint: ProjectBlueprint;
  outputDirectory?: string;
  variables?: TemplateVariables;
}
