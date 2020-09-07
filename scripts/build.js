const path = require("path");
const util = require("util");
const spawn = util.promisify(require("child_process").spawn);

const root = path.join(__dirname, "..");

function npm(args, cwd = root) {
    let command = "npm";
    if (process.platform === "win32") {
        command = "npm.cmd";
    }
    return spawn(
        command,
        args,
        {
            cwd,
            stdio: "inherit",
        }
    );
}

(async () => {
    await npm(["ci"]);
    await npm(["run", "build:refs"]);
    await npm(["ci"], path.join(__dirname, "../functions"));
    await npm(["run", "build"], path.join(__dirname, "../functions"));
    await npm(["run", "build:production"]);
})();