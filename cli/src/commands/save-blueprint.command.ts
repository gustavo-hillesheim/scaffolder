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
    let targetDirectory = options.targetDirectory;
    const override = options.override;
    const variables = this.parseVariables(options.variables);
    targetDirectory = targetDirectory || process.cwd();
    const canExecute = await this.verifyCanExecute({ targetDirectory, override, blueprintName });
    if (canExecute) {
      const ignoreRegex = options.ignore ? this.parseIgnoreRegex(options.ignore) : undefined;
      const blueprintFiles = (
        await this.getBlueprintFiles({
          targetDirectory,
          ignoreRegex,
          addWrapper: options.wrapper,
        })
      ).map((blueprintFile) => this.insertVariables(blueprintFile, variables));
      const blueprintScript = await this.createBlueprintScript(blueprintName);
      await this.saveBlueprint({
        blueprintName,
        override,
        files: blueprintFiles,
        blueprintScript,
      }).catch(this.handleSaveError);
    }
  };

  private parseVariables(variables?: string[]): Record<string, string> {
    const variablesObj: Record<string, string> = {};
    variables
      ?.map((variable) => {
        if (!variable.startsWith("$") || !variable.includes("=")) {
          throw new Error(
            `Invalid variable definition "${variable}", example definition: $var=value-to-replace`
          );
        }
        return variable;
      })
      .map((variable) => {
        const segments = variable.split("=");
        const variableName = segments[0].substring(1);
        const valueToReplace = segments[1];
        return { variable, variableName, valueToReplace };
      })
      .forEach(({ variable, variableName, valueToReplace }) => {
        if (!variableName) {
          throw new Error(`A variable name was not specified at "${variable}"`);
        }
        if (!valueToReplace) {
          throw new Error(`A value to replace was not specified at "${variable}"`);
        }
        variablesObj[variableName] = valueToReplace;
      });
    return variablesObj;
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

  private parseIgnoreRegex(ignoreRegex: string): RegExp {
    if (!ignoreRegex.includes("/")) {
      return new RegExp(ignoreRegex);
    }
    const regexPartsRegex = /\/(.+)\/([gim]*)/;
    const matches = regexPartsRegex.exec(ignoreRegex);
    if (!matches) {
      throw new Error("Invalid ignore regex");
    }
    const regexStr = matches[1];
    const regexModifiers = matches[2];
    return new RegExp(regexStr, regexModifiers);
  }

  private async getBlueprintFiles({
    targetDirectory,
    addWrapper,
    ignoreRegex,
  }: {
    targetDirectory: string;
    addWrapper: boolean;
    ignoreRegex?: RegExp;
  }): Promise<Blueprint[]> {
    const directoryItems = await this.readDirectoryBlueprint(targetDirectory, ignoreRegex);
    const directoryItemsBlueprint = directoryItems.map(createBlueprint);
    return addWrapper
      ? [new DirectoryBlueprint(basename(targetDirectory), directoryItemsBlueprint)]
      : directoryItemsBlueprint;
  }

  private insertVariables(blueprintFile: Blueprint, variables: Record<string, string>): Blueprint {
    if (blueprintFile instanceof FileBlueprint) {
      return new FileBlueprint(
        this.insertVariablesInString(blueprintFile.name, variables),
        blueprintFile.content
          ? this.insertVariablesInString(blueprintFile.content, variables)
          : undefined
      );
    } else {
      return new DirectoryBlueprint(
        this.insertVariablesInString(blueprintFile.name, variables),
        blueprintFile.children?.map((child) => this.insertVariables(child, variables))
      );
    }
  }

  private insertVariablesInString(stringValue: string, variables: Record<string, string>): string {
    Object.keys(variables).forEach((variableName) => {
      const valueToReplace = variables[variableName];
      stringValue = stringValue.replace(new RegExp(valueToReplace, "g"), `$${variableName}`);
    });
    return stringValue;
  }

  private async readDirectoryBlueprint(
    targetDirectory: string,
    ignoreRegex?: RegExp
  ): Promise<FSItem[]> {
    console.log(`Reading files of directory ${targetDirectory}...`);
    const directoryBlueprint = await this.fileReader.readAll(targetDirectory, {
      recursive: true,
      ignore: ignoreRegex,
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
  ignore?: string;
  variables?: string[];
  wrapper: boolean;
};

type SaveBlueprintParams = {
  blueprintName: string;
  files: Blueprint[];
  blueprintScript: string;
  override?: boolean;
  ignore?: string;
};
