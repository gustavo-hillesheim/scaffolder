export class TemplateProcessor {
  process(template: string, variables: TemplateVariables): string {
    return new TemplateProcessorDelegate(template, variables).process();
  }
}

class TemplateProcessorDelegate {
  private result = "";
  private lastIndex = 0;

  constructor(private template: string, private variables: TemplateVariables) {}

  process(): string {
    for (const variable of this.findVariables()) {
      const { name, index } = variable;
      if (this.isScaped(variable)) {
        const variablesGapWithoutScaping = this.template.substring(this.lastIndex, index - 1);
        this.result += variablesGapWithoutScaping;
        this.result += `$${name}`;
      } else {
        const variablesGap = this.template.substring(this.lastIndex, index);
        this.result += variablesGap;
        this.addVariableValueToResult(name);
      }
    }
    this.result += this.template.substring(this.lastIndex);
    return this.result;
  }

  private *findVariables(): Generator<VariablePlaceholderInfo> {
    const variablesRegex = /\$(\w+)/g;
    let regexResult = variablesRegex.exec(this.template);
    while (regexResult) {
      yield {
        name: regexResult[1],
        index: regexResult.index,
      };
      this.lastIndex = variablesRegex.lastIndex;
      regexResult = variablesRegex.exec(this.template);
    }
  }

  private isScaped({ index }: VariablePlaceholderInfo): boolean {
    return index > 0 ? this.template[index - 1] === "\\" : false;
  }

  private addVariableValueToResult(variableName: string): void {
    const variableValue = this.variables[variableName];
    if (variableValue === undefined) {
      throw new Error(`Variable '${variableName}' was not defined`);
    }
    this.result += variableValue;
  }
}

export type TemplateVariables = Record<string, string | number | boolean>;

type VariablePlaceholderInfo = {
  name: string;
  index: number;
};
