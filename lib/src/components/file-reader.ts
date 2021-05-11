import { promises } from "fs";
import { normalize, sep } from "path";
import { Directory, File, FSItem } from "../types";

export class FileReader {
  constructor() {}

  async readAll(directoryPath: string, options: ReadOptions = {}): Promise<FSItem[]> {
    const files = await this.listAll(directoryPath, options);
    return this.readFilesContents(files);
  }

  private async readFilesContents(files: FSItem[]): Promise<FSItem[]> {
    const filesWithContent = [];
    for (const file of files) {
      if (file instanceof File) {
        const fileContent = await this.readFile(file.path);
        filesWithContent.push(new File(file.path, fileContent));
      } else {
        const directory = file as Directory;
        const childrenWithContent = await this.readFilesContents(directory.children);
        filesWithContent.push(new Directory(directory.path, childrenWithContent));
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

  async readFile(filePath: string): Promise<string | undefined> {
    return promises
      .readFile(filePath, {
        encoding: "utf8",
      })
      .then((result) => result || undefined);
  }

  private async listDirectoryFiles(directoryPath: string): Promise<FSItem[]> {
    const files = await promises.readdir(directoryPath, {
      encoding: "utf8",
      withFileTypes: true,
    });
    return files.map((file) =>
      file.isFile()
        ? new File(`${directoryPath}${sep}${file.name}`)
        : new Directory(`${directoryPath}${sep}${file.name}`)
    );
  }
}
type ReadOptions = {
  recursive?: boolean;
};

type ListOptions = {
  recursive?: boolean;
};
