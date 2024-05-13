import * as vscode from 'vscode';
import { ExtensionCommands } from './ExtensionCommands.js';
import { TestConfigInterface } from './TestConfigInterface.js';
import { ViTestConfig } from './ViTestConfig.js';

export class ExtensionLifeCycle{

	private commands: ExtensionCommands | undefined;
	private workingDirectory: string | undefined;
	private testConfiguration: TestConfigInterface;

	constructor() {
		this.setWorkingDirectory();
		this.activate();
		this.workingDirectory = this.setWorkingDirectory();
		this.testConfiguration = new ViTestConfig();
	}

	private activate(): void {
		this.commands = new ExtensionCommands();
		let dir: string | undefined;
		dir = undefined;
		try{
			dir = this.getWorkingDirectory();
		}
		catch (error: unknown) {
			if (error instanceof Error) {
				vscode.window.showErrorMessage(error.message);
			} else {
				vscode.window.showErrorMessage("An unknown error occurred when trying to get the working directory");
			}
		}

		if (dir != undefined) {
			this.testConfiguration.createConfiguration(dir);
		} else {
			vscode.window.showErrorMessage("Unable to get the working directory. Try restarting the extension");
		}

	}


	public deactivate(): void {
		if(this.commands) {
			this.commands.dispose();
		}
	}

	public setWorkingDirectory(): string | undefined{
		let workDir: string | undefined;
		vscode.window.showOpenDialog({
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false,
			openLabel: 'Select Folder for your project'
		}).then(uri => {
			if (uri && uri.length > 0) {
				// Use the selected folder URI as the working directory
				workDir =  uri[0].fsPath;
			} else {
				vscode.window.showErrorMessage('No folder selected.');
				workDir = undefined;
			}
		});

		return workDir;
	}

	public getWorkingDirectory(): string{
		if(this.workingDirectory != undefined){
			return this.workingDirectory;
		}
		else{
			throw new Error("Working directory is undefined");
			
		}
	}
	
}