import { execSync } from "child_process";
import { Command } from "commander";
import { BlueprintService } from "@gus_hill/scaffolding";

export class BuildCommand {
  constructor(private blueprintService: BlueprintService, private blueprintsRootDir: string) {}

  execute = async (blueprintName: string, options: BuildCommandOptions, command: Command) => {
    const blueprintExists = this.blueprintService.blueprintExists(blueprintName);
    if (!blueprintExists) {
      console.log(`The blueprint '${blueprintName}' does not exist.`);
    } else {
      const outputDirectory = options.output || process.cwd();
      await this.buildBlueprint({
        blueprintName,
        outputDirectory,
        commandArgs: command.args,
      }).catch(this.handleBuildError);
    }
  };

  private async buildBlueprint({
    blueprintName,
    commandArgs,
    outputDirectory,
  }: BuildBlueprintParams): Promise<void> {
    console.log(`Building blueprint "${blueprintName}"...`);
    const blueprintScriptPath = `${this.blueprintsRootDir}\\${blueprintName}\\script.js`;
    execSync(`node ${blueprintScriptPath} ${outputDirectory} ${commandArgs.slice(1).join(" ")}`, {
      stdio: "inherit",
    });
  }

  private handleBuildError(e: Error): void {
    if (e.message.startsWith("Command failed")) {
      return;
    }
    console.error(`An error occurred while trying to execute the bluprint script: ${e.message}`);
  }
}

type BuildBlueprintParams = {
  blueprintName: string;
  commandArgs: string[];
  outputDirectory: string;
};

type BuildCommandOptions = {
  output?: string;
};
