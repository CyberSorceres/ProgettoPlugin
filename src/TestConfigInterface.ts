export interface TestConfigInterface {
    runTests(): void;

    createConfiguration(directory: string): void;

    generateTest(): void;
}