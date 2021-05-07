import {
  ScaffolderService,
  FileWriter,
  File,
  FileBlueprint,
  Directory,
  DirectoryBlueprint,
  Blueprint,
} from "../../src";

describe("ScaffolderService", () => {
  let scaffolderService: ScaffolderService;
  let fileWriter: FileWriter;

  beforeEach(() => {
    fileWriter = jasmine.createSpyObj("FileWriter", ["createFile", "createDirectory"]);
    scaffolderService = new ScaffolderService(fileWriter);
  });

  it("should create simple file", async () => {
    await scaffolderService.build({
      projectBlueprint: {
        items: [new FileBlueprint("test.js", 'console.log("Hello World!");')],
      },
    });

    expect(fileWriter.createFile).toHaveBeenCalledWith(
      new File(`${process.cwd()}\\test.js`, 'console.log("Hello World!");')
    );
  });

  it("should create file in specified directory", async () => {
    await scaffolderService.build({
      projectBlueprint: {
        items: [new FileBlueprint("test.cmd", 'echo "Hello World"')],
      },
      baseDirectory: "c:\\output\\",
    });

    expect(fileWriter.createFile).toHaveBeenCalledWith(
      new File("c:\\output\\test.cmd", 'echo "Hello World"')
    );
  });

  it("should create folder in specified directory", async () => {
    await scaffolderService.build({
      projectBlueprint: {
        items: [new DirectoryBlueprint("src")],
      },
      baseDirectory: "C:\\base_dir",
    });

    expect(fileWriter.createDirectory).toHaveBeenCalledWith(new Directory(`C:\\base_dir\\src`));
  });

  it("should create folder", async () => {
    await scaffolderService.build({
      projectBlueprint: {
        items: [new DirectoryBlueprint("src")],
      },
    });

    expect(fileWriter.createDirectory).toHaveBeenCalledWith(new Directory(`${process.cwd()}\\src`));
  });

  it("should create folder with nested folders/files", async () => {
    await scaffolderService.build({
      projectBlueprint: {
        items: [
          new DirectoryBlueprint("scaffolderService", [
            new DirectoryBlueprint("src", [
              new FileBlueprint("index.js", 'console.log("Hello World!");'),
            ]),
            new FileBlueprint(
              "package.json",
              '{ "name": "scaffolderService", "version": "0.0.1", "main": "src/index.js" }'
            ),
          ]),
        ],
      },
    });

    expect(fileWriter.createDirectory).toHaveBeenCalledWith(
      new Directory(`${process.cwd()}\\scaffolderService`)
    );
    expect(fileWriter.createDirectory).toHaveBeenCalledWith(
      new Directory(`${process.cwd()}\\scaffolderService\\src`)
    );
    expect(fileWriter.createFile).toHaveBeenCalledWith(
      new File(`${process.cwd()}\\scaffolderService\\src\\index.js`, 'console.log("Hello World!");')
    );
    expect(fileWriter.createFile).toHaveBeenCalledWith(
      new File(
        `${process.cwd()}\\scaffolderService\\package.json`,
        '{ "name": "scaffolderService", "version": "0.0.1", "main": "src/index.js" }'
      )
    );
  });

  it("should throw error on unknown file type", async () => {
    const runScaffold = () =>
      scaffolderService.build({
        projectBlueprint: {
          items: [{} as Blueprint],
        },
      });

    await expectAsync(runScaffold()).toBeRejectedWith(new Error("Unknown file type"));
  });
});
