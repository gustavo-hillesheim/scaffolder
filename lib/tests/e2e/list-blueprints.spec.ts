import { sep } from "path";
import { BlueprintService, createBlueprintService } from "../../src";

describe("List Blueprints", () => {
  const BLUEPRINTS_DIRECTORY_PATH =
    __dirname + sep + "input" + sep + "list-blueprints" + sep + "blueprints";

  let blueprintService: BlueprintService;

  beforeEach(() => {
    blueprintService = createBlueprintService(BLUEPRINTS_DIRECTORY_PATH);
  });

  it("should list all blueprints available in the blueprint directory", async () => {
    const blueprints = await blueprintService.listBlueprints();
    expect(blueprints.length).toEqual(2);
    expect(blueprints).toContain("blueprint_1");
    expect(blueprints).toContain("blueprint_2");
  });
});
