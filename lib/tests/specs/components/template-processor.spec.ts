import { TemplateProcessor } from "../../../src";

describe("TemplateProcessor", () => {
  let templateProcessor: TemplateProcessor;

  beforeEach(() => {
    templateProcessor = new TemplateProcessor();
  });

  it("should interpolate a String variable", () => {
    const result = templateProcessor.process("I'm a $variable", {
      variable: "string",
    });
    expect(result).toEqual("I'm a string");
  });

  it("should interpolate a Number variable", () => {
    const result = templateProcessor.process("I'm a $number value", {
      number: 10,
    });
    expect(result).toEqual("I'm a 10 value");
  });

  it("should interpolate a Boolean variable", () => {
    const result = templateProcessor.process("I'm $boolean", {
      boolean: false,
    });
    expect(result).toEqual("I'm false");
  });

  it("should interpolate in multiline template", () => {
    const result = templateProcessor.process("I'm \na \n$templateVariable", {
      templateVariable: "Test",
    });
    expect(result).toEqual("I'm \na \nTest");
  });

  it("should not interpolate empty string", () => {
    const result = templateProcessor.process("", {});
    expect(result).toEqual("");
  });

  it("should not interpolate scaped $", () => {
    const result = templateProcessor.process("\\$scope", {});
    expect(result).toEqual("$scope");
  });

  it("should throw error when interpolating a non-existing variable", () => {
    expect(() => templateProcessor.process("$var", {})).toThrowError(
      "Variable 'var' was not defined"
    );
  });

  it("should return original String if no variable is found", () => {
    const result = templateProcessor.process("I have no variables", {});
    expect(result).toEqual("I have no variables");
  });
});
