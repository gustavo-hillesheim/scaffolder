import {
  BlueprintService,
  createBlueprint,
  Directory,
  DirectoryBlueprint,
  FileReader,
  FSItem,
} from "@gus_hill/scaffolding";
import { basename } from "path";

export class SaveBlueprintCommand {
  constructor(private fileReader: FileReader, private blueprintService: BlueprintService) {}

  execute = async (blueprintName: string, options: SaveBlueprintCommandOptions) => {
    let { targetDirectory, override } = options;
    targetDirectory = targetDirectory || process.cwd();
    const canExecute = await this.verifyCanExecute({ targetDirectory, override, blueprintName });
    if (canExecute) {
      const directoryItems = await this.readDirectoryBlueprint(targetDirectory);
      await this.saveBlueprint({ blueprintName, targetDirectory, override, directoryItems }).catch(
        this.handleSaveError
      );
    }
  };

  private async verifyCanExecute({
    targetDirectory,
    override,
    blueprintName,
  }: VerifyCanExecuteParams): Promise<boolean> {
    const directoryExists = await this.fileReader.exists(targetDirectory);
    if (!directoryExists) {
      console.log(`The directory '${targetDirectory}' does not exist.`);
      return false;
    }
    const blueprintExists = await this.blueprintService.blueprintExists(blueprintName);
    if (blueprintExists) {
      if (!override) {
        console.error(
          `Blueprint '${blueprintName}' already exists. Use the option '--override' to override an already existing blueprint.`
        );
        return false;
      } else {
        console.log(`Blueprint '${blueprintName}' already exists, overriding it...`);
      }
    }
    return true;
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

  private async saveBlueprint({
    blueprintName,
    directoryItems,
    override,
    targetDirectory,
  }: SaveBlueprintParams): Promise<void> {
    console.log(`Saving blueprint ${blueprintName}...`);
    await this.blueprintService.saveBlueprint(
      blueprintName,
      {
        items: [
          new DirectoryBlueprint(basename(targetDirectory), directoryItems.map(createBlueprint)),
        ],
      },
      { override }
    );
    console.log("Blueprint saved!");
  }

  private handleSaveError(error: Error): void {
    console.error(`An error occurred while saving the blueprint: ${error.message}.`);
  }
}

type VerifyCanExecuteParams = {
  targetDirectory: string;
  override?: boolean;
  blueprintName: string;
};

type SaveBlueprintCommandOptions = {
  targetDirectory?: string;
  override?: boolean;
};

type SaveBlueprintParams = {
  blueprintName: string;
  targetDirectory: string;
  directoryItems: FSItem[];
  override?: boolean;
};
