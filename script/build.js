const args = require('minimist')(process.argv.slice(2));
const path = require('path');
const chalk = require('chalk');
const execa = require('execa');

const isDryRun = args.dry;

const bin = (name) => path.resolve(__dirname, '../node_modules/.bin/' + name);

const run = (bin, args, opts) =>
  execa(bin, args, { stdio: 'inherit', ...opts });

const dryRun = (bin, args = [], opts = {}) =>
  console.log(chalk.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts);

const step = (msg) => console.log(chalk.cyan(msg));

async function main() {
  step('Build src...');
  await run(bin('tsc'));

  step('Copy static assets...');
  await run(bin('copyfiles'), ['-u', '1', 'src/**/*.png', 'dist']);
}

main();
