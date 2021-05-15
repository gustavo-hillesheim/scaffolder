import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { normalize, sep } from "path";

export function createDirAt(dirPath: string): void {
  mkdirSync(dirPath);
}

export function createFileAt(filePath: string, content: string): void {
  writeFileSync(filePath, content, { encoding: "utf8" });
}

export function expectFileAt(filePath: string, content: string): void {
  expect(existsSync(filePath)).toBeTruthy(`Item existing at ${filePath}`);
  expect(lstatSync(filePath).isFile()).toBeTruthy(`Item at ${filePath} is file`);
  const fileContent = readFileSync(normalize(filePath));
  expect(fileContent.toString()).toEqual(content);
}

export function expectNothingAt(filePath: string): void {
  expect(existsSync(filePath)).toBeFalsy(`Item not existing at ${filePath}`);
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
