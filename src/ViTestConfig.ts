import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TestConfigInterface } from "./TestConfigInterface";
import { userInfo } from 'os';
import * as lib from 'progettolib'
import { FileParser } from './FileParser';
import { FileUtils } from './FileUtils';
import { exec } from 'child_process';

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
            //[PROJ, US] = await new FileParser(document, api).parseFile(UStag);

            [PROJ, US] = [lib.exampleProjects[1], lib.exampleUserStories[1]];
            US.test.UScode = `
            function sum(a: number, b: number): number {
                return a + b;
            }
            `;
            
            if(PROJ !== undefined && US !== undefined){
                let prompt = " generate a test file with many test for this user story, with description: " + US.description + '\nand with this code '+ US.test.UScode + 'Using Vitest.';
                let response: string;
                switch(PROJ.ai){
                case lib.AI.Bedrock:
                    response = await api.bedrock(prompt);
                    break;
                case lib.AI.ChatGPT:
                    //TODO
                    //const response = await api.chatGPT(prompt);
                    response = '';
                    break;
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
    async syncTestStatus(userStoryId: string) {
        try {
            const result = await this.runTestAndGetResult(userStoryId); //fa partire il test solo della user story corrispondente al bottone sync
            //await updateUserStoryStatus(userStoryId, result); Da implementare API per la modifica dello stato della UserStory dato l'ID e il nuovo stato(bool)
            vscode.window.showInformationMessage(`User story ${userStoryId} status updated to ${result ? "passato" : "non passato"}.`);
        } catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(`Failed to update user story ${userStoryId}: ${error.message}`);
            } else {
                vscode.window.showErrorMessage(`Failed to update user story ${userStoryId}: Unknown error`);
            }
        }
    }

    private async runTestAndGetResult(userStoryId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const testCommand = `npx vitest run --testNamePattern=UserStory_${userStoryId}`;
            exec(testCommand, (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Error running test for user story ${userStoryId}: ${stderr}`);
                    return reject(false);
                }
                // Analizzare l'output per determinare se il test è passato o fallito
                const testPassed = stdout.includes('passed'); // Modifica questo controllo in base all'output di Vitest
                resolve(testPassed);
            });
        });
    }
}