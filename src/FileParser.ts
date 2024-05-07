import * as vscode from 'vscode'

export class FileParser {
    public document: vscode.TextDocument;

    constructor(doc: vscode.TextDocument){
        this.document = doc;
    }

    public ParseFile() : UserStory[]{
    const userStories: UserStory[] = []; //from lib create US
	const projectTagRegex = /@PROJECT-(\d+)/g;
	const initialTagRegex = /@USERSTORY-(\d+)/g;
	//end tag is @USERSTORY-END then a newline
	const endTagRegex = /@USERSTORY-END/g;

	let report:  string = '';
	let loadingContent = false;
	let currentLineLogged = 0;

	//first line of the file must contain project tag
	const firstLine = this.document.lineAt(0).text;
	if(projectTagRegex.test(firstLine)) {
		projectId = firstLine.match(projectTagRegex)![0].split('-')[1]; //TODO projectId???
		vscode.window.showInformationMessage('Project tag found: ' + projectId);
	}
	else {
		vscode.window.showErrorMessage('No project tag found: the project tag must appear in the first line of the document');
		return [userStories, 'NO PROJECT TAG WAS FOUND ON THE FIRST LINE'];
	}

	//for each line in the file check if it contains a start tag, startting on the second line
	for (let i = 1; i < this.document.lineCount; i++) {
		const line = this.document.lineAt(i);
		const text = line.text;

		switch(true) {
			case endTagRegex.test(text): //found an END tag
				if(loadingContent) { //if I'm already loading content, stop loading the content -> I found the end tag
					loadingContent = false;
					if(currentLineLogged === 0) {
						report += `Error: No content found for user story ${userStories.length}\n`;
					}
				}
				else { //if I'm not loading content, report an error, -> I found an end tag before a start tag
					report += `Error: End tag found before start tag on line ${i+1}\n`;
				}
				break;
			case initialTagRegex.test(text): //found a START tag
				if(loadingContent) { //if the line contains a start tag and im already loading content, report an error -> I found a start tag before an end tag
					report += `Error: Start tag found before end tag on line ${i+1}\n`;
				}
				else { //if the line contains a start tag and im not loading content, start loading the content -> I found a new user story
					//extract the number from the tag
					let tagNumber = text.match(initialTagRegex)![0].split('-')[1];
					userStories.push(new UserStory(tagNumber, '')); //TODO import from lib
					loadingContent = true;
					currentLineLogged = 0;
				}
				break;
			default: //found CONTENT
				if(loadingContent) { //if im loading content, add the line to the user story content
					userStories[userStories.length - 1].content += text + '\n';
					//console.log('logged line number: ' + i + ' in user story number: ' + (userStories.length - 1));
					currentLineLogged++;
				}
				break;
		}

	}

	//return the user stories and the error report, if the error report is undefined, the file was parsed without errors, then return "No errors found"
	return [userStories, report === '' ? 'No errors found' : report];

    }
    }