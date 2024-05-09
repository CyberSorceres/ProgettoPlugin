export default import("vitest/config").then(({ defineConfig }) => {
    return defineConfig({
        test: {
            globals: true,
            environment: 'jsdom'
        },
    });
}).catch(error => {
    console.error("Failed to import config:", error);
});
