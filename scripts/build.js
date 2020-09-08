const path = require("path");
const { spawn } = require("child_process");

const root = path.join(__dirname, "..");

function getShell() {
    if (process.platform === 'win32') {
        return { cmd: 'cmd', arg: '/C' }
    } else {
        return { cmd: 'sh', arg: '-c' }
    }
}

function execAsync(as, cwd = root) {
    const { cmd, arg } = getShell();
    return new Promise((resolve, reject) => {
        const childProcess = spawn(cmd, [arg, as.join(" ")], {
            cwd,
            stdio: "inherit",
        });

        childProcess.on('close', (code) => {
            if (code) {
                reject();
            }
            else {
                resolve();
            }
        });
    });
}

process.on("unhandledRejection", () => {
    process.exit(1);
});

(async () => {
    await execAsync(["npm", "ci"]);
    await execAsync(["npm", "run", "build:refs"]);
    await execAsync(["npm", "i"], path.join(__dirname, "../functions"));
    await execAsync(["npm", "run", "build"], path.join(__dirname, "../functions"));
    await execAsync(["npm", "run", "build:production"]);
})();