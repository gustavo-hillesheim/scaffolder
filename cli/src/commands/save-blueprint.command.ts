import {
  Blueprint,
  BlueprintService,
  createBlueprint,
  Directory,
  DirectoryBlueprint,
  FileBlueprint,
  FileReader,
  FSItem,
} from "@gus_hill/scaffolding";
import { basename } from "path";

export class SaveBlueprintCommand {
  constructor(
    private fileReader: FileReader,
    private blueprintService: BlueprintService,
    private resourceRootDir: string
  ) {}

  execute = async (blueprintName: string, options: SaveBlueprintCommandOptions) => {
    let { targetDirectory, override } = options;
    targetDirectory = targetDirectory || process.cwd();
    const canExecute = await this.verifyCanExecute({ targetDirectory, override, blueprintName });
    if (canExecute) {
      const blueprintFiles = await this.getBlueprintFiles({
        targetDirectory,
        addWrapper: options.wrapper,
      });
      const blueprintScript = await this.createBlueprintScript(blueprintName);
      await this.saveBlueprint({
        blueprintName,
        override,
        files: blueprintFiles,
        blueprintScript,
      }).catch(this.handleSaveError);
    }
  };

  private async getBlueprintFiles({
    targetDirectory,
    addWrapper,
  }: {
    targetDirectory: string;
    addWrapper: boolean;
  }): Promise<Blueprint[]> {
    const directoryItems = await this.readDirectoryBlueprint(targetDirectory);
    const directoryItemsBlueprint = directoryItems.map(createBlueprint);
    return addWrapper
      ? [new DirectoryBlueprint(basename(targetDirectory), directoryItemsBlueprint)]
      : directoryItemsBlueprint;
  }

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

  private async createBlueprintScript(blueprintName: string): Promise<string> {
    const blueprintScriptTemplate = await this.fileReader.readFile(
      `${this.resourceRootDir}\\templates\\blueprintScript.js`
    );
    if (!blueprintScriptTemplate) {
      throw new Error("Could not find blueprint script template, check your resources folder");
    }
    return blueprintScriptTemplate.replace("{blueprintName}", blueprintName);
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
    files,
    override,
    blueprintScript,
  }: SaveBlueprintParams): Promise<void> {
    console.log(`Saving blueprint ${blueprintName}...`);
    await this.blueprintService.saveBlueprint(
      blueprintName,
      {
        items: [
          new DirectoryBlueprint("files", files),
          new FileBlueprint("script.js", blueprintScript),
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
  wrapper: boolean;
};

type SaveBlueprintParams = {
  blueprintName: string;
  files: Blueprint[];
  blueprintScript: string;
  override?: boolean;
};
