const exec = require('child_process').exec;
const version = "1.0.30";
const hotUrl = "https://lmappgames.oss-cn-hangzhou.aliyuncs.com/remote/";
const buildDir = "build/jsb-link/";
const genDir = "assets/";

exec(`node version_generator.js -v ${version} -u ${hotUrl} -s ${buildDir} -d ${genDir}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    if (stdout) {
        console.log(stdout);
    }
    if (stderr) {
        console.error(stderr)
    }
});