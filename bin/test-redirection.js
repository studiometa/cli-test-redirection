#!/usr/bin/env node
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { cac } from 'cac';
import run from '../src/index.js';
import { importJson } from '../src/utils.js';

const pkg = importJson('../package.json', import.meta.url);
const PKG_NAME = pkg.name;
const PKG_VERSION = pkg.version;
const CLI_NAME = 'test-redirection';

const cli = cac(PKG_NAME);

/**
 * @todo add options:
 * - batch length
 * - wait between requests
 */
cli
	.command('<configPath>', 'Test redirections.')
	.option(
		'-c, --concurrency [concurrency]',
		'Limit the number of tests run simultaneously.',
		{ default: 10 }
	)
	.option('-d, --delay [delay]', 'Define a delay between each tests.', {
		default: 100,
	})
	.action((configPath, options) => {
		const resolvedConfigPath = resolve(process.cwd(), configPath);

		if (!existsSync(resolvedConfigPath)) {
			console.log(
				chalk.red`Could not resolve the config from \`${configPath}\`.`
			);
			process.exit(1);
		}

		const config = importJson(resolvedConfigPath, import.meta.url);
		run(config, options);
	});

cli.help((sections) => {
	return sections.map((section) => {
		if (section.title && section.body) {
			section.body = section.body.replace(new RegExp(PKG_NAME), CLI_NAME);
		}
		return section;
	});
});
cli.version(PKG_VERSION);

try {
	cli.parse();
} catch (err) {
	if (err.message.includes('missing required args for command')) {
		console.log(chalk.red('The <configPath> argument is required:'));
		console.log(
			chalk.green(`\n  test-redirection ${chalk.white`<configPath>`}\n`)
		);
	} else {
		console.log(chalk.red(err.message));
	}
	process.exit(1);
}
