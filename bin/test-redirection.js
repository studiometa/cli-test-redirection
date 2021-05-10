#!/usr/bin/env node
const { existsSync } = require('fs');
const { resolve } = require('path');
const chalk = require('chalk');
const { cac } = require('cac');
const pkg = require('../package.json');
const run = require('../src/index.js');
const PKG_NAME = pkg.name;
const PKG_VERSION = pkg.version;
const CLI_NAME = 'test-redirection';

const cli = cac(PKG_NAME);

/**
 * @todo add options:
 * - batch length
 * - wait between requests
 */
cli.command('<configPath>', 'Test redirections.')
	.action((configPath, options) => {
		const resolvedConfigPath = resolve(process.cwd(), configPath);

		if (!existsSync(resolvedConfigPath)) {
			console.log(chalk.red`Could not resolve the config from \`${configPath}\`.`);
			process.exit(1);
		}

		const config = require(resolvedConfigPath);
		run(config);
	});

cli.help(sections => {
  return sections.map(section => {
    if (section.title && section.body) {
      section.body = section.body.replaceAll(PKG_NAME, CLI_NAME);
    }
    return section;
  })
});
cli.version(PKG_VERSION);

try {
	cli.parse();
} catch (err) {
	if (err.message.includes('missing required args for command')) {
		console.log(chalk.red('The <configPath> argument is required:'));
		console.log(chalk.green(`\n  test-redirection ${chalk.white`<configPath>`}\n`));
	} else {
		console.log(chalk.red(err.message));
	}
	process.exit(1);
}

