export interface FSItem {
  absolutePath: string;
}

export class File implements FSItem {
  constructor(public readonly absolutePath: string, public readonly content?: string) {}
}

export class Directory implements FSItem {
  constructor(public readonly absolutePath: string, public readonly children?: FSItem[]) {}
}
