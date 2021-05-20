import { join, sep } from "path";
import {
  BlueprintService,
  createBlueprintService,
  DirectoryBlueprint,
  FileBlueprint,
} from "../../src";
import { clearDir, expectDirAt, expectFileAt, expectNothingAt } from "../utils";

describe("Delete Blueprint", () => {
  const OUTPUT_DIRECTORY_PATH = __dirname + sep + "output";

  let blueprintService: BlueprintService;

  beforeEach(() => {
    blueprintService = createBlueprintService(OUTPUT_DIRECTORY_PATH);
  });

  afterEach(() => {
    clearOutputDir();
  });

  it("should delete the specified Blueprint", async () => {
    await blueprintService.saveBlueprint("blueprint_to_delete", {
      items: [
        new DirectoryBlueprint("dir", [
          new FileBlueprint("file"),
          new DirectoryBlueprint("dir_2", [new FileBlueprint("file_2")]),
        ]),
      ],
    });
    expectDirAt(pathToOutput("blueprint_to_delete"));
    expectDirAt(pathToOutput("blueprint_to_delete", "dir"));
    expectDirAt(pathToOutput("blueprint_to_delete", "dir", "dir_2"));
    expectFileAt(pathToOutput("blueprint_to_delete", "dir", "file"), "");
    expectFileAt(pathToOutput("blueprint_to_delete", "dir", "dir_2", "file_2"), "");

    await blueprintService.deleteBlueprint("blueprint_to_delete");
    expectNothingAt(pathToOutput("blueprint_to_delete"));
  });

  it("should throw error on deleting a non existing blueprint", async () => {
    await expectAsync(blueprintService.deleteBlueprint("non_existing_blueprint")).toBeRejected();
  });

  function pathToOutput(...pathSegments: string[]): string {
    return join(OUTPUT_DIRECTORY_PATH, ...pathSegments);
  }

  function clearOutputDir(): void {
    clearDir(OUTPUT_DIRECTORY_PATH);
  }
});
