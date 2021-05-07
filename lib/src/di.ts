import { MinimalDIContainer } from "minimal-di";
import { writeFile, mkdir, readdir, readFile } from "fs";

import { FileReader, FileWriter } from "./components";
import { ScaffolderService } from "./services";
import { Directory, File, FSItem } from "./types";

export const diContainer = new MinimalDIContainer();

diContainer.register(FileWriter, createFileWriter);
diContainer.register(FileReader, createFileReader);
diContainer.register(ScaffolderService, () => new ScaffolderService(diContainer.get(FileWriter)));

function createFileWriter(): FileWriter {
  const writeFileFn = (path: string, content?: string) =>
    new Promise<void>((resolve) =>
      writeFile(
        path,
        content as string,
        {
          encoding: "utf8",
        },
        () => resolve()
      )
    );
  const makeDirectoryFn = (path: string) =>
    new Promise<void>((resolve) =>
      mkdir(
        path,
        {
          recursive: true,
        },
        () => resolve()
      )
    );
  return new FileWriter(writeFileFn, makeDirectoryFn);
}

function createFileReader(): FileReader {
  const listItemsInDirectoryFn = (path: string) =>
    new Promise<FSItem[]>((resolve, reject) =>
      readdir(path, { encoding: "utf8", withFileTypes: true }, (err, files) => {
        if (err) {
          reject(err);
        }
        if (!files || files.length === 0) {
          resolve([]);
        } else {
          resolve(
            files.map((file) => {
              return file.isFile() ? new File(file.name) : new Directory(file.name);
            })
          );
        }
      })
    );

  const readFileFn = (path: string) =>
    new Promise<string>((resolve, reject) =>
      readFile(path, { encoding: "utf8" }, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data.toString());
      })
    );
  return new FileReader(listItemsInDirectoryFn, readFileFn);
}
