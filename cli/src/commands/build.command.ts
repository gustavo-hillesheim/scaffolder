import {
  BlueprintProcessingError,
  BlueprintService,
  ScaffoldingService,
} from "@gus_hill/scaffolding";

export class BuildCommand {
  constructor(
    private blueprintService: BlueprintService,
    private scaffoldingService: ScaffoldingService
  ) {}

  execute = async (blueprintName: string, variables: string[]) => {
    const variablesObj = this.createVariablesObj(variables);
    const blueprintExists = this.blueprintService.blueprintExists(blueprintName);
    if (!blueprintExists) {
      console.log(`The blueprint '${blueprintName}' does not exist.`);
    } else {
      await this.buildBlueprint(blueprintName, variablesObj);
    }
  };

  private createVariablesObj(variables: string[]): Record<string, string> {
    const variablesObj: Record<string, string> = {};
    variables.forEach((arg, index) => {
      if (index === 0) {
        return;
      }
      const lastArg = variables[index - 1];
      if (lastArg.startsWith("--") && !arg.startsWith("--")) {
        variablesObj[lastArg.substring(2)] = arg;
      }
    });
    return variablesObj;
  }

  private async buildBlueprint(
    blueprintName: string,
    variables: Record<string, string>
  ): Promise<void> {
    console.log(`Building blueprint "${blueprintName}"...`);
    const blueprint = await this.blueprintService.loadBlueprint(blueprintName);
    await this.scaffoldingService
      .build({
        blueprint,
        variables,
      })
      .then(() => console.log("Bluprint built successfully!"))
      .catch((error) => this.handleBuildError(blueprintName, error));
  }

  private handleBuildError(blueprintName: string, error: Error) {
    const messagePrefix = `Error while building blueprint '${blueprintName}': `;
    console.error(
      messagePrefix +
        (error instanceof BlueprintProcessingError ? error.shortMessage : error.message)
    );
  }
}
