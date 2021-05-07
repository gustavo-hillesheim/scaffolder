import {
  createBlueprint,
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
    expect(() => createBlueprint({} as FSItem)).toThrow(new Error(`Unknown file type ${{}}`));
  });
});
