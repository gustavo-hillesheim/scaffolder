import {
  Blueprint,
  createBlueprint,
  createFsItem,
  Directory,
  DirectoryBlueprint,
  File,
  FileBlueprint,
  FSItem,
} from "../src";

describe("utils", () => {
  it("should create blueprint of a file with content", () => {
    const file = new File("c:\\file.txt", "conteúdo");
    expect(createBlueprint(file)).toEqual(new FileBlueprint("file.txt", "conteúdo"));
  });

  it("should create blueprint of a file without content", () => {
    const file = new File("c:\\data.empty");
    expect(createBlueprint(file)).toEqual(new FileBlueprint("data.empty"));
  });

  it("should create blueprint of an empty directory", () => {
    const directory = new Directory("c:\\test_directory");
    expect(createBlueprint(directory)).toEqual(new DirectoryBlueprint("test_directory"));
  });

  it("should create blueprint of a directory with files", () => {
    const directory = new Directory("c:\\test_directory", [
      new File("c:\\test_directory\\content.txt", "blueprint"),
      new File("c:\\test_directory\\file", "content of the file"),
    ]);
    expect(createBlueprint(directory)).toEqual(
      new DirectoryBlueprint("test_directory", [
        new FileBlueprint("content.txt", "blueprint"),
        new FileBlueprint("file", "content of the file"),
      ])
    );
  });

  it("should create blueprint of directory with sub-directories", () => {
    const directory = new Directory("c:\\root", [
      new Directory("c:\\root\\src", [
        new File("c:\\root\\src\\index.js", "console.log('Hello World!');"),
      ]),
      new File("c:\\root\\src\\package.json", "{ 'name': 'scaffolding' }"),
    ]);
    expect(createBlueprint(directory)).toEqual(
      new DirectoryBlueprint("root", [
        new DirectoryBlueprint("src", [
          new FileBlueprint("index.js", "console.log('Hello World!');"),
        ]),
        new FileBlueprint("package.json", "{ 'name': 'scaffolding' }"),
      ])
    );
  });

  it("should throw error when trying to create blueprint of unknown file type", () => {
    expect(() => createBlueprint({} as FSItem)).toThrow(new Error(`Unknown file type: Object`));
  });

  it("should create Directory from DirectoryBlueprint", () => {
    const directory = createFsItem(new DirectoryBlueprint("project"), {
      basePath: "C:\\root",
    });
    expect(directory).toEqual(new Directory("C:\\root\\project"));
  });

  it("should create Directory from DirectoryBlueprint with children", () => {
    const directory = createFsItem(
      new DirectoryBlueprint("sample_project", [
        new FileBlueprint(
          "index.js",
          "const { message } = require('./src/utils.js');\nconsole.log(message);"
        ),
        new DirectoryBlueprint("src", [
          new FileBlueprint("utils.js", "export const message = 'Hello';"),
        ]),
        new DirectoryBlueprint("specs"),
      ]),
      {
        basePath: "D:\\users\\",
      }
    );

    expect(directory).toEqual(
      new Directory("D:\\users\\sample_project", [
        new File(
          "D:\\users\\sample_project\\index.js",
          "const { message } = require('./src/utils.js');\nconsole.log(message);"
        ),
        new Directory("D:\\users\\sample_project\\src", [
          new File("D:\\users\\sample_project\\src\\utils.js", "export const message = 'Hello';"),
        ]),
        new Directory("D:\\users\\sample_project\\specs"),
      ])
    );
  });

  it("should create File from FileBlueprint", () => {
    const file = createFsItem(new FileBlueprint("test.txt", "content"), {
      basePath: "C:\\base",
    });
    expect(file).toEqual(new File("C:\\base\\test.txt", "content"));
  });

  it("should throw Error on unknown blueprint type", () => {
    expect(() => createFsItem({} as Blueprint, { basePath: "" })).toThrow(
      new Error(`Unknown blueprint type: Object`)
    );
  });
});
