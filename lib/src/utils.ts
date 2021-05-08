import { basename } from "path";

import { Blueprint, Directory, DirectoryBlueprint, File, FileBlueprint, FSItem } from "./types";

export function createBlueprint(fsItem: FSItem): Blueprint {
  if (fsItem instanceof File) {
    return new FileBlueprint(basename(fsItem.path), fsItem.content);
  } else if (fsItem instanceof Directory) {
    return new DirectoryBlueprint(basename(fsItem.path), fsItem.children?.map(createBlueprint));
  }
  throw new Error(`Unknown file type ${fsItem}`);
}
