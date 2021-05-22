import { basename, join } from "path";

import {
  Blueprint,
  Directory,
  DirectoryBlueprint,
  File,
  FileBlueprint,
  FSItem,
  UnknownBlueprintTypeError,
  UnknownFileTypeError,
} from "./types";

export function createBlueprint(fsItem: FSItem): Blueprint {
  if (fsItem instanceof File) {
    return new FileBlueprint(basename(fsItem.path), fsItem.content);
  } else if (fsItem instanceof Directory) {
    return new DirectoryBlueprint(basename(fsItem.path), fsItem.children.map(createBlueprint));
  }
  throw new UnknownFileTypeError(fsItem.constructor.name);
}

export function createFsItem<T extends Blueprint>(
  blueprint: T,
  { basePath }: CreateFsItemOptions
): FsItemMap<T> {
  if (blueprint instanceof DirectoryBlueprint) {
    const directoryPath = join(basePath, blueprint.name);
    const directoryChildrenBlueprint = blueprint.children.map((child) =>
      createFsItem(child, { basePath: directoryPath })
    );
    return new Directory(directoryPath, directoryChildrenBlueprint) as FsItemMap<T>;
  } else if (blueprint instanceof FileBlueprint) {
    return new File(
      join(basePath, blueprint.name),
      (blueprint as FileBlueprint).content
    ) as FsItemMap<T>;
  }
  throw new UnknownBlueprintTypeError(blueprint.constructor.name);
}

type FsItemMap<T extends Blueprint> = T extends DirectoryBlueprint ? Directory : File;

type CreateFsItemOptions = {
  basePath: string;
};
