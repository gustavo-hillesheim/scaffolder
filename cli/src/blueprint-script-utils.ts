import {
  BlueprintProcessingError,
  BlueprintService,
  DirectoryBlueprint,
  ScaffoldingService,
} from "@gus_hill/scaffolding";
import { diContainer } from "./di";

export function parseVariables(variables: string[]): Record<string, string> {
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

export async function buildBlueprint({
  blueprintName,
  outputDirectory,
  variables,
}: BuildBlueprintParams) {
  const blueprintService = diContainer.get(BlueprintService);
  const blueprint = await blueprintService.loadBlueprint(blueprintName);
  const files = (blueprint.items.find((item) => item.name === "files") as DirectoryBlueprint)
    .children;

  const scaffoldingService = diContainer.get(ScaffoldingService);
  await scaffoldingService
    .build({
      blueprint: {
        items: files,
      },
      outputDirectory,
      variables,
    })
    .catch((e) => {
      const errorMessage = e instanceof BlueprintProcessingError ? e.shortMessage : e.message;
      return Promise.reject(new Error(errorMessage));
    });
}

type BuildBlueprintParams = {
  blueprintName: string;
  outputDirectory: string;
  variables?: Record<string, string>;
};
