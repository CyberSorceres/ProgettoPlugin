import * as vscode from 'vscode';
import { TestConfigInterface } from './TestConfigInterface';

export class ExtensionCommands {
    private readonly disposables: vscode.Disposable[] = [];

    constructor(testConfig: TestConfigInterface) {
        this.registerCommands(testConfig);
    }

    private registerCommands(testConfig: TestConfigInterface): void {
        this.disposables.push(
            vscode.commands.registerCommand('extension.runTests', () => {

                testConfig.runTests();
            })
        );
    }

    public dispose(): void {
        vscode.Disposable.from(...this.disposables).dispose();
    }
}