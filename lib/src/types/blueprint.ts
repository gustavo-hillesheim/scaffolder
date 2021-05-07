export class FileBlueprint {
  constructor(public readonly name: string, public readonly content?: string) {}
}

export class DirectoryBlueprint {
  constructor(public readonly name: string, public readonly children?: Blueprint[]) {}
}

export interface ProjectBlueprint {
  items: Blueprint[];
}

export type Blueprint = FileBlueprint | DirectoryBlueprint;
