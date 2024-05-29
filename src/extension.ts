import * as vscode from 'vscode';
import * as lib from 'progettolib';
import { ExtensionLifeCycle } from './ExtensionLifeCycle';

let extensionLifeCycle: ExtensionLifeCycle | undefined;

export function activate(context: vscode.ExtensionContext): void {
    console.log('Extension is being activated');
    extensionLifeCycle = new ExtensionLifeCycle(context, new lib.API());

    context.subscriptions.push({
        dispose() {
            if (extensionLifeCycle) {
                extensionLifeCycle.deactivate();
            }
        }
    });
}

export function deactivate(): void {
    if (extensionLifeCycle) {
        extensionLifeCycle.deactivate();
    }
}