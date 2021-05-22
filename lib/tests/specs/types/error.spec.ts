import { BlueprintProcessingError } from "../../../src";

describe("BlueprintProcessingError", () => {
  it("should create the shortMessage when the cause is a BlueprintProcessingError", () => {
    const error = new BlueprintProcessingError(
      "src",
      "directory",
      new BlueprintProcessingError("index.js", "file", new Error("fake error"))
    );
    expect(error.shortMessage).toEqual(
      "Error while processing file blueprint at 'src/index.js': fake error"
    );
  });
});
