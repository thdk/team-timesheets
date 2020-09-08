const path = require("path");
const { execAsync } = require("./utils/exec-async");

const root = path.join(__dirname, "..");

const args = process.argv.slice(2);

if (args.length !== 1) {
    throw new Error("Missing version ex. 2.17.2 as first argument");
}

process.on("unhandledRejection", (e) => {
    console.error(e);
    process.exit(1);
});

(async () => {
    const version = args[0];
    await execAsync(`npm version ${version}`, root);
    await execAsync(`git push --tags`, root);
})();