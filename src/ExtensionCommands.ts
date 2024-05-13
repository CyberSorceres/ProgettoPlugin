import * as vscode from 'vscode';
import { ViTestConfig } from './ViTestConfig.js';

export class ExtensionCommands {
    private readonly disposables: vscode.Disposable[] = [];

    constructor(testConfig: ViTestConfig) {
        this.registerCommands(testConfig);
    }

    private registerCommands(testConfig: ViTestConfig): void {
        this.disposables.push(
            vscode.commands.registerCommand('extension.runTests', () => {

                testConfig.runTests();
            }),
            vscode.commands.registerCommand('extension.generateTest', () => {
                testConfig.generateTest();
            })
        );
    }

    public dispose(): void {
        vscode.Disposable.from(...this.disposables).dispose();
    }
}