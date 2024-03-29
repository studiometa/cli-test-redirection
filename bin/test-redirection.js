#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import chalk from 'chalk';
import { cac } from 'cac';
import run from '../src/index.js';
import { importJson, importCsv } from '../src/utils.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json', import.meta.url);
const PKG_NAME = pkg.name;
const PKG_VERSION = pkg.version;
const CLI_NAME = 'test-redirection';

const cli = cac(PKG_NAME);

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
	.option('--ignore-query-parameters', 'Ignore query parameters in the final URL.')
	.option('-p, --parser [parser]', 'Define which parser should be used: json or csv.', { default: null })
	.option('--csv-delimiter [delimiter]', 'Define the delimiter of the input CSV file, can be a string or a RegExp.', { default: ',' })
	.option('--replace-host <host>', 'Replace host for both the `from` and `to` parameters.')
	.option('--replace-from-host <host>', 'Replace host for the `from` parameter.')
	.option('--replace-to-host <host>', 'Replace host for the `to` parameter.')
	.option('-v, --verbose', 'Log all redirections.')
	.option('--only-errors', 'Log only errors.')
	.option('-u, --user <user:password>', 'Basic auth user and password.')
	.action((configPath, options) => {
		const resolvedConfigPath = resolve(process.cwd(), configPath);

		if (!existsSync(resolvedConfigPath)) {
			console.log(
				chalk.red`Could not resolve the config from \`${configPath}\`.`
			);
			process.exit(1);
		}

		let config;

		if (options.parser === 'csv' || options.parser === null && resolvedConfigPath.endsWith('.csv')) {
			config = importCsv(resolvedConfigPath, {
				delimiter: new RegExp(options.csvDelimiter)
			});
		} else {
			config = importJson(resolvedConfigPath);
		}

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
