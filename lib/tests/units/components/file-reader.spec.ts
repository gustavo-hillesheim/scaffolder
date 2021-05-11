import { sep } from "path";
import { Directory, File, FileReader } from "../../../src";
import { RESOURCES_FOLDER } from "../constants";

describe("FileReader", () => {
  let fileReader: FileReader;
  const baseResourcesDirPath = `${RESOURCES_FOLDER}${sep}file-reader`;
  const sampleDirPath = `${baseResourcesDirPath}${sep}sample_dir`;

  function pathToResource(...pathSegments: string[]): string {
    let path = sampleDirPath;
    for (const pathSegment of pathSegments) {
      path += sep + pathSegment;
    }
    return path;
  }

  beforeEach(() => {
    fileReader = new FileReader();
  });

  describe("#listAll", () => {
    it("should list all files in directory without sub-directories", async () => {
      const files = await fileReader.listAll(sampleDirPath, {
        recursive: false,
      });
      expect(files).toEqual([
        new Directory(pathToResource("empty_dir")),
        new File(pathToResource("empty_file.txt")),
        new Directory(pathToResource("internal_dir")),
        new File(pathToResource("sample_file.txt")),
      ]);
    });

    it("should list all files in directory with sub-directories", async () => {
      const files = await fileReader.listAll(sampleDirPath, {
        recursive: true,
      });
      expect(files).toEqual([
        new Directory(pathToResource("empty_dir")),
        new File(pathToResource("empty_file.txt")),
        new Directory(pathToResource("internal_dir"), [
          new File(pathToResource("internal_dir", "internal_file.txt")),
        ]),
        new File(pathToResource("sample_file.txt")),
      ]);
    });

    it("should throw error when listing non-existing directory", async () => {
      await expectAsync(fileReader.listAll(pathToResource("non_existing_dir"))).toBeRejected();
    });
  });

  describe("#readAll", () => {
    it("should read all files in directory and their content", async () => {
      const files = await fileReader.readAll(sampleDirPath);

      expect(files).toEqual([
        new Directory(pathToResource("empty_dir")),
        new File(pathToResource("empty_file.txt")),
        new Directory(pathToResource("internal_dir")),
        new File(pathToResource("sample_file.txt"), "This is a Sample File"),
      ]);
    });

    it("should read all files in directory and sub-directories and their content", async () => {
      const files = await fileReader.readAll(sampleDirPath, {
        recursive: true,
      });
      expect(files).toEqual([
        new Directory(pathToResource("empty_dir")),
        new File(pathToResource("empty_file.txt")),
        new Directory(pathToResource("internal_dir"), [
          new File(pathToResource("internal_dir", "internal_file.txt"), "This is an Internal File"),
        ]),
        new File(pathToResource("sample_file.txt"), "This is a Sample File"),
      ]);
    });

    it("should throw error when listing non-existing directory", async () => {
      await expectAsync(fileReader.readAll(pathToResource("non_existing_dir"))).toBeRejected();
    });
  });
});
