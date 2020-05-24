#!/usr/bin/env node

const ChildProcess = require('child_process');

let executablePath = null;
const appArgs = [];
const chromeArgs = [];

process.argv.slice(2).forEach(function (arg) {
  const indexOfEqualSign = arg.indexOf('=');
  if (indexOfEqualSign === -1) {
    chromeArgs.push(arg);
    return;
  }

  const name = arg.substring(0, indexOfEqualSign);
  const value = arg.substring(indexOfEqualSign + 1);
  if (name === '--spectron-path') {
    executablePath = value;
  } else if (name.indexOf('--spectron-arg') === 0) {
    appArgs[Number(name.substring(14))] = value;
  } else if (name.indexOf('--spectron-env') === 0) {
    process.env[name.substring(15)] = value;
  } else if (name.indexOf('--spectron-') !== 0) {
    chromeArgs.push(arg);
  }
});

const args = appArgs.concat(chromeArgs);

const appProcess = ChildProcess.spawn(executablePath, args);
// Fix from https://github.com/electron-userland/spectron/pull/562
// Disables the --enable-logging flag on Windows, which causes extranneous console host windows to appear
if (process.platform === 'win32') {
  args.splice(args.indexOf('--enable-logging'), 1);
}
appProcess.on('exit', function (code) {
  process.exit(code);
});
appProcess.stderr.pipe(process.stdout);
appProcess.stdout.pipe(process.stdout);
appProcess.stdin.pipe(process.stdin);
