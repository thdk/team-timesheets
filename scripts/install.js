const {
    execSync
} = require("child_process");

const path = require("path");

const bucket = "team-timesheets_cloudbuild";
const cwd = path.resolve(__dirname, "../");
const key = ".gcs.service-account.json";

execSync(
    // `npx cloud-build-cache install --no-cache --key ${key} --bucket ${bucket} --cwd ${cwd}`,
    `npx cloud-build-cache install --bucket ${bucket} --cwd ${cwd}`,
    {
        stdio: 'inherit',
    },
);