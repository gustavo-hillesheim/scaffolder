import { normalize, sep } from "path";
import {
  Directory,
  ProjectBlueprint,
  FileBlueprint,
  DirectoryBlueprint,
  File,
  UnknownBlueprintTypeError,
  Blueprint,
  BlueprintProcessingError,
} from "../types";
import { FileWriter } from "../components/file-writer";
import { TemplateProcessor, TemplateVariables } from "../components";

export class ScaffoldingService {
  constructor(
    private readonly fileWriter: FileWriter,
    private readonly templateProcessor: TemplateProcessor
  ) {}

  async build(buildDefinition: BuildDefinition): Promise<void> {
    buildDefinition.variables ||= {};
    const baseDirectory = this.getBaseDirectory(buildDefinition);
    const blueprint = this.processProjectBlueprint(
      buildDefinition.blueprint,
      buildDefinition.variables
    );
    await this.buildBlueprintsAt(blueprint.items, baseDirectory);
  }

  private getBaseDirectory(buildDefinition: BuildDefinition): string {
    if (buildDefinition.outputDirectory) {
      return normalize(buildDefinition.outputDirectory + sep);
    }
    return normalize(process.cwd() + sep);
  }

  private processProjectBlueprint(
    blueprint: ProjectBlueprint,
    variables: TemplateVariables
  ): ProjectBlueprint {
    return {
      items: this.processBlueprints(blueprint.items, variables),
    };
  }

  private processBlueprints(blueprints: Blueprint[], variables: TemplateVariables): Blueprint[] {
    return blueprints.map((blueprint) => {
      if (blueprint instanceof FileBlueprint) {
        return this.processFileBlueprint(blueprint, variables);
      } else if (blueprint instanceof DirectoryBlueprint) {
        return this.processDirectoryBlueprint(blueprint, variables);
      } else {
        throw new UnknownBlueprintTypeError((blueprint as any).constructor.name);
      }
    });
  }

  private processFileBlueprint(
    blueprint: FileBlueprint,
    variables: TemplateVariables
  ): FileBlueprint {
    try {
      const processedFileName = this.templateProcessor.process(blueprint.name, variables);
      const processedFileContent = this.templateProcessor.process(
        blueprint.content || "",
        variables
      );
      return new FileBlueprint(processedFileName, processedFileContent);
    } catch (e) {
      throw new BlueprintProcessingError(blueprint.name, "file", e);
    }
  }

  private processDirectoryBlueprint(
    blueprint: DirectoryBlueprint,
    variables: TemplateVariables
  ): DirectoryBlueprint {
    try {
      const processedDirectoryName = this.templateProcessor.process(blueprint.name, variables);
      return new DirectoryBlueprint(
        processedDirectoryName,
        this.processBlueprints(blueprint.children, variables)
      );
    } catch (e) {
      throw new BlueprintProcessingError(blueprint.name, "directory", e);
    }
  }

  private async buildBlueprintsAt(blueprints: Blueprint[], baseDirectory: string): Promise<void> {
    for (const blueprint of blueprints) {
      if (blueprint instanceof FileBlueprint) {
        await this.buildFile(blueprint, baseDirectory);
      } else {
        await this.buildDirectory(blueprint, baseDirectory);
      }
    }
  }

  private async buildFile(file: FileBlueprint, baseDirectory: string): Promise<void> {
    const finalFilePath = `${baseDirectory}${file.name}`;
    await this.fileWriter.writeFile(new File(finalFilePath, file.content || ""));
  }

  private async buildDirectory(
    directory: DirectoryBlueprint,
    baseDirectory: string
  ): Promise<void> {
    const finalDirectoryPath = `${baseDirectory}${directory.name}`;
    await this.fileWriter.createDirectory(new Directory(finalDirectoryPath));
    await this.buildBlueprintsAt(directory.children, finalDirectoryPath + sep);
  }
}

export interface BuildDefinition {
  blueprint: ProjectBlueprint;
  outputDirectory?: string;
  variables?: TemplateVariables;
}
