import { join } from "path";
import {
  BlueprintService,
  Directory,
  DirectoryBlueprint,
  File,
  FileBlueprint,
  FileReader,
  FileWriter,
  ProjectBlueprint,
} from "../../../src";

describe("BlueprintService", () => {
  let blueprintService: BlueprintService;
  let fileReader: FileReader;
  let fileWriter: FileWriter;
  const rootDirectoryPath = "c:\\templates_root_directory";

  beforeEach(() => {
    fileReader = jasmine.createSpyObj<FileReader>("FileReader", ["readAll", "listAll"]);
    fileWriter = jasmine.createSpyObj<FileWriter>("FileWriter", ["createDirectory", "writeFile"]);
    blueprintService = new BlueprintService(fileReader, fileWriter, rootDirectoryPath);
  });

  it("should load files items definition for given template", async () => {
    const templateFiles = [
      new File(`${rootDirectoryPath}\\package.json`),
      new Directory(`${rootDirectoryPath}\\src`, [
        new File(`${rootDirectoryPath}\\index.js`, "console.log('Hello World!');"),
      ]),
    ];
    (fileReader as jasmine.SpyObj<FileReader>).readAll.and.returnValue(
      Promise.resolve(templateFiles)
    );

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

  it("should list all templates available", async () => {
    (fileReader as jasmine.SpyObj<FileReader>).listAll.and.returnValue(
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

  it("should save blueprint", async () => {
    await blueprintService.saveBlueprint("test-blueprint", {
      items: [
        new FileBlueprint("package.json", '{ "name": "test" }'),
        new DirectoryBlueprint("src", [
          new FileBlueprint("index.js", 'console.log("Hello World!");'),
        ]),
      ],
    } as ProjectBlueprint);

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
});
