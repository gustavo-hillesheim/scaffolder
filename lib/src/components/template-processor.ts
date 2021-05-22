export class TemplateProcessor {
  process(template: string, variables: Record<string, string | number | boolean>): string {
    const variablesRegex = /\$(\w+)/g;
    let result = "";
    let lastIndex = 0;
    let regexResult = variablesRegex.exec(template);
    while (regexResult) {
      const variableName = regexResult[1];
      result += template.substring(lastIndex, regexResult.index);
      const variableValue = variables[variableName];
      if (variableValue === undefined) {
        throw new Error(`Variable '${variableName}' was not defined`);
      }
      result += variableValue;
      lastIndex = variablesRegex.lastIndex;
      regexResult = variablesRegex.exec(template);
    }
    return result;
  }
}
