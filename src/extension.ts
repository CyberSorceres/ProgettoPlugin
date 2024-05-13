import * as vscode from 'vscode'

import { ExtensionLifeCycle } from "./ExtensionLifeCycle.js";


let ext: ExtensionLifeCycle | undefined;

export function activate(context: vscode.ExtensionContext) {
    ext = new ExtensionLifeCycle();
    ext.activate();
}

export function deactivate() {
    if (ext) {
        ext.deactivate();
    }
}