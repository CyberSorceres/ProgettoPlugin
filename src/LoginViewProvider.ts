import * as vscode from 'vscode';
import * as lib from 'progettolib'

export class LoginViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'extension.loginView';
    private _view?: vscode.WebviewView;
    private _api?: lib.API_interface;
    
    constructor(private readonly context: vscode.ExtensionContext) {}
    
    public setApi(api: lib.API_interface){
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
        
        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
        
        webviewView.webview.onDidReceiveMessage(
            message => {
                if (message.type === 'login') {
                    this.callLogin(message.email, message.password);
                }
            },
            undefined,
            this.context.subscriptions
        );
    }
    
    private getHtmlForWebview(webview: vscode.Webview): string {
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
    
    private async callLogin(email: string, password: string): Promise<void> {

        const loginSuccessful = await Promise.resolve(this._api?.login(email,password));
        
        if(loginSuccessful){
            vscode.window.showInformationMessage('Logged in correctly');
        }
        else{
            vscode.window.showErrorMessage('Error during login, please try again');
        }
    }
    
}
