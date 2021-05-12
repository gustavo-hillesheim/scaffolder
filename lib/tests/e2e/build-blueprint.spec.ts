import { join, sep } from "path";
import {
  BlueprintService,
  createBlueprintService,
  createScaffoldingService,
  ScaffoldingService,
} from "../../src";
import { clearDir, expectDirAt, expectFileAt } from "../utils";

describe("Build Blueprint", () => {
  const BLUEPRINTS_DIRECTORY_PATH = __dirname + sep + "input" + sep + "blueprints";
  const OUTPUT_DIRECTORY_PATH = __dirname + sep + "output";

  let blueprintService: BlueprintService;
  let scaffoldingService: ScaffoldingService;

  beforeEach(() => {
    blueprintService = createBlueprintService(BLUEPRINTS_DIRECTORY_PATH);
    scaffoldingService = createScaffoldingService();
  });

  afterEach(() => {
    clearOutputDir();
  });

  it("should create a folder structure based off of a blueprint", async () => {
    const blueprint = await blueprintService.loadBlueprint("sample_project");
    await scaffoldingService.build({
      blueprint,
      outputDirectory: OUTPUT_DIRECTORY_PATH,
    });

    expectDirAt(pathToOutput("sample_project"));
    expectDirAt(pathToOutput("sample_project", "lib"));
    expectFileAt(pathToOutput("sample_project", "pubspec.yaml"), "name: sample_project\r\n");
    expectFileAt(
      pathToOutput("sample_project", "lib", "main.dart"),
      "void main(List<String> args) {\r\n  print('Hello Dart!');\r\n}\r\n"
    );
  });

  function pathToOutput(...pathSegments: string[]): string {
    return join(OUTPUT_DIRECTORY_PATH, ...pathSegments);
  }

  function clearOutputDir(): void {
    clearDir(OUTPUT_DIRECTORY_PATH);
  }
});
