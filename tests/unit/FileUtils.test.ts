import { describe, test, expect} from "vitest";
import * as vscode from 'vscode';
import { FileUtils } from "../../src/FileUtils";
import * as fs from "fs";
import mockFs from 'mock-fs'
import sinon from 'sinon';

describe('FileUtils', () => {
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
      // Mock the file system
      mockFs({
        '': {} // Make sure to create parent directories if necessary
      });

      const fileUtils = new FileUtils();
      const folderPath = '/path/to/newFolder';

      // Call the createFolder method
      fileUtils.createFolder(folderPath, mockFs); // Pass the mocked fs object

      // Assert that the folder was created
      expect(mockFs.existsSync(folderPath)).toBe(true);
    });

  /*test('should not throw error if folder already exists', () => {
    const fileUtils = new FileUtils();
    const folderPath = '/path/to/existingFolder';

    // Mock the file system with an existing folder
    mockFs({
      '/path/to/existingFolder': {}
    });

    // Call the createFolder method
    fileUtils.createFolder(folderPath);

    // Assert that the folder still exists
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

    // Call the createFolder method
    fileUtils.createFolder(folderPath);

    // Assert that the error is logged
    // NOTE: This is just an example; you might need to adjust this assertion based on your actual logging mechanism
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error creating folder'));
  });*/
});

});