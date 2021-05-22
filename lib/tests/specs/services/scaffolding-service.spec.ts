import {
  ScaffoldingService,
  FileWriter,
  File,
  FileBlueprint,
  Directory,
  DirectoryBlueprint,
  Blueprint,
  TemplateProcessor,
} from "../../../src";

describe("ScaffoldingService", () => {
  let scaffolderService: ScaffoldingService;
  let templateProcessor: TemplateProcessor;
  let processSpy: jasmine.Spy<TemplateProcessor["process"]>;
  let fileWriter: jasmine.SpyObj<FileWriter>;

  beforeEach(() => {
    fileWriter = jasmine.createSpyObj<FileWriter>("FileWriter", ["writeFile", "createDirectory"]);
    templateProcessor = new TemplateProcessor();
    processSpy = spyOn(templateProcessor, "process").and.callThrough();
    scaffolderService = new ScaffoldingService(fileWriter, templateProcessor);
  });

  it("should create file with no content", async () => {
    await scaffolderService.build({
      blueprint: {
        items: [new FileBlueprint("empty")],
      },
    });

    expect(fileWriter.writeFile).toHaveBeenCalledWith(new File(`${process.cwd()}\\empty`, ""));
    expect(processSpy).toHaveBeenCalledWith("empty", {});
  });

  it("should create simple file", async () => {
    await scaffolderService.build({
      blueprint: {
        items: [new FileBlueprint("test.js", 'console.log("Hello World!");')],
      },
    });

    expect(fileWriter.writeFile).toHaveBeenCalledWith(
      new File(`${process.cwd()}\\test.js`, 'console.log("Hello World!");')
    );
    expect(processSpy).toHaveBeenCalledWith("test.js", {});
    expect(processSpy).toHaveBeenCalledWith('console.log("Hello World!");', {});
  });

  it("should create file in specified directory", async () => {
    await scaffolderService.build({
      blueprint: {
        items: [new FileBlueprint("test.cmd", 'echo "Hello World"')],
      },
      outputDirectory: "c:\\output\\",
    });

    expect(fileWriter.writeFile).toHaveBeenCalledWith(
      new File("c:\\output\\test.cmd", 'echo "Hello World"')
    );
    expect(processSpy).toHaveBeenCalledWith("test.cmd", {});
    expect(processSpy).toHaveBeenCalledWith('echo "Hello World"', {});
  });

  it("should create folder in specified directory", async () => {
    await scaffolderService.build({
      blueprint: {
        items: [new DirectoryBlueprint("src")],
      },
      outputDirectory: "C:\\base_dir",
    });

    expect(fileWriter.createDirectory).toHaveBeenCalledWith(new Directory(`C:\\base_dir\\src`));
    expect(processSpy).toHaveBeenCalledWith("src", {});
  });

  it("should create folder", async () => {
    await scaffolderService.build({
      blueprint: {
        items: [new DirectoryBlueprint("src")],
      },
    });

    expect(fileWriter.createDirectory).toHaveBeenCalledWith(new Directory(`${process.cwd()}\\src`));
    expect(processSpy).toHaveBeenCalledWith("src", {});
  });

  it("should create folder with nested folders/files", async () => {
    await scaffolderService.build({
      blueprint: {
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
      variables: {
        testVar: "I'm not used",
      },
    });

    expect(fileWriter.createDirectory).toHaveBeenCalledWith(
      new Directory(`${process.cwd()}\\scaffolderService`)
    );
    expect(fileWriter.createDirectory).toHaveBeenCalledWith(
      new Directory(`${process.cwd()}\\scaffolderService\\src`)
    );
    expect(fileWriter.writeFile).toHaveBeenCalledWith(
      new File(`${process.cwd()}\\scaffolderService\\src\\index.js`, 'console.log("Hello World!");')
    );
    expect(fileWriter.writeFile).toHaveBeenCalledWith(
      new File(
        `${process.cwd()}\\scaffolderService\\package.json`,
        '{ "name": "scaffolderService", "version": "0.0.1", "main": "src/index.js" }'
      )
    );
    expect(processSpy).toHaveBeenCalledWith("scaffolderService", { testVar: "I'm not used" });
    expect(processSpy).toHaveBeenCalledWith("src", { testVar: "I'm not used" });
    expect(processSpy).toHaveBeenCalledWith("index.js", { testVar: "I'm not used" });
    expect(processSpy).toHaveBeenCalledWith('console.log("Hello World!");', {
      testVar: "I'm not used",
    });
    expect(processSpy).toHaveBeenCalledWith("package.json", { testVar: "I'm not used" });
    expect(processSpy).toHaveBeenCalledWith(
      '{ "name": "scaffolderService", "version": "0.0.1", "main": "src/index.js" }',
      { testVar: "I'm not used" }
    );
  });

  it("should throw error on unknown file type", async () => {
    const runScaffold = () =>
      scaffolderService.build({
        blueprint: {
          items: [{} as Blueprint],
        },
      });

    await expectAsync(runScaffold()).toBeRejectedWith(new Error("Unknown blueprint type: Object"));
  });

  it("should throw error and not write any file when a variable was not defined", async () => {
    const buildPromise = scaffolderService.build({
      blueprint: {
        items: [
          new DirectoryBlueprint("src", [
            new FileBlueprint("index.js", "console.log('Hello $person');"),
          ]),
        ],
      },
    });

    await expectAsync(buildPromise).toBeRejectedWithError(
      "Error while processing directory blueprint 'src': Error while processing file blueprint 'index.js': Variable 'person' was not defined"
    );

    expect(fileWriter.createDirectory).not.toHaveBeenCalled();
    expect(fileWriter.writeFile).not.toHaveBeenCalled();
    expect(processSpy).toHaveBeenCalledWith("src", {});
    expect(processSpy).toHaveBeenCalledWith("index.js", {});
    expect(processSpy).toHaveBeenCalledWith("console.log('Hello $person');", {});
  });
});
