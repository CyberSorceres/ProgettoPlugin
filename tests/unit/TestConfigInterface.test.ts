import { describe, test } from "vitest";
import { TestConfigInterface } from "../../src/TestConfigInterface";

// classe fittizia che implementa l'interfaccia TestConfigInterface
class TestConfig implements TestConfigInterface {
    runTestsCalled: boolean = false;
    createdConfiguration: string = "";
    generateTestCalled: boolean = false;

    runTests(): void {
        this.runTestsCalled = true;
    }

    createConfiguration(directory: string): void {
        this.createdConfiguration = directory;
    }

    generateTest(): void {
        this.generateTestCalled = true;
    }
}

describe("TestConfigInterface", () => {
    const testConfig = new TestConfig();

    // Test per il metodo runTests
    test("runTests should execute tests", () => {
        testConfig.runTests();
        if (!testConfig.runTestsCalled) {
            throw new Error("runTests method not called.");
        }
    });

    // Test per il metodo createConfiguration
    test("createConfiguration should create configuration in specified directory", () => {
        const directory = "./config";
        testConfig.createConfiguration(directory);
        if (testConfig.createdConfiguration !== directory) {
            throw new Error("createConfiguration method not called with specified directory.");
        }
    });

    // Test per il metodo generateTest
    test("generateTest should generate a test", () => {
        testConfig.generateTest();
        if (!testConfig.generateTestCalled) {
            throw new Error("generateTest method not called.");
        }
    });
});
