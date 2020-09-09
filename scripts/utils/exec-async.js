const { spawn } = require("child_process");

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
        console.log(as);
        const childProcess = spawn(cmd, [arg, `${as}`], {
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

module.exports = {
    execAsync,
};