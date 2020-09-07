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

const { cmd, arg } = getShell();

function execAsync(args) {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(cmd, [arg, ...args], {
            cwd: root,
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

(async () => {
    await execAsync(["npm", "i"]);
    await execAsync(["npm", "run", "build:refs"]);
    await execAsync(["npm", "i"], path.join(__dirname, "../functions"));
    await execAsync(["npm", "run", "build"], path.join(__dirname, "../functions"));
    await execAsync(["npm", "run", "build:production"]);
})();