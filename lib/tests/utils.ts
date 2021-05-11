import { existsSync, lstatSync, readdirSync, readFileSync, rmdirSync, unlinkSync } from "fs";
import { normalize, sep } from "path";

export function expectFileAt(filePath: string, content: string): void {
  expect(existsSync(filePath)).toBeTruthy(`Item existing at ${filePath}`);
  expect(lstatSync(filePath).isFile()).toBeTruthy(`Item at ${filePath} is file`);
  const fileContent = readFileSync(normalize(filePath));
  expect(fileContent.toString()).toEqual(content);
}

export function expectDirAt(dirPath: string): void {
  expect(existsSync(dirPath)).toBeTruthy(`Item existing at ${dirPath}`);
  expect(lstatSync(dirPath).isDirectory()).toBeTruthy(`Item at ${dirPath} is directory`);
}

export function clearDir(dirPath: string): void {
  const resources = readdirSync(dirPath);
  for (const resource of resources) {
    const resourcePath = dirPath + sep + resource;
    if (lstatSync(resourcePath).isDirectory()) {
      clearDir(resourcePath);
      rmdirSync(resourcePath);
    } else {
      unlinkSync(resourcePath);
    }
  }
}
