import * as assert from 'assert';
import * as vscode from 'vscode';
import sinon from 'sinon';

import { ExtensionCommands } from '../../src/ExtensionCommands';

suite('ExtensionCommands Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Commands registration', () => {
        const extensionCommands = new ExtensionCommands();

        const registerCommandStub = sinon.stub(vscode.commands, 'registerCommand');
        extensionCommands.dispose();

        assert.strictEqual(registerCommandStub.calledTwice, true);
        assert.strictEqual(registerCommandStub.calledWith('extension.runTests'), true);
        assert.strictEqual(registerCommandStub.calledWith('extension.generateTest'), true);

        registerCommandStub.restore();
    });
});

//lanciare npm install sinon @types/sinon --save-dev
