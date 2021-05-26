import { execSync } from "child_process";
import { Command } from "commander";
import { BlueprintService } from "@gus_hill/scaffolding";

export class BuildCommand {
  constructor(private blueprintService: BlueprintService, private blueprintsRootDir: string) {}

  execute = async (blueprintName: string, _: Record<string, string>, command: Command) => {
    const blueprintExists = this.blueprintService.blueprintExists(blueprintName);
    if (!blueprintExists) {
      console.log(`The blueprint '${blueprintName}' does not exist.`);
    } else {
      await this.buildBlueprint(blueprintName, command.args).catch(this.handleBuildError);
    }
  };

  private async buildBlueprint(blueprintName: string, commandArgs: string[]): Promise<void> {
    console.log(`Building blueprint "${blueprintName}"...`);
    const targetDirectory = process.cwd();
    const blueprintScriptPath = `${this.blueprintsRootDir}\\${blueprintName}\\script.js`;
    execSync(`node ${blueprintScriptPath} ${targetDirectory} ${commandArgs.join(" ")}`, {
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
