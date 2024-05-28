import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TestConfigInterface } from "./TestConfigInterface";
import { userInfo } from 'os';
import * as lib from 'progettolib'
import { FileParser } from './FileParser';
import { FileUtils } from './FileUtils';
import { exec } from 'child_process';
import { promisify } from 'util';

export class ViTestConfig implements TestConfigInterface{
    private configGenerated: boolean;
    private dir: string;
    private project: lib.Progetto | undefined = undefined;

    constructor(dir: string, api: lib.API_interface){
        this.configGenerated = false;
        this.dir = dir;
    }
    
    runTests(): void {
        const terminal = vscode.window.createTerminal('ViTest');
        terminal.sendText('npm test', true);
        terminal.show();
    }

    private writeTestFile(US: lib.UserStory){
        const fileUt = new FileUtils();

        const testDir = path.join(this.dir, 'TEST');
        const fileName: string = `UserStory_${US.tag}.test.ts`;
        const filePath = path.join(testDir, fileName);
        if(!fileUt.folderExists(testDir)){
            fileUt.createFolder(testDir)
        }
        if(!fileUt.fileExists(filePath)){
            fileUt.createFile(filePath);
        }
        else{
            fileUt.wipeFile(filePath);
        }

        fs.writeFileSync(filePath, US.test.testCode);

    }

    createConfiguration(directory: string): void {
        const workspacePath = directory;
        if (!workspacePath) {
            vscode.window.showErrorMessage('Cannot generate ViTest configuration: Workspace not found.');
            return;
        }
    
        const viTestConfigPath = path.join(workspacePath, 'vitest.config.js');
        if (fs.existsSync(viTestConfigPath)) {
            return;
        }
    
        // Create package.json if it doesn't exist
        const packageJsonPath = path.join(workspacePath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            this.createPackageJson(packageJsonPath);
        }
    
        const viTestConfigContent = `
        module.exports = {
            preset: 'ts-jest',
            testEnvironment: 'node',
            testMatch: ['**/TEST/**/*.test.ts'],
        };
        `;
    
        fs.writeFileSync(viTestConfigPath, viTestConfigContent);
        vscode.window.showInformationMessage('ViTest configuration generated successfully.');
        this.configGenerated = true;
    }

    async generateTest(UStag: string, api: lib.API_interface) {

        //getting current open document
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor');
            return;
        }
    
        const document = editor.document;


