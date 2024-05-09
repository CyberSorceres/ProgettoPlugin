import * as vscode from 'vscode';
import { ExtensionLifeCycle } from '../../src/ExtensionLifeCycle';
import { expect } from 'vitest';

describe('ExtensionLifeCycle', () => {
  let extensionLifeCycle: ExtensionLifeCycle;

  beforeEach(() => {
    extensionLifeCycle = new ExtensionLifeCycle();
  });

  afterEach(() => {
    extensionLifeCycle.deactivate();
  });

  it('should set working directory when workspace folders exist', () => {
    const workspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file('/path/to/workspace'),
      name: 'Workspace',
      index: 0
    };

    const showInformationMessageSpy = spyOn(vscode.window, 'showInformationMessage');
    (vscode.workspace.workspaceFolders as any) = [workspaceFolder];

    extensionLifeCycle.setWorkingDirectory();

    expect(extensionLifeCycle.getWorkingDirectory()).toBe('/path/to/workspace');
    expect(showInformationMessageSpy).toHaveBeenCalledWith('Working directory set successfully.');
  });

  it('should show error message when no workspace folders exist', () => {
    const showErrorMessageSpy = spyOn(vscode.window, 'showErrorMessage');
    (vscode.workspace.workspaceFolders as any) = undefined;

    extensionLifeCycle.setWorkingDirectory();

    expect(extensionLifeCycle.getWorkingDirectory()).toBeUndefined();
    expect(showErrorMessageSpy).toHaveBeenCalledWith('No workspace folders found.');
  });
});

