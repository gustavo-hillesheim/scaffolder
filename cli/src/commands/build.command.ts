import { BlueprintService } from "@gus_hill/scaffolding";
import { execSync } from "child_process";

export class BuildCommand {
  constructor(private blueprintService: BlueprintService, private blueprintsRootDir: string) {}

  execute = async (blueprintName?: string) => {
    if (!blueprintName) {
      await this.listAvailableBlueprints();
    } else {
      const blueprintExists = this.blueprintService.blueprintExists(blueprintName);
      if (!blueprintExists) {
        console.log(`The blueprint '${blueprintName}' does not exist.`);
      } else {
        await this.buildBlueprint(blueprintName);
      }
    }
  };

  private async listAvailableBlueprints(): Promise<void> {
    const blueprints = await this.blueprintService.listBlueprints();
    console.log("No blueprint was informed.");
    if (blueprints.length === 0) {
      console.log(
        "There is no blueprint available. Use the command 'create blueprint' in a directory to create a blueprint of it."
      );
    } else {
      console.log("Available blueprints:");
      blueprints.forEach((blueprint) => {
        console.log(`- ${blueprint}`);
      });
    }
  }

  private async buildBlueprint(blueprintName: string): Promise<void> {
    console.log(`Building blueprint "${blueprintName}"...`);
    const targetDirectory = process.cwd();
    const blueprintScriptPath = `${this.blueprintsRootDir}\\${blueprintName}\\script.js`;
    execSync(`node ${blueprintScriptPath} ${targetDirectory}`, {
      stdio: "inherit",
    });
  }
}
