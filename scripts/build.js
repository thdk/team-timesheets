const path = require("path");
const { execAsync } = require("./utils/exec-async");

const root = path.join(__dirname, "..");
const functions = path.join(__dirname, "../functions");

process.on("unhandledRejection", (e) => {
    console.error(e);
    process.exit(1);
});

(async () => {
    await execAsync("npm ci", root);
    await execAsync("npm run build:refs", root);
    await execAsync("npm i", functions);
    await execAsync("npm run build", functions);
    await execAsync("npm run build:production", root);
})();