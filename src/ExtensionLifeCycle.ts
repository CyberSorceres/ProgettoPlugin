import * as vscode from 'vscode';
import { ExtensionCommands } from './ExtensionCommands';

export class ExtensionLifeCycle{

	private commands: ExtensionCommands | undefined;
	private workingDirectory: string | undefined;

	constructor() {
		this.setWorkingDirectory();
		this.activate();
	}

	private activate(): void {
		this.commands = new ExtensionCommands();
	}


	public deactivate(): void {
		if(this.commands) {
			this.commands.dispose();
		}
	}

	public setWorkingDirectory(): void {
		const folders = vscode.workspace.workspaceFolders;
		if (folders && folders.length > 0) {
			// Assuming you want to use the first workspace folder as the working directory
			this.workingDirectory = folders[0].uri.fsPath;
			vscode.window.showInformationMessage('Working directory set successfully.');
		} else {
			vscode.window.showErrorMessage('No workspace folders found.');
		}
	}

	public getWorkingDirectory(): string | undefined {
		return this.workingDirectory;
	}
	
}