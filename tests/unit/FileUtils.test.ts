import { describe, test } from "vitest";
import { FileUtils } from "../../src/FileUtils";
import * as fs from "fs";

const fileUtils = new FileUtils();
const testFolderPath = "./testFolder";
const testFilePath = "./testFolder/testFile.txt";
const testFileContent = "This is a test content.";


(async () => {
  try {
    await describe("FileUtils", async () => {
      test("folderExists should return true if folder exists", () => {
        if (!fileUtils.folderExists(testFolderPath)) {
          throw new Error("folderExists failed for existing folder");
        }
      });

      test("folderExists should return false if folder does not exist", () => {
        if (fileUtils.folderExists("./nonexistentFolder")) {
          throw new Error("folderExists failed for nonexistent folder");
        }
      });

      test("fileExists should return true if file exists", () => {
        fileUtils.createFile(testFilePath);
        if (!fileUtils.fileExists(testFilePath)) {
          throw new Error("fileExists failed for existing file");
        }
      });

      test("fileExists should return false if file does not exist", () => {
        if (fileUtils.fileExists("./nonexistentFile.txt")) {
          throw new Error("fileExists failed for nonexistent file");
        }
      });

      test("createFolder should create a folder", () => {
        const newFolderPath = "./newTestFolder";
        fileUtils.createFolder(newFolderPath);
        if (!fs.existsSync(newFolderPath)) {
          throw new Error("createFolder failed to create folder");
        }
      });

      test("createFile should create a file with specified content", () => {
        fileUtils.createFile(testFilePath, testFileContent);
        if (!fs.existsSync(testFilePath)) {
          throw new Error("createFile failed to create file");
        }
        const fileContent = fs.readFileSync(testFilePath, "utf8");
        if (fileContent !== testFileContent) {
          throw new Error("createFile failed to write correct content to file");
        }
      });

      test("wipeFile should empty the content of a file", () => {
        fileUtils.wipeFile(testFilePath);
        const fileContent = fs.readFileSync(testFilePath, "utf8");
        if (fileContent !== "") {
          throw new Error("wipeFile failed to empty file content");
        }
      });
    });
    console.log("All tests passed successfully!");
  } catch (error) {
    console.error("Test failure:", error);
    process.exit(1);
  }
})();
