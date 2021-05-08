import { Directory, File, FileReader, FSItem } from "../../src";

describe("FileReader", () => {
  let fileReader: FileReader;
  let listFilesInDirectoryFn: jasmine.Spy<(path: string) => Promise<FSItem[]>>;
  let readFileFn: jasmine.Spy<(path: string) => Promise<string>>;

  beforeEach(() => {
    listFilesInDirectoryFn = jasmine.createSpy("ListFilesInDirectoryFn");
    readFileFn = jasmine.createSpy("ReadFileFn");
    fileReader = new FileReader(readFileFn, listFilesInDirectoryFn);
  });

  describe("#listAll", () => {
    it("should list all files in one-layered directory", async () => {
      listFilesInDirectoryFn.and.returnValue(Promise.resolve(sampleFakeDirectoryFiles));
      const files = await fileReader.listAll("C:\\fake_directory");

      expect(listFilesInDirectoryFn).toHaveBeenCalledOnceWith("C:\\fake_directory");
      expect(files).toEqual(sampleFakeDirectoryFiles);
    });

    it("should list all files in two-layered directory and sub-directories", async () => {
      listFilesInDirectoryFn.and.returnValues(
        Promise.resolve(sampleRootDirectoryFiles),
        Promise.resolve(sampleSrcDirectoryFiles)
      );
      const files = await fileReader.listAll("C:\\fake_dir", {
        recursive: true,
      });

      expect(listFilesInDirectoryFn).toHaveBeenCalledWith("C:\\fake_dir");
      expect(listFilesInDirectoryFn).toHaveBeenCalledWith("C:\\fake_dir\\src");
      expect(files).toEqual(sampleRootDirectoryFilesWithChildren);
    });

    it("should list all files in two-layered directory and not sub-directories", async () => {
      listFilesInDirectoryFn.and.returnValues(
        Promise.resolve(sampleRootDirectoryFiles),
        Promise.resolve(sampleSrcDirectoryFiles)
      );
      const files = await fileReader.listAll("C:\\fake_dir", {
        recursive: false,
      });

      expect(listFilesInDirectoryFn).toHaveBeenCalledOnceWith("C:\\fake_dir");
      expect(files).toEqual(sampleRootDirectoryFiles);
    });
  });

  describe("#readAll", () => {
    it("should read all files in one-layered directory", async () => {
      listFilesInDirectoryFn.and.returnValue(Promise.resolve(sampleFakeDirectoryFiles));
      const files = await fileReader.readAll("C:\\fake_directory");

      expect(listFilesInDirectoryFn).toHaveBeenCalledOnceWith("C:\\fake_directory");
      expect(files).toEqual(sampleFakeDirectoryFiles);
    });

    it("should read all files in two-layered directory and sub-directories", async () => {
      listFilesInDirectoryFn.and.returnValues(
        Promise.resolve(sampleRootDirectoryFiles),
        Promise.resolve(sampleSrcDirectoryFiles)
      );
      const files = await fileReader.readAll("C:\\fake_dir", {
        recursive: true,
      });

      expect(listFilesInDirectoryFn).toHaveBeenCalledWith("C:\\fake_dir");
      expect(listFilesInDirectoryFn).toHaveBeenCalledWith("C:\\fake_dir\\src");
      expect(files).toEqual(sampleRootDirectoryFilesWithChildren);
    });

    it("should read all files in one-layered directory and their content", async () => {
      listFilesInDirectoryFn.and.callFake(() => Promise.resolve(sampleRootDirectoryFiles));
      readFileFn.and.returnValue(Promise.resolve(packageJsonWithContent.content!));

      const files = await fileReader.readAll("C:\\fake_dir", {
        readContents: true,
      });

      expect(listFilesInDirectoryFn).toHaveBeenCalledWith("C:\\fake_dir");
      expect(readFileFn).toHaveBeenCalledWith("C:\\fake_dir\\package.json");
      expect(files).toEqual(sampleRootDirectoryFilesWithContent);
    });

    it("should read all files in two-layered directory and sub-directories and their content", async () => {
      listFilesInDirectoryFn.and.returnValues(
        Promise.resolve(sampleRootDirectoryFiles),
        Promise.resolve(sampleSrcDirectoryFilesWithContent)
      );
      readFileFn.and.returnValues(
        Promise.resolve(packageJsonWithContent.content!),
        Promise.resolve(indexJsWithContent.content!)
      );

      const files = await fileReader.readAll("C:\\fake_dir", {
        recursive: true,
        readContents: true,
      });

      expect(listFilesInDirectoryFn).toHaveBeenCalledWith("C:\\fake_dir");
      expect(listFilesInDirectoryFn).toHaveBeenCalledWith("C:\\fake_dir\\src");
      expect(readFileFn).toHaveBeenCalledWith("C:\\fake_dir\\package.json");
      expect(readFileFn).toHaveBeenCalledWith("C:\\fake_dir\\src\\index.js");
      expect(files).toEqual(sampleRootDirectoryFilesWithChildrenAndContent);
    });
  });
});

const sampleFakeDirectoryFiles = [
  new File("C:\\fake_directory\\fake_file.txt"),
  new Directory("C:\\fake_directory\\internal_directory"),
];
const sampleRootDirectoryFiles = [
  new File("C:\\fake_dir\\package.json"),
  new Directory("C:\\fake_dir\\src"),
];
const packageJsonWithContent = new File("C:\\fake_dir\\package.json", "{ 'name': 'scaffolding' }");
const sampleRootDirectoryFilesWithContent = [
  packageJsonWithContent,
  new Directory("C:\\fake_dir\\src"),
];
const indexJsWithContent = new File(
  "C:\\fake_dir\\src\\index.js",
  "console.log('You are scaffolding');"
);
const sampleSrcDirectoryFiles = [new File("C:\\fake_dir\\src\\index.js")];
const sampleSrcDirectoryFilesWithContent = [indexJsWithContent];
const sampleRootDirectoryFilesWithChildren = [
  new File("C:\\fake_dir\\package.json"),
  new Directory("C:\\fake_dir\\src", sampleSrcDirectoryFiles),
];
const sampleRootDirectoryFilesWithChildrenAndContent = [
  packageJsonWithContent,
  new Directory("C:\\fake_dir\\src", sampleSrcDirectoryFilesWithContent),
];
