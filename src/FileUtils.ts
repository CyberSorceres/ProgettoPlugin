import * as fs from 'fs';

export class FileUtils {

    public folderExists(folderPath: string): boolean{
        if (!folderPath || typeof folderPath !== 'string') {
            throw new Error('Invalid folder path');
        }

        try {
            return fs.statSync(folderPath).isDirectory();
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                // ENOENT: no such file or directory
                return false;
            } else {
                // Other error, e.g., permission denied
                throw error;
            }
        }
    }

    public  fileExists(filePath: string): boolean{
        try {
            return fs.statSync(filePath).isFile();
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                // ENOENT: no such file or directory
                return false;
            } else {
                // Other error, e.g., permission denied
                throw error;
            }
        }
    }

    public createFolder(folderPath: string) {
        try {
            fs.mkdirSync(folderPath);
            console.log(`Folder created at ${folderPath}`);
        } catch (error) {
            throw new Error(`Error creating folder: ${error}`);
        }
    }

    public createFile(filePath: string, fileContent: string = ''){
        try {
            fs.writeFileSync(filePath, fileContent);
            console.log(`File created at ${filePath}`);
        } catch (error) {
            console.error(`Error creating file: ${error}`);
        }
    }

    public wipeFile(filePath: string){
        try {
            fs.writeFileSync(filePath, ''); // Write an empty string to the file
            console.log(`File wiped successfully: ${filePath}`);
        } catch (error) {
            console.error(`Error wiping file: ${error}`);
        }
    }

    /*public getActiveFilename(): string | undefined{
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the URI of the currently open file
            const uri = editor.document.uri;
            // Get the base name (name without path) of the file
            const fileName = vscode.workspace.asRelativePath(uri);
            // Remove the file extension
            const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
            return fileNameWithoutExtension;
        } else {
            // No file is currently open
            return undefined;
        }
    }*/
}