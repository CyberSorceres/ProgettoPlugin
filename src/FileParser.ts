import * as vscode from 'vscode'
import * as lib from 'progettolib'

export class FileParser {
	public document: vscode.TextDocument;
	private api: lib.API_interface;
	
	constructor(doc: vscode.TextDocument, api: lib.API_interface){
		this.document = doc;
		this.api = api;
	}
	
	public async ParseFile(): Promise<[lib.Progetto | undefined, lib.UserStory[] | undefined]>{
		
		const projectTagRegex = /@PROJECT-(\d+)/g;
		const initialTagRegex = /@USERSTORY-(\d+)/g;
		const endTagRegex = /@USERSTORY-END/g;
		let project: lib.Progetto;
		let userStories: lib.UserStory[] = [];
		let tagNumber: string = '';
		
		let loadingContent = false;
		let currentLineLogged = 0;
		
		//first line of the file must contain project tag
		const firstLine = this.document.lineAt(0).text;
		if(projectTagRegex.test(firstLine)) {
			const projectId = firstLine.match(projectTagRegex)![0].split('-')[1];
			project = await this.api.getProgetto(projectId);
			if(!project){
				vscode.window.showErrorMessage(`No Project with this id fonund: ${projectId}`);
				return [undefined, undefined];
			}

		}
		else {
			vscode.window.showErrorMessage('No project id found: the project id must appear in the first line of the document');
			return [undefined, undefined];
		}
		
		//for each line in the file check if it contains a start tag, startting on the second line
		for (let i = 1; i < this.document.lineCount; i++) {
			const line = this.document.lineAt(i);
			const text = line.text;
			let userStoryCode: string = '';
			
			switch(true) {
				case endTagRegex.test(text): //found an END tag
				if(loadingContent) { //if I'm already loading content, stop loading the content -> I found the end tag
					//US = his.api.getUserStoryByTag(tagNumber)?.test.setUScode(userStoryCode);
					//US.Test.SetCOde(userStoryCode);
					//userStories.push(US);
					loadingContent = false;
					userStoryCode = '';
					if(currentLineLogged === 0) {
						throw new Error('No content found for user story');
					}
				}
				else { //if I'm not loading content, report an error, -> I found an end tag before a start tag
					throw new Error(`End tag found before start tag on line ${i+1}`);
				}
				break;
				case initialTagRegex.test(text): //found a START tag
				if(loadingContent) { //if the line contains a start tag and im already loading content, report an error -> I found a start tag before an end tag
					throw new Error(`Start tag found before end tag on line ${i+1}`);
					
				}
				else { //if the line contains a start tag and im not loading content, start loading the content -> I found a new user story
					tagNumber = text.match(initialTagRegex)![0].split('-')[1];
					loadingContent = true;
					currentLineLogged = 0;
				}
				break;
				default: //found CONTENT
				if(loadingContent) { //if im loading content, add the line to the user story code
					userStoryCode += text;
					currentLineLogged++;
				}
				break;
			}
			
		}

		return [project, userStories];
		
	}
}