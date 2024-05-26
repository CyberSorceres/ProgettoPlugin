import * as vscode from 'vscode'
import * as lib from 'progettolib'

export class FileParser {
	public document: vscode.TextDocument;
	private api: lib.API_interface;
	
	constructor(doc: vscode.TextDocument, api: lib.API_interface){
		this.document = doc;
		this.api = api;
	}
	
	public async parseFile(tag: string): Promise<[lib.Progetto | undefined, lib.UserStory | undefined]> {
		const projectTagRegex = /@PROJECT-(\d+)/g;
		const initialTagRegex = new RegExp(`@USERSTORY-${tag}`, 'g');
		const endTagRegex = /@USERSTORY-END/g;
	
		let project: lib.Progetto | undefined;
		let userStory: lib.UserStory | undefined;
		let foundTag = false;
		let userStoryContent: string[] = [];
	
		// First line of the file must contain project tag
		const firstLine = this.document.lineAt(0).text;
		const projectMatch = firstLine.match(projectTagRegex);
		
		if (projectMatch) {
			const projectId = projectMatch[0].split('-')[1];
			project = await this.api.getProgetto(projectId);
			
			if (!project) {
				vscode.window.showErrorMessage(`No project with this ID found: ${projectId}`);
				return [undefined, undefined];
			}
		} else {
			vscode.window.showErrorMessage('No project ID found: the project ID must appear in the first line of the document');
			return [undefined, undefined];
		}
	
		// For each line in the file, check if it contains a start tag, starting on the second line
		for (let i = 1; i < this.document.lineCount; i++) {
			const lineText = this.document.lineAt(i).text;
			
			if (foundTag) {
				// If we already found the start tag, collect lines until we find the end tag
				if (endTagRegex.test(lineText)) {
					break;
				} else {
					userStoryContent.push(lineText);
				}
			} else if (initialTagRegex.test(lineText)) {
				// If this line contains the start tag we're looking for
				foundTag = true;
			}
		}
	
		if (foundTag && userStoryContent.length > 0) {
			// Create a new UserStory object with the collected content
			//userStory = this.api.getUserStoryByTag(tag);
			const userStoryContentString = userStoryContent.join('\n')
			userStory = lib.exampleUserStories[1];

			userStory.test.UScode = userStoryContentString;

		} else {
			vscode.window.showErrorMessage(`User story with tag ${tag} not found in the document.`);
		}
	
		return [project, userStory];
	}
	
}