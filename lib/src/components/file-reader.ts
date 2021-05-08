import { readdir, readFile } from "fs";
import { normalize, sep } from "path";
import { Directory, File, FSItem } from "../types";

type ReadFileFn = (path: string) => Promise<string>;
type ListItemsInDirectoryFn = (path: string) => Promise<FSItem[]>;

export class FileReader {
  constructor(
    private readFile: ReadFileFn = readFileFn,
    private listDirectoryFiles: ListItemsInDirectoryFn = listDirectoryFilesFn
  ) {}

  async readAll(directoryPath: string, options: ReadOptions = {}): Promise<FSItem[]> {
    const files = await this.listAll(directoryPath, options);
    if (options.readContents) {
      return this.readFilesContents(files);
    }
    return files;
  }

  private async readFilesContents(files: FSItem[]): Promise<FSItem[]> {
    const filesWithContent = [];
    for (const file of files) {
      if (file instanceof File) {
        const fileContent = await this.readFile(file.path);
        filesWithContent.push(new File(file.path, fileContent));
      } else if (file instanceof Directory && file.children) {
        const childrenWithContent = await this.readFilesContents(file.children);
        filesWithContent.push(new Directory(file.path, childrenWithContent));
      } else {
        filesWithContent.push(file);
      }
    }
    return filesWithContent;
  }

  async listAll(directoryPath: string, options: ListOptions = {}): Promise<FSItem[]> {
    const files = await this.listDirectoryFiles(normalize(directoryPath));
    const output = [];
    for (const file of files) {
      if (file instanceof Directory && options.recursive) {
        const children = await this.listAll(file.path, options);
        output.push(new Directory(file.path, children));
      } else {
        output.push(file);
      }
    }
    return output;
  }
}

function readFileFn(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) =>
    readFile(filePath, { encoding: "utf8" }, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data.toString());
    })
  );
}

function listDirectoryFilesFn(directoryPath: string): Promise<FSItem[]> {
  return new Promise<FSItem[]>((resolve, reject) =>
    readdir(directoryPath, { encoding: "utf8", withFileTypes: true }, (err, files) => {
      if (err) {
        reject(err);
      }
      if (!files || files.length === 0) {
        resolve([]);
      } else {
        resolve(
          files.map((file) => {
            return file.isFile()
              ? new File(`${directoryPath}${sep}${file.name}`)
              : new Directory(`${directoryPath}${sep}${file.name}`);
          })
        );
      }
    })
  );
}

type ReadOptions = {
  recursive?: boolean;
  readContents?: boolean;
};

type ListOptions = {
  recursive?: boolean;
};
