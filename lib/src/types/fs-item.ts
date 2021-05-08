export interface FSItem {
  path: string;
}

export class File implements FSItem {
  constructor(public readonly path: string, public readonly content?: string) {}
}

export class Directory implements FSItem {
  constructor(public readonly path: string, public readonly children?: FSItem[]) {}
}
