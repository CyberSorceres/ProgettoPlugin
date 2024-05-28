import * as vscode from 'vscode';
import * as lib from 'progettolib';
import { ExtensionLifeCycle } from './ExtensionLifeCycle';

export class SidePanelViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'extension.loginView';
    private _view?: vscode.WebviewView;
    private _api?: lib.API_interface;
    private extLifeCycle: ExtensionLifeCycle;

    constructor(private readonly context: vscode.ExtensionContext, extLifeCycle: ExtensionLifeCycle) {
        this.extLifeCycle = extLifeCycle;
    }

    public setApi(api: lib.API_interface) {
        this._api = api;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = this.getLoginView(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(
            async message => {
                if (message.type === 'login') {
                    const loginSuccsessfull = await this.callLogin(message.email, message.password);
                    if (loginSuccsessfull) {
                        await this.extLifeCycle.getUserStoriesFromDB();
                        const myUserStories = this.extLifeCycle.userStories;
                        webviewView.webview.html = this.getLoggedInView(webviewView.webview, myUserStories, message.email);
                    }
                }
                if (message.type === 'generateTest') {
                    this.extLifeCycle.generateTest(message.usTag);
                }
                if (message.type === 'syncTest') {
                    await this.extLifeCycle.syncTest();
                    await this.extLifeCycle.getUserStoriesFromDB();
                    const myUserStories = this.extLifeCycle.userStories;
                    webviewView.webview.html = this.getLoggedInView(webviewView.webview, myUserStories, message.email);
                    
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private getLoginView(webview: vscode.Webview): string {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login</title>
        <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #1e1e1e;
            color: #d4d4d4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            box-sizing: border-box;
            background-color: #252526;
            border: none;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        h1 {
            color: #569cd6;
            text-align: center;
            margin-bottom: 20px;
            margin-top: 0;
        }
        form {
            display: flex;
            flex-direction: column;
            width: 100%;
        }
        label {
            margin-bottom: 5px;
        }
        input[type="text"], input[type="password"] {
            width: calc(100% - 16px);
            padding: 8px;
            margin-bottom: 15px;
            border: 1px solid #3c3c3c;
            border-radius: 3px;
            background-color: #3c3c3c;
            color: #d4d4d4;
        }
        input[type="submit"] {
            background-color: #007acc;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 3px;
            cursor: pointer;
        }
        input[type="submit"]:hover {
            background-color: #005a9e;
        }
        </style>
        </head>
        <body>
        <div class="container">
        <h1>Login</h1>
        <form id="loginForm">
        <label for="email">Email:</label>
        <input type="text" id="email" name="email">
        <label for="password">Password:</label>
        <input type="password" id="password" name="password">
        <input type="submit" value="Submit">
        </form>
        </div>
        
        <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('loginForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            vscode.postMessage({
                type: 'login',
                email: email,
                password: password
            });
        });
        </script>
        </body>
        </html>
        `;
    }

    private getLoggedInView(webview: vscode.Webview, userStories: lib.UserStory[] | undefined, username: string): string {
        let userStoriesHtml;
    
        if (userStories === undefined) {
            userStoriesHtml = '<p>Error loading the user stories assigned to you.</p>';
        } else {
            userStoriesHtml = userStories.map(story => `
            <details>
            <summary>
            <span style="display: flex; justify-content: space-between; width: 100%;">
                <span style="display: flex; align-items: center;">
                    ${story.verified ? '<i class="fas fa-check-circle" style="color: #54d77a;"></i>' : '<i class="fas fa-times-circle" style="color: #ff694e;"></i>'}
                    <span style="margin-left: 10px;">User Story #${story.tag}</span>
                </span>
                <div>
                    <button class="generate-test-btn" data-tag="${story.tag}">
                        <i class="fas fa-flask"></i>
                    </button>
                </div>
            </span>
            </summary>
            <p>${story.description}</p>
            </details>
            `).join('');
        }
    
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Stories</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
        <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #1e1e1e;
            color: #d4d4d4;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            box-sizing: border-box;
            background-color: #252526;
            border: none;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        h1 {
            color: #569cd6;
            text-align: center;
            margin-bottom: 20px;
            margin-top: 0;
            font-size: 1.5em;
        }
        h2 {
            color: #9cdcfe;
            margin-bottom: 20px;
            font-size: 1.2em;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        details {
            background-color: #3c3c3c;
            border: 1px solid #3c3c3c;
            border-radius: 3px;
            margin-bottom: 10px;
            padding: 10px;
        }
        summary {
            cursor: pointer;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        summary::-webkit-details-marker {
            display: inline-block;
        }
        summary span:first-child {
            margin-right: 10px;
        }
        p {
            margin: 0;
            padding-top: 10px;
        }
        button {
            padding: 5px;
            background-color: #007acc;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            margin-left: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        button:hover {
            background-color: #005a9e;
        }
        .generate-test-btn {
            width: 30px;
            height: 30px;
            background-color: #007acc;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .generate-test-btn:hover {
            background-color: #005a9e;
        }
        .sync-tests-btn {
            width: 30px;
            height: 30px;
            background-color: #007acc;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        .sync-tests-btn:hover {
            background-color: #005a9e;
        }
        </style>
        </head>
        <body>
        <div class="container">
        <h1>Welcome, ${username}</h1>
        <h2>Your assigned user stories:
            <button class="sync-tests-btn" title="Sync test results to DB">
                <i class="fas fa-sync-alt"></i>
            </button>
        </h2>
        ${userStoriesHtml}
        </div>
        <script>
        const vscode = acquireVsCodeApi();
        document.querySelectorAll('.generate-test-btn').forEach(button => {
            button.addEventListener('click', () => {
                const tag = button.getAttribute('data-tag');
                vscode.postMessage({
                    type: 'generateTest',
                    usTag: tag
                });
            });
        });
        document.querySelector('.sync-tests-btn').addEventListener('click', () => {
            vscode.postMessage({
                type: 'syncTest'
            });
        });
        </script>
        </body>
        </html>
        `;
    }
    
    
        
    
    
    
    
    
    
    
    
    

    private async callLogin(email: string, password: string): Promise<Boolean> {
        const loginSuccessful = await Promise.resolve(this._api?.login(email, password));

        if (loginSuccessful) {
            vscode.window.showInformationMessage('Logged in correctly');
            return true;
            //TODO
            //hide login panel
            //show user name
            //show user story list
        }else{
            vscode.window.showErrorMessage('Error during login, please try again');
            return false;
        }
    }
}
