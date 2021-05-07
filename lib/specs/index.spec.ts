import {
  BlueprintService,
  createBlueprintService,
  createScaffolderService,
  ScaffolderService,
  createFileReader,
  createFileWriter,
  FileWriter,
  FileReader,
} from "../src";

describe("index", () => {
  it("should create a ScaffolderService instance", () => {
    const scaffolder = createScaffolderService();

    expect(scaffolder).toBeTruthy();
    expect(scaffolder).toBeInstanceOf(ScaffolderService);
  });

  it("should create a BlueprintService instance", () => {
    const blueprintService = createBlueprintService("C:\\templates");

    expect(blueprintService).toBeTruthy();
    expect(blueprintService).toBeInstanceOf(BlueprintService);
  });

  it("should create a FileReader instance", () => {
    const fileReader = createFileReader();

    expect(fileReader).toBeTruthy();
    expect(fileReader).toBeInstanceOf(FileReader);
  });

  it("should create a FileWriter instance", () => {
    const fileWriter = createFileWriter();

    expect(fileWriter).toBeTruthy();
    expect(fileWriter).toBeInstanceOf(FileWriter);
  });
});
