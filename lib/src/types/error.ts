export class UnknownFileTypeError extends Error {
  constructor(type: string) {
    super(`Unknown file type: ${type}`);
  }
}

export class UnknownBlueprintTypeError extends Error {
  constructor(type: string) {
    super(`Unknown blueprint type: ${type}`);
  }
}

export class InexistingBlueprintError extends Error {
  constructor(blueprintName: string) {
    super(`The blueprint '${blueprintName}' does not exist`);
  }
}

export class BlueprintAlreadyExistsError extends Error {
  constructor(blueprintName: string) {
    super(`Blueprint '${blueprintName}' already exists`);
  }
}
