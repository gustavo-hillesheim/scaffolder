import { basename } from "path";

import { Blueprint, Directory, DirectoryBlueprint, File, FileBlueprint, FSItem } from "./types";

export function createBlueprint(fsItem: FSItem): Blueprint {
  if (fsItem instanceof File) {
    return new FileBlueprint(basename(fsItem.absolutePath), fsItem.content);
  } else if (fsItem instanceof Directory) {
    return new DirectoryBlueprint(
      basename(fsItem.absolutePath),
      fsItem.children?.map(createBlueprint)
    );
  }
  throw new Error(`Unknown file type ${fsItem}`);
}
