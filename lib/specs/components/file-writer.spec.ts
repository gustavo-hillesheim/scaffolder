import { Directory, File, FileWriter } from "../../src";

describe("FileWriter", () => {
  let writeFileFn: (path: string, content?: string) => Promise<void>;
  let makeDirectoryFn: (path: string) => Promise<void>;
  let fileWriter: FileWriter;

  beforeEach(() => {
    writeFileFn = jasmine.createSpy("WriteFileFn", async () => {});
    makeDirectoryFn = jasmine.createSpy("MakeDirectoryFn", async () => {});
    fileWriter = new FileWriter(writeFileFn, makeDirectoryFn);
  });

  it("should create file without any content", () => {
    fileWriter.createFile(new File("c:\\test.txt"));
    expect(writeFileFn).toHaveBeenCalledWith("c:\\test.txt", undefined);
  });

  it("should create file and normalize it's path", () => {
    fileWriter.createFile(new File("C:\\path/to//folder\\\\file.txt"));
    expect(writeFileFn).toHaveBeenCalledWith("C:\\path\\to\\folder\\file.txt", undefined);
  });

  it("should create file with content", () => {
    fileWriter.createFile(new File("c:\\sample-file.csv", "1,2,3"));
    expect(writeFileFn).toHaveBeenCalledWith("c:\\sample-file.csv", "1,2,3");
  });

  it("should create directory", () => {
    fileWriter.createDirectory(new Directory("C:\\test-dir"));
    expect(makeDirectoryFn).toHaveBeenCalledWith("C:\\test-dir");
  });

  it("should create directory and normalize it's path", () => {
    fileWriter.createDirectory(new Directory("C:\\path/to\\folder\\\\directory"));
    expect(makeDirectoryFn).toHaveBeenCalledWith("C:\\path\\to\\folder\\directory");
  });
});
