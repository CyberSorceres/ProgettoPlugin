import * as vscode from 'vscode';
import * as lib from 'progettolib';
import { ExtensionCommands } from './ExtensionCommands';
import { TestConfigInterface } from './TestConfigInterface';
import { ViTestConfig } from './ViTestConfig';
import { SidePanelViewProvider } from './SidePanelViewProvider';

export class ExtensionLifeCycle {
    private commands: ExtensionCommands | undefined;
    private workingDirectory: string | undefined;
    private testConfiguration: TestConfigInterface | undefined;
    private _api: lib.API_interface;
    private _userStories: lib.UserStory[] = [];
    
    constructor(private readonly context: vscode.ExtensionContext, api: lib.API_interface) {
        this._api = api;
        this.activate();
    }
    
    public get api(): lib.API_interface{
        return(this._api);
    }

    public get userStories(): lib.UserStory[]{
        return this._userStories;
    }

    public async  getUserStoriesFromDB() {
        try {
            this._userStories = await this._api.getUserStoriesAssignedToUser();
            
        } catch (error) {
            vscode.window.showErrorMessage(`An error occurred while trying to get your assigned userstories: ${error}`);
            
        }
    }

    public async generateTest(tag: string){
        this.testConfiguration?.generateTest(tag, this.api);
    }

    public async syncTest(){
        this.testConfiguration?.syncTestStatus(this._api, this.userStories);
    }
    
    private showSidePanel(){
        const sidePanelViewProvider = new SidePanelViewProvider(this.context, this);
        
        sidePanelViewProvider.setApi(this.api);
        
        this.context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                SidePanelViewProvider.viewType,
                sidePanelViewProvider
            )
        );    
        
    }
    
    private async activate(): Promise<void> {
        console.log('Activating Extension');
        try {
            await this.setWorkingDirectory();
            if (!this.workingDirectory) {
                throw new Error("Working directory is undefined");
            }
            
            this.testConfiguration = new ViTestConfig(this.workingDirectory);
            this.testConfiguration.createConfiguration(this.workingDirectory);
            this.commands = new ExtensionCommands(this.testConfiguration);
            
            this.showSidePanel();
            
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
    
    private async setWorkingDirectory(){
        const uri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Select Folder for your project'
        });
        
        if (uri && uri.length > 0) {
            this.workingDirectory =  uri[0].fsPath;
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
