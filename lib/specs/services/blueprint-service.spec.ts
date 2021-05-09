import {
  BlueprintService,
  Directory,
  DirectoryBlueprint,
  File,
  FileBlueprint,
  FileReader,
} from "../../src";

describe("BlueprintService", () => {
  let blueprintService: BlueprintService;
  let fileReader: FileReader;
  const rootDirectoryPath = "c:\\templates_root_directory";

  beforeEach(() => {
    fileReader = jasmine.createSpyObj("FileReader", ["readAll", "listAll"]);
    blueprintService = new BlueprintService(fileReader, rootDirectoryPath);
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
});
