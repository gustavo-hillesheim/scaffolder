import {
  BlueprintService,
  createBlueprint,
  Directory,
  DirectoryBlueprint,
  FileReader,
  FSItem,
  ProjectBlueprint,
} from "@gus_hill/scaffolding";
import { basename } from "path";

export class CreateBlueprintCommand {
  constructor(private fileReader: FileReader, private blueprintService: BlueprintService) {}

  execute = async (blueprintName: string, { targetDirectory }: CreateBlueprintOptions) => {
    targetDirectory = targetDirectory || process.cwd();
    const directoryItems = await this.readDirectoryBlueprint(targetDirectory);
    await this.saveBlueprint(blueprintName, {
      items: [
        new DirectoryBlueprint(basename(targetDirectory), directoryItems.map(createBlueprint)),
      ],
    });
  };

  private async readDirectoryBlueprint(targetDirectory: string): Promise<FSItem[]> {
    console.log(`Reading files of directory ${targetDirectory}...`);
    const directoryBlueprint = await this.fileReader.readAll(targetDirectory, {
      recursive: true,
    });
    console.log(
      `Read a total of ${this.calculateTotalFiles(directoryBlueprint)} files/directories!`
    );
    return directoryBlueprint;
  }

  private calculateTotalFiles(files: FSItem[]): number {
    let total = 0;
    for (const file of files) {
      total++;
      if (file instanceof Directory && file.children) {
        total += this.calculateTotalFiles(file.children);
      }
    }
    return total;
  }

  private async saveBlueprint(blueprintName: string, blueprint: ProjectBlueprint): Promise<void> {
    console.log(`Saving blueprint ${blueprintName}...`);
    await this.blueprintService.saveBlueprint(blueprintName, blueprint);
    console.log("Blueprint saved!");
  }
}

type CreateBlueprintOptions = {
  targetDirectory?: string;
};
