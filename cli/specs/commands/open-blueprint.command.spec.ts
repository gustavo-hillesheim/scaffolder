import { sep, normalize } from "path";
import { OpenBlueprintCommand } from "../../src/commands/open-blueprint.command";

describe("OpenBlueprintCommand", () => {
  let command: OpenBlueprintCommand;
  let openFileExplorerSpy: jasmine.Spy<
    (blueprintName: string, callback: (err?: Error) => void) => void
  >;
  const BLUEPRINTS_ROOT_DIR = "C:\\blueprints";

  beforeEach(() => {
    openFileExplorerSpy = jasmine.createSpy("OpenFileExplorer");
    command = new OpenBlueprintCommand(openFileExplorerSpy, BLUEPRINTS_ROOT_DIR);
  });

  it("should open blueprint in file explorer", async () => {
    openFileExplorerSpy.and.callFake((_, callback) => callback());
    await command.execute("test_blueprint");

    expect(openFileExplorerSpy).toHaveBeenCalledWith(
      normalize(`${BLUEPRINTS_ROOT_DIR}${sep}test_blueprint`),
      jasmine.anything()
    );
  });

  it("should reject promise when openFileExplorer fails", async () => {
    openFileExplorerSpy.and.callFake((_, callback) => callback(new Error("fake error")));

    await expectAsync(command.execute("test_blueprint")).toBeRejectedWithError("fake error");
  });
});
