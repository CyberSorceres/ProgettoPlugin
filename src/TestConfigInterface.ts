import * as lib from 'progettolib';
export interface TestConfigInterface {
    runTests(): void;

    createConfiguration(directory: string): void;

    generateTest(tag: string, api: lib.API_interface): void;

    syncTestStatus(api: lib.API_interface, userStories: lib.UserStory[]): void;
}