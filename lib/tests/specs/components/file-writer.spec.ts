import { join, sep } from "path";

import { Directory, File, FileWriter } from "../../../src";
import {
  clearDir,
  createDirAt,
  createFileAt,
  expectDirAt,
  expectFileAt,
  expectNothingAt,
} from "../../utils";
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

  describe("#writeFile", () => {
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
  });

  describe("#createDirectory", () => {
    it("should create directory", async () => {
      const dirPath = pathToResource("sample-file.csv");
      await fileWriter.createDirectory(new Directory(dirPath));
      expectDirAt(dirPath);
    });

    it("should create directory and normalize it's path", async () => {
      await fileWriter.createDirectory(
        new Directory(pathToResource("path/to\\folder\\\\directory"))
      );
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
  });

  describe("#delete", () => {
    it("should delete an existing file", async () => {
      const filePath = pathToResource("file_to_be_deleted.txt");
      createFileAt(filePath, "");
      await fileWriter.delete(filePath);
      expectNothingAt(filePath);
    });

    it("should not delete a non existing file", async () => {
      const filePath = pathToResource("file_not_to_be_deleted.txt");
      expectNothingAt(filePath);
      await fileWriter.delete(filePath);
      expectNothingAt(filePath);
    });

    it("should delete an existing directory", async () => {
      const dirPath = pathToResource("dir_to_be_deleted");
      createDirAt(dirPath);
      await fileWriter.delete(dirPath);
      expectNothingAt(dirPath);
    });

    it("should not delete a non existing directory", async () => {
      const dirPath = pathToResource("dir_not_to_be_deleted");
      expectNothingAt(dirPath);
      await fileWriter.delete(dirPath);
      expectNothingAt(dirPath);
    });
  });

  function pathToResource(...pathSegments: string[]): string {
    return join(baseResourcesDirPath, ...pathSegments);
  }

  function clearResourcesDir(): void {
    clearDir(baseResourcesDirPath);
  }
});
