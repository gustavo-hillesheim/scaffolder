import { join } from "path";
import {
  BlueprintService,
  Directory,
  DirectoryBlueprint,
  File,
  FileBlueprint,
  FileReader,
  FileWriter,
} from "../../../src";

describe("BlueprintService", () => {
  let blueprintService: BlueprintService;
  let fileReader: jasmine.SpyObj<FileReader>;
  let fileWriter: jasmine.SpyObj<FileWriter>;
  const rootDirectoryPath = "c:\\templates_root_directory";

  beforeEach(() => {
    fileReader = jasmine.createSpyObj<FileReader>("FileReader", ["readAll", "listAll", "exists"]);
    fileWriter = jasmine.createSpyObj<FileWriter>("FileWriter", [
      "createDirectory",
      "writeFile",
      "delete",
    ]);
    blueprintService = new BlueprintService(fileReader, fileWriter, rootDirectoryPath);
  });

  describe("#loadBlueprints", () => {
    it("should load files items definition for given template", async () => {
      const templateFiles = [
        new File(`${rootDirectoryPath}\\package.json`),
        new Directory(`${rootDirectoryPath}\\src`, [
          new File(`${rootDirectoryPath}\\index.js`, "console.log('Hello World!');"),
        ]),
      ];
      fileReader.readAll.and.returnValue(Promise.resolve(templateFiles));
      fileReader.exists.and.returnValue(Promise.resolve(true));

      const templateName = "test-template";
      const template = await blueprintService.loadBlueprint(templateName);

      expect(fileReader.readAll).toHaveBeenCalledWith(`${rootDirectoryPath}\\${templateName}`, {
        recursive: true,
      });
      expect(template).toEqual({
        items: [
          new FileBlueprint("package.json"),
          new DirectoryBlueprint("src", [
            new FileBlueprint("index.js", "console.log('Hello World!');"),
          ]),
        ],
      });
    });
  });

  describe("#listBlueprints", () => {
    it("should list all templates available", async () => {
      fileReader.listAll.and.returnValue(
        Promise.resolve([
          new Directory("C:\\template-one"),
          new Directory("C:\\template-two"),
          new Directory("C:\\template-three"),
        ])
      );

      const availableTemplates = await blueprintService.listBlueprints();

      expect(fileReader.listAll).toHaveBeenCalledWith(rootDirectoryPath, {
        recursive: false,
      });
      expect(availableTemplates).toEqual(["template-one", "template-two", "template-three"]);
    });
  });

  describe("#saveBlueprints", () => {
    it("should save blueprint", async () => {
      await blueprintService.saveBlueprint("test-blueprint", {
        items: [
          new FileBlueprint("package.json", '{ "name": "test" }'),
          new DirectoryBlueprint("src", [
            new FileBlueprint("index.js", 'console.log("Hello World!");'),
          ]),
        ],
      });

      expect(fileWriter.createDirectory).toHaveBeenCalledWith(
        new Directory(join(rootDirectoryPath, "test-blueprint"), [
          new File(join(rootDirectoryPath, "test-blueprint", "package.json"), '{ "name": "test" }'),
          new Directory(join(rootDirectoryPath, "test-blueprint", "src"), [
            new File(
              join(rootDirectoryPath, "test-blueprint", "src", "index.js"),
              'console.log("Hello World!");'
            ),
          ]),
        ])
      );
    });

    it("should throw error if the blueprint already exists", async () => {
      fileReader.exists.and.returnValue(Promise.resolve(true));

      const savePromise = blueprintService.saveBlueprint("test-blueprint", {
        items: [new FileBlueprint("index.js", "console.log('Hello World!');")],
      });

      await expectAsync(savePromise).toBeRejected("Blueprint 'test-blueprint' already exists");
      expect(fileReader.exists).toHaveBeenCalledOnceWith(join(rootDirectoryPath, "test-blueprint"));
    });

    it("should not throw error if the blueprint already exists and the override option is true", async () => {
      fileReader.exists.and.returnValue(Promise.resolve(true));

      const savePromise = blueprintService.saveBlueprint(
        "test-blueprint",
        {
          items: [new FileBlueprint("index.js", "console.log('Hello World!');")],
        },
        {
          override: true,
        }
      );

      await expectAsync(savePromise).toBeResolved();
      expect(fileReader.exists).toHaveBeenCalledOnceWith(join(rootDirectoryPath, "test-blueprint"));
    });
  });

  describe("#blueprintExists", () => {
    it("should return that the given blueprint exists", async () => {
      fileReader.exists.and.returnValue(Promise.resolve(true));

      const blueprintExists = await blueprintService.blueprintExists("existing_blueprint");

      expect(blueprintExists).toBeTrue();
      expect(fileReader.exists).toHaveBeenCalledWith(join(rootDirectoryPath, "existing_blueprint"));
    });

    it("should return that the given blueprint does not exists", async () => {
      fileReader.exists.and.returnValue(Promise.resolve(false));

      const blueprintExists = await blueprintService.blueprintExists("non_existing_blueprint");

      expect(blueprintExists).toBeFalse();
      expect(fileReader.exists).toHaveBeenCalledWith(
        join(rootDirectoryPath, "non_existing_blueprint")
      );
    });
  });

  describe("#deleteBlueprint", () => {
    it("should delete an existing blueprint", async () => {
      fileReader.exists.and.returnValue(Promise.resolve(true));
      await blueprintService.deleteBlueprint("existing_blueprint");
      expect(fileWriter.delete).toHaveBeenCalledWith(join(rootDirectoryPath, "existing_blueprint"));
    });

    it("should throw error when deleting a non existing blueprint", async () => {
      fileReader.exists.and.returnValue(Promise.resolve(false));
      await expectAsync(blueprintService.deleteBlueprint("non_existing_blueprint")).toBeRejected();
    });
  });
});
