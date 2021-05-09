import { mkdir, writeFile } from "fs";
import { normalize } from "path";
import { Directory, File } from "../types";

type WriteFileFn = (path: string, content?: string) => Promise<void>;
type MakeDirectoryFn = (path: string) => Promise<void>;

export class FileWriter {
  constructor(
    private readonly writeFile: WriteFileFn = writeFileFn,
    private readonly makeDirectory: MakeDirectoryFn = makeDirectoryFn
  ) {}

  createFile(file: File): Promise<void> {
    return this.writeFile(normalize(file.path), file.content);
  }

  createDirectory(directory: Directory): Promise<void> {
    return this.makeDirectory(normalize(directory.path));
  }
}

function writeFileFn(path: string, content?: string) {
  return new Promise<void>((resolve, reject) =>
    writeFile(
      path,
      content as string,
      {
        encoding: "utf8",
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    )
  );
}

function makeDirectoryFn(path: string) {
  return new Promise<void>((resolve, reject) =>
    mkdir(
      path,
      {
        recursive: true,
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    )
  );
}
