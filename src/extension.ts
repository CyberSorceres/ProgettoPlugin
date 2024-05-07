import * as vscode from 'vscode'

import { ExtensionLifeCycle } from "./extensionLifeCycle";


let ext: ExtensionLifeCycle | undefined;

export function activate(context: vscode.ExtensionContext) {
    ext = new ExtensionLifeCycle();
    context.subscriptions.push(ext);
}

export function deactivate() {
    if (ext) {
        ext.deactivate();
    }
}