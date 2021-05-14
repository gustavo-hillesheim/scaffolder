import { Directory, File, FileReader, FileWriter, FSItem } from "@gus_hill/scaffolding";
import { sep } from "path";

export class CreateBlueprintCommand {
  constructor(
    private fileReader: FileReader,
    private fileWriter: FileWriter,
    private blueprintsRootFolder: string
  ) {}

  execute = async (blueprintName: string, { targetDirectory }: CreateBlueprintOptions) => {
    const directoryBlueprint = await this.readDirectoryBlueprint(targetDirectory);
    console.log(JSON.stringify(directoryBlueprint));
    await this.saveBlueprint(directoryBlueprint, blueprintName);
  };

  private async readDirectoryBlueprint(targetDirectory?: string): Promise<FSItem[]> {
    targetDirectory = targetDirectory || process.cwd();
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

  private async saveBlueprint(blueprint: FSItem[], blueprintName: string): Promise<void> {
    const blueprintDirectoryPath = this.blueprintsRootFolder + sep + blueprintName;
    console.log(`Saving blueprint ${blueprintName}...`);
    await this.fileWriter.createDirectory(new Directory(blueprintDirectoryPath));
    await this.saveFilesRecursively(blueprint, blueprintDirectoryPath);
    console.log("Blueprint saved!");
  }

  private async saveFilesRecursively(
    blueprint: FSItem[],
    blueprintDirectoryPath: string
  ): Promise<void> {
    for (const file of blueprint) {
      if (file instanceof File) {
        console.log(`Writing ${file.path} with content ${file.content}`);
        this.fileWriter.writeFile(new File(blueprintDirectoryPath + sep + file.path));
      } else if (file instanceof Directory) {
        this.fileWriter.createDirectory(new Directory(blueprintDirectoryPath + sep + file.path));
        if (file.children) {
          this.saveFilesRecursively(file.children, blueprintDirectoryPath);
        }
      }
    }
  }
}

type CreateBlueprintOptions = {
  targetDirectory?: string;
};
