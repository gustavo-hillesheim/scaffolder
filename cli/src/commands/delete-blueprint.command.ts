import { BlueprintService } from "@gus_hill/scaffolding";

export class DeleteBlueprintCommand {
  constructor(private blueprintService: BlueprintService) {}

  execute = async (blueprintName: string) => {
    const blueprintExists = await this.blueprintService.blueprintExists(blueprintName);
    if (!blueprintExists) {
      console.log(`The blueprint '${blueprintName}' does not exist.`);
    } else {
      await this.blueprintService.deleteBlueprint(blueprintName);
      console.log(`Deleted blueprint '${blueprintName}'!`);
    }
  };
}
