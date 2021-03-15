const {
    execSync
} = require("child_process");

const path = require("path");

const bucket = "team-timesheets_cloudbuild";
const cwd = path.resolve(__dirname, "../");
const key = ".gcs.service-account.json";

execSync(
    // `npx n-cache-r install --no-cache --key ${key} --bucket ${bucket} --cwd ${cwd}`,
    `npx n-cache-r install --bucket ${bucket} --cwd ${cwd}`,
    {
        stdio: 'inherit',
    },
);