        if(!api.loggedIn()){
            vscode.window.showErrorMessage('Cannot generate test: You are not logged in.');
        }
        else{
            let PROJ: lib.Progetto | undefined;
            let US: lib.UserStory | undefined;
            //[PROJ, US] = [await new FileParser(document, api).parseFile(UStag);//TODO
            const fileParser = new FileParser(document, api);
            PROJ = await fileParser.getProject()

            US = await fileParser.parseFile(UStag);

            console.log('pro:',PROJ,'\nus: ',US);
            
            if(PROJ !== undefined && US !== undefined){
                this.project = PROJ;
                US.test.UScode = `
                //US.${US.tag}
                function sum(a: number, b: number): number {
                    return a + b;
                }
                `;
                this.project = PROJ;
                let prompt = " generate a test file with many test for this user story, with description: " + US.description + '\nand with this code '+ US.test.UScode + 'Using Vitest.';
                let response: string;
                switch(PROJ.ai){
                case lib.AI.Bedrock:
                    //response = await api.bedrock(prompt);
                    response = `
//test for US-PRO-${US.tag}
import { describe, it, expect } from 'vitest';

describe('Basic tests', () => {
    it('should assert true is true', () => {
        expect(true).toBe(true);
    });

    it('should assert 1 + 1 equals 2', () => {
        expect(1 + 1).toBe(2);
    });

    it('should assert "hello" is a string', () => {
        expect(typeof 'hello').toBe('string');
    });
});
                    `;
                    break;
                case lib.AI.ChatGPT:
                    //TODO
                    //const response = await api.chatGPT(prompt);
                    response = '';
                    break;
                }

                //console.log('here the response is:', response);
                if(!response){
                    vscode.window.showErrorMessage('Error while getting the response from the API');
                    return;
                }
                US.test.testCode = response;

                this.writeTestFile(US);
            }
            else{
                vscode.window.showErrorMessage('Cannot generate test: Project or UserStory not found.');
            }
            
        }
        
    }

    createPackageJson(packageJsonPath: string): void{
        const packageJsonContent = `
        {
            "name": "my-project",
            "version": "1.0.0",
            "description": "My project description",
            "scripts": {
                "test": "vitest"
            },
            "devDependencies": {
                "vitest": "^1.0.0",
                "@types/jest": "^27.0.4",
                "ts-jest": "^27.0.5"
            },
            "contributes": {
                "configuration": {
                    "jestrunner.framework": {
                        "type": "string",
                        "default": "vitest",
                        "description": "Specifies the test framework to use for running tests."
                    }
                }
            }
        }
        `;
    
        fs.writeFileSync(packageJsonPath, packageJsonContent);
        vscode.window.showInformationMessage('package.json created successfully.');
    }


    //Funzione per sincronizzare stato UserStory con DB
    async syncTestStatus(api: lib.API_interface, userStories: lib.UserStory[]) {
        const readDir = promisify(fs.readdir);
        const testFolder = path.join(this.dir, 'TEST');
        const tagRegex = /UserStory_(\w+)\.test\.ts/;
        try {
            const files = await readDir(testFolder);

            for (const file of files) {
                const filePath: string = path.join(testFolder, file);
                console.log(`Running tests for file: ${filePath}`);

                // Assuming your test command is 'npm test' followed by the file path
                const command = `npm test ${filePath}`;
                console.log(`Executing command: ${command}`);

                // Use options to specify the working directory
                const options = { cwd: this.dir };
                console.log('dir:', this.dir)
                await new Promise<void>((resolve, reject) => {
                    exec(command, options, async (error, stdout, stderr) => {
                        console.log('IM IN!!');
                        if (error) {
                            console.error(`Error running tests for ${file}: ${error.message}`);
                            reject(error);
                            return;
                        }

                        // Log stdout and stderr for debugging
                        console.log(`Standard output:\n${stdout}`);
                        console.error(`Standard error:\n${stderr}`);

                        // Assuming npm test returns 'PASS' if all tests pass
                        const allTestsPassed = stdout.includes('PASS');
                        console.log(`Tests passed: ${allTestsPassed}`);

                        const match = file.match(tagRegex);
                        let currentTag: string | null = null;
                        if (match && match.length > 1) {
                            currentTag = match[1];
                        }
                        console.log(`Current tag: ${currentTag}`);

                        if (this.project === undefined) {
                            const editor = vscode.window.activeTextEditor;
                            if (!editor) {
                                vscode.window.showErrorMessage('No active text editor');
                                return;
                            }

                            const document = editor.document;
                            const fileParser = new FileParser(document, api)
                            const proj = await fileParser.getProject();
                            if (proj === undefined) {
                                return;
                            }
                            this.project = proj;
                        }

                        const userStoryOfTest = userStories.find(user => user.tag === currentTag)
                        if (userStoryOfTest) {
                            const userId = userStoryOfTest?.id;
                            let state: lib.State;
                            switch (allTestsPassed) {
                                case true:
                                    state = lib.State.DONE;
                                    break;

                                case false:
                                    state = lib.State.TO_DO;
                                    break;
                            }
                            //api.setUserStoryState(this.project.id, userId, allTestsPassed);//TODO switch to state
                            console.log(`The user story with tag: ${userStoryOfTest.tag} is passing? : ${allTestsPassed}`);
                            vscode.window.showInformationMessage(`The user story with tag: ${userStoryOfTest.tag} is passing? : ${allTestsPassed}`);
                        }
                        resolve();
                    });
                });
            }
        } catch (err) {
            console.error('Error reading test folder:', err);
        }
    }
    
}