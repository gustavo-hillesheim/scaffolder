import { join, sep } from "path";
import { clearDir, expectDirAt, expectFileAt } from "../utils";
import {
  BlueprintService,
  createBlueprintService,
  DirectoryBlueprint,
  FileBlueprint,
} from "../../src";

describe("Save Blueprint", () => {
  const BLUEPRINTS_DIRECTORY_PATH = __dirname + sep + "output";

  let blueprintService: BlueprintService;

  beforeEach(() => {
    blueprintService = createBlueprintService(BLUEPRINTS_DIRECTORY_PATH);
  });

  afterEach(() => {
    clearResourcesDir();
  });

  it("should save the given blueprint inside the output folder", async () => {
    await blueprintService.saveBlueprint("test-blueprint", {
      items: [
        new DirectoryBlueprint("project", [
          new FileBlueprint("package.json", '{ "name": "scaffolding" }'),
          new DirectoryBlueprint("src", [
            new FileBlueprint("index.js", 'console.log("Scaffolding Works!");'),
          ]),
        ]),
      ],
    });

    expectDirAt(pathToResource("test-blueprint"));
    expectDirAt(pathToResource("test-blueprint", "project"));
    expectDirAt(pathToResource("test-blueprint", "project", "src"));
    expectFileAt(
      pathToResource("test-blueprint", "project", "package.json"),
      '{ "name": "scaffolding" }'
    );
    expectFileAt(
      pathToResource("test-blueprint", "project", "src", "index.js"),
      'console.log("Scaffolding Works!");'
    );
  });

  function pathToResource(...pathSegments: string[]): string {
    return join(BLUEPRINTS_DIRECTORY_PATH, ...pathSegments);
  }

  function clearResourcesDir(): void {
    clearDir(BLUEPRINTS_DIRECTORY_PATH);
  }
});
