import * as vscode from 'vscode'
import * as lib from 'progettolib'

export class FileParser {
	public document: vscode.TextDocument;
	private api: lib.API_interface;
	
	constructor(doc: vscode.TextDocument, api: lib.API_interface){
		this.document = doc;
		this.api = api;
	}
	
	public async getProject(): Promise<lib.Progetto | undefined> {
		let project: lib.Progetto | undefined;
		const projectTagRegex = /@PROJECT-([A-Za-z0-9]+)/;
		const firstLine = this.document.lineAt(0).text;
		console.log(`line: ${firstLine}`);
		const projectMatch = firstLine.match(projectTagRegex);
		
		if (projectMatch) {
			const projectTag = projectMatch[0].split('-')[1];
			// project = await this.api.getProgettoByTag(projectTag);
			project = lib.exampleProjects[0]; // TODO: Replace with actual API call
			
			if (!project) {
				vscode.window.showErrorMessage(`No project with this TAG found: ${projectTag}`);
				return undefined;
			}
		} else {
			vscode.window.showErrorMessage('No project ID found: the project ID must appear in the first line of the document!');
			return undefined;
		}
	
		console.log(`Project with this TAG found: ${project.name}`);
		return project;
	}
	
	
	public async parseFile(tag: string): Promise<lib.UserStory | undefined> {
		const pro = this.getProject();
		//const projectTag = pro.tag;
		const projectTag = 'PRO';//FIXME
		const initialTagRegex = new RegExp(`@USERSTORY-${projectTag}-${tag}`, 'g');
		const endTagRegex = /@USERSTORY-END/g;
		
		let userStory: lib.UserStory | undefined;
		let foundTag = false;
		let userStoryContent: string[] = [];
		
		// First line of the file must contain project tag
		
		
		// For each line in the file, check if it contains a start tag, starting on the second line
		for (let i = 1; i < this.document.lineCount; i++) {
			const lineText = this.document.lineAt(i).text;
			
			if (foundTag) {
				// If we already found the start tag, collect lines until we find the end tag
				if (endTagRegex.test(lineText)) {
					console.log('found start and end tag');
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
			userStory = lib.exampleUserStories.find(story => story.tag === tag);
			if(!userStory){
				return undefined;
			}
			//userStory = this.api.getUserStoryFromTag(tag);
			
			userStory.test.UScode = userStoryContentString;
			
		} else {
			vscode.window.showErrorMessage(`User story with tag ${tag} not found in the document.`);
		}
		
		if(userStory){
			console.log(`Userstory with this TAG found: ${userStory.tag}`)
		}
		return userStory;
	}
	
}