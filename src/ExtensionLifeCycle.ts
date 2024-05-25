import * as vscode from 'vscode';
import * as lib from 'progettolib'
import { ExtensionCommands } from './ExtensionCommands';
import { TestConfigInterface } from './TestConfigInterface';
import { ViTestConfig } from './ViTestConfig';
import { LoginViewProvider } from './LoginViewProvider';

export class ExtensionLifeCycle {
    private commands: ExtensionCommands | undefined;
    private workingDirectory: string | undefined;
    private testConfiguration: TestConfigInterface | undefined;
    private _api: lib.API_interface;
    
    constructor(private readonly context: vscode.ExtensionContext, api: lib.API_interface) {
        this._api = api;
        this.activate();
    }
    
    public get api(): lib.API_interface{
        return(this._api);
    }
    
    private showLoginPanel(context: vscode.ExtensionContext){
        const loginViewProvider = new LoginViewProvider(this.context);
        
        loginViewProvider.setApi(this.api);
        
        this.context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                LoginViewProvider.viewType,
                loginViewProvider
            )
        );    
        
    }
    
    private async activate(): Promise<void> {
        console.log('Activating Extension');
        try {
            this.workingDirectory = await this.setWorkingDirectory();
            if (!this.workingDirectory) {
                throw new Error("Working directory is undefined");
            }
            
            this.testConfiguration = new ViTestConfig();
            this.testConfiguration.createConfiguration(this.workingDirectory);
            this.commands = new ExtensionCommands(this.testConfiguration);
            
            this.showLoginPanel(this.context);
            
        } catch (error: unknown) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(error.message);
            } else {
                vscode.window.showErrorMessage("An unknown error occurred during activation.");
            }
        }
    }
    
    public deactivate(): void {
        if (this.commands) {
            this.commands.dispose();
        }
    }
    
    private async setWorkingDirectory(): Promise<string | undefined> {
        const uri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Select Folder for your project'
        });
        
        if (uri && uri.length > 0) {
            return uri[0].fsPath;
        } else {
            vscode.window.showErrorMessage('No folder selected.');
            return undefined;
        }
    }
    
    public getWorkingDirectory(): string {
        if (this.workingDirectory) {
            return this.workingDirectory;
        } else {
            throw new Error("Working directory is undefined");
        }
    }
}
