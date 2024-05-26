import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TestConfigInterface } from "./TestConfigInterface";
import { userInfo } from 'os';
import * as lib from 'progettolib'

export class ViTestConfig implements TestConfigInterface{
    private configGenerated: boolean;

    constructor(){
        this.configGenerated = false;
    }
    
    runTests(): void {
        const terminal = vscode.window.createTerminal('ViTest');
        terminal.sendText('npm test', true);
        terminal.show();
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

    generateTest(UStag: string, api: lib.API_interface): void {
        if( api.loggedIn === false ){
            vscode.window.showErrorMessage('Cannot generate test: You are not logged in.');
        }
        else{
            let PROJ: lib.Progetto | undefined;
            let US: lib.UserStory | undefined;
            [PROJ, US] = fileparser.parseFile(tag);
            
            if(PROJ === undefined || US === undefined){
                vscode.window.showErrorMessage('Cannot generate test: Project or UserStory not found.');
            }
            else{
                switch(PROJ.ai){
                case lib.AI.Bedrock:
                    let prompt = " generate a test for userStory  with description: " + US.description + US.test.UScode;
                    api.bedrock(prompt);
                    break;
                case lib.AI.ChatGPT:
                    //TODO
                    break;
            }
            }
            
        }
       
        //TODO  
        //If its not logged in -> show message thath you nedd to login
        //allocate file parser
        //[PROJ, US] = fileparser.parseFile(tag)
        //contruct promt
        //call bedrock or chatgpt based on progetto.AI

        //write test file
        
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