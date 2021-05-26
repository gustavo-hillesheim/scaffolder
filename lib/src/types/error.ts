class AppError extends Error {
  cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.cause = cause;
  }
}

export class UnknownFileTypeError extends AppError {
  constructor(type: string) {
    super(`Unknown file type: ${type}`);
  }
}

export class UnknownBlueprintTypeError extends AppError {
  constructor(type: string) {
    super(`Unknown blueprint type: ${type}`);
  }
}

export class InexistingBlueprintError extends AppError {
  constructor(blueprintName: string) {
    super(`The blueprint '${blueprintName}' does not exist`);
  }
}

export class BlueprintAlreadyExistsError extends AppError {
  constructor(blueprintName: string) {
    super(`Blueprint '${blueprintName}' already exists`);
  }
}

export class BlueprintProcessingError extends AppError {
  constructor(
    public readonly blueprintName: string,
    public readonly blueprintType: "file" | "directory",
    public readonly cause: Error
  ) {
    super(
      `Error while processing ${blueprintType} blueprint '${blueprintName}': ${cause.message}`,
      cause
    );
  }

  get shortMessage() {
    let parentError = this.cause;
    let rootBlueprintPath = this.blueprintName;
    let rootBlueprintType = this.blueprintType;
    let rootCause = this.cause;
    while (parentError) {
      if (parentError instanceof BlueprintProcessingError) {
        rootBlueprintPath += "/" + parentError.blueprintName;
        rootBlueprintType = parentError.blueprintType;
        rootCause = parentError.cause;
        parentError = parentError.cause;
      } else {
        break;
      }
    }
    return `Error while processing ${rootBlueprintType} blueprint at '${rootBlueprintPath}': ${rootCause.message}`;
  }
}
