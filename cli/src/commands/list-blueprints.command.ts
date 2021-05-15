import { BlueprintService } from "@gus_hill/scaffolding";

export class ListBlueprintsCommand {
  constructor(private blueprintService: BlueprintService) {}

  execute = async () => {
    const blueprints = await this.blueprintService.listBlueprints();
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
  };
}
