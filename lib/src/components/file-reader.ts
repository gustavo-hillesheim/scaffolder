import { normalize } from "path";
import { Directory, File, FSItem } from "../types";

type ReadFileFn = (path: string) => Promise<string>;
type ListItemsInDirectoryFn = (path: string) => Promise<FSItem[]>;

export class FileReader {
  constructor(
    private readonly listItemsInDirectoryFn: ListItemsInDirectoryFn,
    private readonly readFileFn: ReadFileFn
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
        const fileContent = await this.readFileFn(file.absolutePath);
        filesWithContent.push(new File(file.absolutePath, fileContent));
      } else if (file instanceof Directory && file.children) {
        const childrenWithContent = await this.readFilesContents(file.children);
        filesWithContent.push(new Directory(file.absolutePath, childrenWithContent));
      } else {
        filesWithContent.push(file);
      }
    }
    return filesWithContent;
  }

  async listAll(directoryPath: string, options: ListOptions = {}): Promise<FSItem[]> {
    const files = await this.listItemsInDirectoryFn(normalize(directoryPath));
    const output = [];
    for (const file of files) {
      if (file instanceof Directory && options.recursive) {
        const children = await this.listAll(file.absolutePath, options);
        output.push(new Directory(file.absolutePath, children));
      } else {
        output.push(file);
      }
    }
    return output;
  }
}

type ReadOptions = {
  recursive?: boolean;
  readContents?: boolean;
};

type ListOptions = {
  recursive?: boolean;
};
