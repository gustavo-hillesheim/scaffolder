import { normalize } from "path";
import { Directory, File } from "../types";

type WriteFileFn = (path: string, content?: string) => Promise<void>;
type MakeDirectoryFn = (path: string) => Promise<void>;

export class FileWriter {
  constructor(
    private readonly writeFileFn: WriteFileFn,
    private readonly makeDirectoryFn: MakeDirectoryFn
  ) {}

  createFile(file: File): Promise<void> {
    return this.writeFileFn(normalize(file.absolutePath), file.content);
  }

  createDirectory(directory: Directory): Promise<void> {
    return this.makeDirectoryFn(normalize(directory.absolutePath));
  }
}
