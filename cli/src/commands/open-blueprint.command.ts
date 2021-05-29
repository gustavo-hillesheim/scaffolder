import openFileExplorer from "open-file-explorer";
import { sep, normalize } from "path";

export class OpenBlueprintCommand {
  constructor(
    private openWithExplorer: typeof openFileExplorer,
    private blueprintsRootDir: string
  ) {}

  execute = (blueprintName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.openWithExplorer(normalize(`${this.blueprintsRootDir}${sep}${blueprintName}`), (error) =>
        error ? reject(error) : resolve()
      );
    });
  };
}
