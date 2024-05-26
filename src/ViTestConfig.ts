import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TestConfigInterface } from "./TestConfigInterface";
import { userInfo } from 'os';
import * as lib from 'progettolib'
import { FileParser } from './FileParser';
import { FileUtils } from './FileUtils';

export class ViTestConfig implements TestConfigInterface{
    private configGenerated: boolean;
    private dir: string;

    constructor(dir: string){
        this.configGenerated = false;
        this.dir = dir;
    }
    
    runTests(): void {
        const terminal = vscode.window.createTerminal('ViTest');
        terminal.sendText('npm test', true);
        terminal.show();
    }

    private writeTestFile(US: lib.UserStory){
        const testDir = path.join(this.dir, 'TEST')
        vscode.window.showInformationMessage('writing test');
        const fileUt = new FileUtils();
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
            //[PROJ, US] = await new FileParser(document, api).parseFile(UStag);

            [PROJ, US] = [lib.exampleProjects[1], lib.exampleUserStories[1]];
            
            if(PROJ !== undefined && US !== undefined){
                switch(PROJ.ai){
                case lib.AI.Bedrock:
                    let prompt = " generate a test for userStory  with description: " + US.description + US.test.UScode;
                    const response = await api.bedrock(prompt);
                    break;
                case lib.AI.ChatGPT:
                    //TODO
                    break;

                //US.test.testCode = response;

                }

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
}