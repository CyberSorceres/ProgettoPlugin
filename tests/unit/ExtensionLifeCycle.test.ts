import * as vscode from 'vscode';
import { ExtensionLifeCycle } from "../../src/ExtensionLifeCycle";
import * as fs from "fs";
import mockFs from 'mock-fs'
import sinon from 'sinon';
import assert from "assert";

describe('setWorkingDirectory', () => {
test('Test quando ci sono cartelle di lavoro presenti', async () => {
    //Crea un mock per vscode.workspace.workspaceFolders
    const mockWorkspaceFolders = [
        { uri: { fsPath: '/path/to/workspace' } }
    ];
    // Mocka la funzione workspaceFolders di vscode.workspace per restituire le cartelle simulate
    mockFs(vscode.workspace, 'workspaceFolders').returns(mockWorkspaceFolders);

    const extensionLifeCycle = new ExtensionLifeCycle();

    // Verifica che la directory di lavoro sia impostata correttamente
    expect(extensionLifeCycle.getWorkingDirectory()).toEqual('/path/to/workspace');
});
test('Test quando non ci sono cartelle di lavoro presenti', async () => {
  // Mocka la funzione workspaceFolders di vscode.workspace per restituire undefined (nessuna cartella di lavoro)
  mockFs(vscode.workspace, 'workspaceFolders').returns(undefined);

  const extensionLifeCycle = new ExtensionLifeCycle();

  // Verifica che la directory di lavoro sia undefined
  expect(extensionLifeCycle.getWorkingDirectory()).toBeUndefined();
});
});


const getWorkingDirectory = require('../../src/ExtensionLifeCycle');

//forse vanno creati nuovi oggetti prima di ogni test??
describe('getWorkingDirectory', () => {
    test('restituisce undefined quando workingDirectory non è definito', () => {
        expect(getWorkingDirectory.getWorkingDirectory()).toBeUndefined();
    });
  
    test('restituisce il percorso corretto quando workingDirectory è definito', () => {
        // Imposta manualmente il percorso di lavoro
        getWorkingDirectory.setWorkingDirectory('/path/to/directory');
        expect(getWorkingDirectory.getWorkingDirectory()).toBe('/path/to/directory');
    });

    test('gestisce correttamente i valori nulli o vuoti', () => {
        // Imposta il percorso di lavoro come null
        getWorkingDirectory.setWorkingDirectory(null);
        expect(getWorkingDirectory.getWorkingDirectory()).toBeUndefined();
        getWorkingDirectory.setWorkingDirectory('');
    });

    test('restituisce sempre una stringa o undefined', () => {
        // Ottiene il risultato della funzione getWorkingDirectory
        const workingDirectory = getWorkingDirectory.getWorkingDirectory();
        expect(typeof workingDirectory === 'string' || workingDirectory === undefined).toBeTruthy();
    });
});


