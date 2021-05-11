import { existsSync, lstatSync, readdirSync, readFileSync, rmdirSync, unlinkSync } from "fs";
import { join, normalize, sep } from "path";

import { Directory, File, FileWriter } from "../../src";
import { RESOURCES_FOLDER } from "../constants";

describe("FileWriter", () => {
  let fileWriter: FileWriter;

  const baseResourcesDirPath = `${RESOURCES_FOLDER}${sep}file-writer`;

  beforeEach(() => {
    fileWriter = new FileWriter();
  });

  afterEach(() => {
    clearResourcesDir();
  });

  it("should create file without any content", async () => {
    const filePath = pathToResource("test.txt");
    await fileWriter.writeFile(new File(filePath));
    expectFileAt(filePath, "");
  });

  it("should create file and normalize it's path", async () => {
    await fileWriter.writeFile(new File(pathToResource("path/to//folder\\\\file.txt")));
    expectFileAt(pathToResource("path", "to", "folder", "file.txt"), "");
  });

  it("should create file with content", async () => {
    const filePath = pathToResource("sample-file.csv");
    await fileWriter.writeFile(new File(filePath, "1,2,3"));
    expectFileAt(filePath, "1,2,3");
  });

  it("should create directory", async () => {
    const dirPath = pathToResource("sample-file.csv");
    await fileWriter.createDirectory(new Directory(dirPath));
    expectDirAt(dirPath);
  });

  it("should create directory and normalize it's path", async () => {
    await fileWriter.createDirectory(new Directory(pathToResource("path/to\\folder\\\\directory")));
    expectDirAt(pathToResource("path", "to", "folder", "directory"));
  });

  it("should create directory and children", async () => {
    await fileWriter.createDirectory(
      new Directory(pathToResource("dir"), [
        new File(pathToResource("dir", "test.txt"), "teste"),
        new Directory(pathToResource("dir", "internal"), [
          new File(pathToResource("dir", "internal", "internal_file.txt")),
        ]),
        new Directory(pathToResource("dir", "empty")),
      ])
    );

    expectDirAt(pathToResource("dir"));
    expectDirAt(pathToResource("dir", "internal"));
    expectDirAt(pathToResource("dir", "empty"));
    expectFileAt(pathToResource("dir", "test.txt"), "teste");
    expectFileAt(pathToResource("dir", "internal", "internal_file.txt"), "");
  });

  function pathToResource(...pathSegments: string[]): string {
    return join(baseResourcesDirPath, ...pathSegments);
  }

  function expectFileAt(filePath: string, content: string): void {
    expect(existsSync(filePath)).toBeTruthy(`Item existing at ${filePath}`);
    expect(lstatSync(filePath).isFile()).toBeTruthy(`Item at ${filePath} is file`);
    const fileContent = readFileSync(normalize(filePath));
    expect(fileContent.toString()).toEqual(content);
  }

  function expectDirAt(dirPath: string): void {
    expect(existsSync(dirPath)).toBeTruthy(`Item existing at ${dirPath}`);
    expect(lstatSync(dirPath).isDirectory()).toBeTruthy(`Item at ${dirPath} is directory`);
  }

  function clearResourcesDir(): void {
    clearDir(baseResourcesDirPath);
  }

  function clearDir(dirPath: string): void {
    const resources = readdirSync(dirPath);
    for (const resource of resources) {
      const resourcePath = dirPath + sep + resource;
      if (lstatSync(resourcePath).isDirectory()) {
        clearDir(resourcePath);
        rmdirSync(resourcePath);
      } else {
        unlinkSync(resourcePath);
      }
    }
  }
});
