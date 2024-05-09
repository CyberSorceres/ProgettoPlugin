import { describe, test, expect} from "vitest";

import * as vscode from 'vscode';
import { FileUtils } from "../../src/FileUtils";
import * as fs from "fs";
import mockFs from 'mock-fs'
import sinon from 'sinon';
import assert from "assert";

  describe('folderExists method', () => {
    test('folderExists should return true if folder exists', () => {
      mockFs({
        '/path/to/directory': {
          'file1.txt': 'file content',
          'subdir': {}
        }
      });

      const fileUtils = new FileUtils();
      const folderPath = '/path/to/directory';

      expect(fileUtils.folderExists(folderPath)).toBe(true);
    });

    test('folderExists should return false if folder does not exist', () => {
      mockFs.restore(); // Restore the file system to an empty state

      const fileUtils = new FileUtils();
      const folderPath = '/path/to/nonexistent';

      expect(fileUtils.folderExists(folderPath)).toBe(false);
    });

    test('folderExists should handle invalid folder path', () => {
      const fileUtils = new FileUtils();
      const invalidFolderPath = ''; // or null, undefined, etc.

      expect(() => fileUtils.folderExists(invalidFolderPath)).toThrow();
    });

});


  describe('fileExists method', () => {
    test('fileExists should return true if file exists', () => {
      mockFs({
      '/path/to/directory':{
      'file1.txt':'file content',
      'subdir': {}
      }
    });
      const fileUtils = new FileUtils();
      const filePath = '/path/to/directory/file1.txt';

      expect(fileUtils.fileExists(filePath)).toBe(true);

  });

  test('fileExists should return false if file does not exists', () =>{
    mockFs({
      '/path/to/directory':{
      'file1.txt':'file content',
      'subdir': {}
      }
    });
      const fileUtils = new FileUtils();
      const filePath = '/path/to/directory/wrongFileName.txt';

      expect(fileUtils.fileExists(filePath)).toBe(false);
  })

  test('fileExists should handle invalid file path', () => {
    const fileUtils = new FileUtils();
    const invalidFilePath = ''; // or null, undefined, etc.

    expect(() => fileUtils.folderExists(invalidFilePath)).toThrow();
  });

});


describe('createFolder method', () => {
    test('should create folder successfully', () => {
      const fileUtils = new FileUtils();
      const folderPath = './testFolder';
      
      fileUtils.createFolder(folderPath);
      // You can add assertions here to check if the folder was created
      // For example, you can use fs.existsSync() to check if the folder exists
      expect(fs.existsSync(folderPath)).toBe(true);
    });


  test('should handle error during folder creation', () => {
    const fileUtils = new FileUtils();
    const folderPath = '/path/to/invalidFolder';

    // Mock the file system to throw an error during folder creation
    mockFs({
      // Simulate a directory that cannot be created
      '/path/to/invalidFolder': mockFs.directory({
        mode: 0 // Invalid mode to trigger an error
      })
    });

    expect(() => fileUtils.createFolder(folderPath)).toThrow();
  });
});