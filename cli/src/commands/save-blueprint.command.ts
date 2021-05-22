import {
  BlueprintService,
  createBlueprint,
  Directory,
  DirectoryBlueprint,
  FileReader,
  FSItem,
  ProjectBlueprint,
} from "@gus_hill/scaffolding";
import { basename } from "path";

export class SaveBlueprintCommand {
  constructor(private fileReader: FileReader, private blueprintService: BlueprintService) {}

  execute = async (
    blueprintName: string,
    { targetDirectory, override }: CreateBlueprintOptions
  ) => {
    targetDirectory = targetDirectory || process.cwd();
    const directoryExists = await this.fileReader.exists(targetDirectory);
    if (!directoryExists) {
      console.log(`The directory '${targetDirectory}' does not exist`);
      return;
    }
    const blueprintExists = await this.blueprintService.blueprintExists(blueprintName);
    if (blueprintExists) {
      if (!override) {
        console.error(
          `Blueprint '${blueprintName}' already exists. Use the option '--override' to override an already existing blueprint.`
        );
        return;
      } else {
        console.log(`Blueprint '${blueprintName}' already exists, overriding it...`);
      }
    }
    const directoryItems = await this.readDirectoryBlueprint(targetDirectory);
    await this.saveBlueprint(
      blueprintName,
      {
        items: [
          new DirectoryBlueprint(basename(targetDirectory), directoryItems.map(createBlueprint)),
        ],
      },
      { override }
    ).catch(this.handleSaveError);
  };

  private handleSaveError(error: Error): void {
    console.error(`An error occurred while saving the blueprint: ${error.message}.`);
  }

  private async readDirectoryBlueprint(targetDirectory: string): Promise<FSItem[]> {
    console.log(`Reading files of directory ${targetDirectory}...`);
    const directoryBlueprint = await this.fileReader.readAll(targetDirectory, {
      recursive: true,
    });
    console.log(
      `Read a total of ${this.calculateTotalFiles(directoryBlueprint)} files/directories!`
    );
    return directoryBlueprint;
  }

  private calculateTotalFiles(files: FSItem[]): number {
    let total = 0;
    for (const file of files) {
      total++;
      if (file instanceof Directory && file.children) {
        total += this.calculateTotalFiles(file.children);
      }
    }
    return total;
  }

  private async saveBlueprint(
    blueprintName: string,
    blueprint: ProjectBlueprint,
    { override }: { override?: boolean }
  ): Promise<void> {
    console.log(`Saving blueprint ${blueprintName}...`);
    await this.blueprintService.saveBlueprint(blueprintName, blueprint, { override });
    console.log("Blueprint saved!");
  }
}

type CreateBlueprintOptions = {
  targetDirectory?: string;
  override?: boolean;
};
