import { test, describe, beforeEach, expect} from 'vitest';
import { FileParser } from '../../src/FileParser'
import * as lib from 'progettolib'; // Update with your library imports

// Simple test suite
describe('Simple truthy test', () => {
  // Single test case
  test('should pass when true is true', () => {
    expect(true).toBe(true); // This test will pass
  });
});

/*import * as vscode from 'vscode'

const goodTextDocumentMock: vscode.TextDocument = {
    lineAt: (lineNumber: number) => {
        // Mocking line content based on line number
        switch (lineNumber) {
            case 0: // First line containing project tag
                return { text: '@PROJECT-1' };
            case 1: // Start tag for user story
                return { text: '@USERSTORY-1' };
            case 2: // Content for user story
                return { text: 'This is the content of user story 456' };
            case 3: // End tag for user story
                return { text: '@USERSTORY-END' };
            default:
                return { text: '' }; // Other lines are empty
        }
    },
    lineCount: 4, // Total line count
} as vscode.TextDocument;



describe('ParseFile', () => {
    let goodParser: FileParser;
    
    beforeEach(() => {
        goodParser = new FileParser(goodTextDocumentMock);

    });
    
    // Test case 1
    test('should return undefined if no project tag found in the first line', () => {
        //TODO
    });
    
    // Test case 2
    test('should return the project object if parsing is successful', async () => {
        let progetto: lib.Progetto | undefined = await goodParser.ParseFile();

        expect(progetto).toEqual(new lib.Progetto('0', 'name', true, ['1'], lib.AI.Bedrock));
    });
});

*/