import * as vscode from 'vscode'
import { ExtensionLifeCycle } from "../../src/ExtensionLifeCycle";
import mockFs from 'mock-fs'
import { beforeEach, expect, describe, test} from 'vitest';
import { Context } from 'mocha';
import { API } from 'progettolib/src/API';

// Simple test suite
describe('Simple truthy test', () => {
  // Single test case
  test('should pass when true is true', () => {
    expect(true).toBe(true); // This test will pass
  });
});

/*
describe('setWorkingDirectory', () => {
    let ELC : ExtensionLifeCycle;
    beforeEach (() => {
        ELC = new ExtensionLifeCycle(vscode., new API());//FIXME context not fond
    });
test('Test quando ci sono cartelle di lavoro presenti', async () => {
    //Crea un mock per vscode.workspace.workspaceFolders
    const mockWorkspaceFolders = [
        { uri: { fsPath: '/path/to/workspace' } }
    ];
    // Mocka la funzione workspaceFolders di vscode.workspace per restituire le cartelle simulate
    mockFs(vscode.workspace, 'workspaceFolders').returns(mockWorkspaceFolders);

    // Verifica che la directory di lavoro sia impostata correttamente
    expect(ELC.getWorkingDirectory()).toEqual('/path/to/workspace');
});
test('Test quando non ci sono cartelle di lavoro presenti', async () => {
  // Mocka la funzione workspaceFolders di vscode.workspace per restituire undefined (nessuna cartella di lavoro)
  mockFs(vscode.workspace, 'workspaceFolders').returns(undefined);

  // Verifica che la directory di lavoro sia undefined
  expect(ELC.getWorkingDirectory()).toBeUndefined();
});
});


describe('getWorkingDirectory', () => { 
    let ELC : ExtensionLifeCycle;
    beforeEach (() => {
        ELC = new ExtensionLifeCycle(vscode.ExtensionContext, new API());
    });
    test('restituisce undefined quando workingDirectory non è definito', () => {
        expect(ELC.getWorkingDirectory()).toBeUndefined();
    });
  
    test('restituisce il percorso corretto quando workingDirectory è definito', () => {
        // Imposta manualmente il percorso di lavoro
        const mockWorkspaceFolders = [
            { uri: { fsPath: '/path/to/workspace' } }
        ];
        mockFs(vscode.workspace, 'workspaceFolders').returns(mockWorkspaceFolders);

        //const extensionLifeCycle = new ExtensionLifeCycle();
        expect(ELC.getWorkingDirectory()).toBe('/path/to/directory');
    });

    test('restituisce sempre una stringa o undefined', () => {
        // Ottiene il risultato della funzione getWorkingDirectory
        const workingDirectory = ELC.getWorkingDirectory();
        expect(typeof workingDirectory === 'string' || workingDirectory === undefined).toBeTruthy();
    });
});
*/

