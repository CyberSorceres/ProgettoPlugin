import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TestConfigInterface } from "./TestConfigInterface";
import * as lib from 'progettolib';
import { FileParser } from './FileParser';
import { FileUtils } from './FileUtils';
import { exec } from 'child_process';

export class ViTestConfig implements TestConfigInterface{
    private dir: string;
    private project: lib.Progetto | undefined = undefined;
    
    constructor(dir: string){
        this.dir = dir;
    }
    
    public runTests(): void {
        const terminal = vscode.window.createTerminal('ViTest');
        terminal.sendText('npm test', true);
        terminal.show();
    }
    
    public createConfiguration(directory: string): void {
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
    }
    
    public async generateTest(UStag: string, api: lib.API_interface) {
        
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
            const fileParser = new FileParser(document, api);
            PROJ = await fileParser.getProject();
            
            //US = await fileParser.getUserSortByTag(UStag, PROJ.tag);//TODO
            US = await fileParser.getUserSortByTag(UStag);
            
            
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

    //Funzione per sincronizzare stato UserStory con DB
    public async syncTestStatus(api: lib.API_interface, userStories: lib.UserStory[]) {
        const testFiles = this.getTestFiles();
        
        for(const testFile of testFiles){
            const passing = await this.runTestOnFile(testFile);
            const testFileName = path.basename(testFile);
            if(passing === true){
                vscode.window.showInformationMessage('Test for ' + testFileName + ' is passing');
            }
            else{
                vscode.window.showInformationMessage('Test for ' + testFileName + ' is failing');
            }
        }

        
    }
    
    private writeTestFile(US: lib.UserStory){
        const fileUt = new FileUtils();
        
        const testDir = path.join(this.dir, 'TEST');
        const fileName: string = `UserStory_${US.tag}.test.ts`;
        const filePath = path.join(testDir, fileName);
        if(!fileUt.folderExists(testDir)){
            fileUt.createFolder(testDir);
        }
        if(!fileUt.fileExists(filePath)){
            fileUt.createFile(filePath);
        }
        else{
            fileUt.wipeFile(filePath);
        }
        
        fs.writeFileSync(filePath, US.test.testCode);
        
    }
    
    private createPackageJson(packageJsonPath: string): void{
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
    
    
    
    private getTestFiles(): string[]{
        const testFileDir = path.join(this.dir,'TEST');
        const files = fs.readdirSync(testFileDir);
        let filelist: string[] = [];
        files.forEach(file => {
            const filePath = path.join(testFileDir, file); // Adjust the test file pattern if needed
            filelist.push(filePath);
        });
        return filelist;
    }
    
    private async runTestOnFile(testFile: string): Promise<Boolean> {
        let pass: Boolean;
        const outputFilePath: string = `${path.dirname(testFile)}/test-output.json`;
        const command = `npx vitest ${testFile} --reporter=json --outputFile=${outputFilePath}`;
        const terminal = vscode.window.createTerminal('TEST');
        
        return new Promise((resolve, reject) => {

            terminal.sendText(command, true);
            
            // Convert the Thenable to a Promise
            Promise.resolve(terminal.processId)
            .then(pid => {
                if (!pid) {
                    reject(new Error('Failed to get terminal process ID.'));
                    return;
                }
                
                // Function to check if the file exists
                const checkFile = () => {
                    if (fs.existsSync(outputFilePath)) {
                        // Clear the interval if the file exists
                        clearInterval(checkFileInterval);
                        
                        // Read the file
                        fs.readFile(outputFilePath, 'utf8', (err, data) => {
                            if (err) {
                                console.error('Error reading the file:', err);
                                return reject(err);
                            }
                            console.log('File contents:', data);
                            
                            // Parse the JSON data
                            let jsonData;
                            try {
                                jsonData = JSON.parse(data);
                            } catch (parseError) {
                                console.error('Error parsing JSON:', parseError);
                                return reject(parseError);
                            }
                            
                            // Extract the status
                            const status = jsonData.success ? 'passed' : 'failed';
                            console.log(status);
                            
                            // Remove the file after reading
                            fs.unlink(outputFilePath, (err) => {
                                if (err) {
                                    console.error('Error deleting the file:', err);
                                    return reject(err);
                                }
                                console.log('File deleted successfully');
                                resolve(true);
                            });

                            terminal.dispose();
                            
                            
                            switch (status) {
                                case 'passed':
                                    pass = true;
                                break;
                                
                                case 'failed':
                                    pass = false;
                                break;
                            }

                            resolve(pass);
                        });
                    }
                };
                
                // Interval to periodically check if the file exists
                const checkFileInterval = setInterval(checkFile, 500);
            })
            .catch(err => {
                reject(err);
            });
        });
    }
}