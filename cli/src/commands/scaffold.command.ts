import { BlueprintService, ScaffoldingService } from "@gus_hill/scaffolding";

export class ScaffoldCommand {
  constructor(
    private blueprintService: BlueprintService,
    private scaffoldingService: ScaffoldingService
  ) {}

  execute = async (blueprintName?: string) => {
    if (!blueprintName) {
      await this.listAvailableBlueprints();
    } else {
      await this.buildBlueprint(blueprintName);
    }
  };

  private async listAvailableBlueprints(): Promise<void> {
    const blueprints = await this.blueprintService.listBlueprints();
    console.log("No blueprint was informed.");
    if (blueprints.length === 0) {
      console.log(
        "There is no blueprint available. Use 'blueprint create' in a directory to create a blueprint of it."
      );
    } else {
      console.log("Available blueprints:");
      blueprints.forEach((blueprint) => {
        console.log(`- ${blueprint}`);
      });
    }
  }

  private async buildBlueprint(blueprintName: string): Promise<void> {
    console.log(`Building blueprint "${blueprintName}"`);
    const blueprint = await this.blueprintService.loadBlueprint(blueprintName);
    await this.scaffoldingService.build({
      blueprint,
    });
  }
}
