import * as vscode from 'vscode';

export class ExtensionCommands {
    private readonly disposables: vscode.Disposable[] = [];

    constructor() {
        this.registerCommands();
    }

    private registerCommands(): void {
        this.disposables.push(
            vscode.commands.registerCommand('extension.runTests', () => {
                // Command logic here
            }),
            vscode.commands.registerCommand('extension.generateTest', () => {
                // Command logic here
            })
        );
    }

    public dispose(): void {
        vscode.Disposable.from(...this.disposables).dispose();
    }
}