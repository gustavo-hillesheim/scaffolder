import { join, sep } from "path";
import { clearDir, expectDirAt, expectFileAt, expectNothingAt } from "../utils";
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
    clearBlueprintsDir();
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

    expectDirAt(pathToOutput("test-blueprint"));
    expectDirAt(pathToOutput("test-blueprint", "project"));
    expectDirAt(pathToOutput("test-blueprint", "project", "src"));
    expectFileAt(
      pathToOutput("test-blueprint", "project", "package.json"),
      '{ "name": "scaffolding" }'
    );
    expectFileAt(
      pathToOutput("test-blueprint", "project", "src", "index.js"),
      'console.log("Scaffolding Works!");'
    );
  });

  it("should throw error when trying to save a blueprint that already exists", async () => {
    await blueprintService.saveBlueprint("already-existing-blueprint", { items: [] });
    expectDirAt(pathToOutput("already-existing-blueprint"));

    await expectAsync(
      blueprintService.saveBlueprint("already-existing-blueprint", {
        items: [],
      })
    ).toBeRejected();
  });

  it("should override an existing blueprint", async () => {
    await blueprintService.saveBlueprint("already-existing-blueprint", {
      items: [new FileBlueprint("index.js", "console.log('I will be overwrote');")],
    });
    expectDirAt(pathToOutput("already-existing-blueprint"));
    expectFileAt(
      pathToOutput("already-existing-blueprint", "index.js"),
      "console.log('I will be overwrote');"
    );

    await blueprintService.saveBlueprint(
      "already-existing-blueprint",
      {
        items: [new FileBlueprint("package.json", '{ "name": "scaffolding" }')],
      },
      { override: true }
    );

    expectDirAt(pathToOutput("already-existing-blueprint"));
    expectFileAt(
      pathToOutput("already-existing-blueprint", "package.json"),
      '{ "name": "scaffolding" }'
    );
    expectNothingAt(pathToOutput("already-existing-blueprint", "index.js"));
  });

  function pathToOutput(...pathSegments: string[]): string {
    return join(BLUEPRINTS_DIRECTORY_PATH, ...pathSegments);
  }

  function clearBlueprintsDir(): void {
    clearDir(BLUEPRINTS_DIRECTORY_PATH);
  }
});
