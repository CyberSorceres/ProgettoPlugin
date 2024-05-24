import { defineConfig } from 'vitest/config';
import { resolve } from 'path'; // Ensure you import resolve from the correct path module

export default defineConfig(async () => {
    const config = await import('vitest/config');
    const { defineConfig } = config;

    return defineConfig({
        test: {
            alias: {
                // Map the 'vscode' import to your mock implementation
                //'vscode': resolve('/tests/vscode.mock.ts') // Adjust the path as needed
            }
        }
    });
});