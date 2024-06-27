import { exec } from 'child_process';
import chalk from 'chalk';
import { diffStringsUnified } from 'jest-diff';
import fastq from 'fastq';
import logUpdate from 'log-update';
import { wait } from './utils.js';

const OPTIONS = {
	concurrency: 10,
	delay: 100,
	ignoreQueryParameters: false,
	replaceHost: '',
	replaceFromHost: '',
	replaceToHost: '',
	verbose: false,
	onlyErrors: false,
	user: '',
};

const DIFF_OPTIONS = {
	expand: false,
	omitAnnotationLines: true,
	aIndicator: '\tExpected:',
	bIndicator: '\tReceived:',
};

/**
 * Get the final URL for a request.
 *
 * @param {String} url The URL to test
 * @param {String} [method] The method to use for the request, defaults to 'GET'.
 * @return {Promise<string>} The final URL after all redirection have taken place
 */
async function getFinalRedirect(url, method = 'GET') {
	return new Promise((resolve, reject) => {
		let cmd = `curl --output /dev/null --silent --show-error --fail --location --write-out '{"data":%{json},"headers":%{header_json}}' --user-agent 'studiometa/cli-test-redirection bot' --request ${method} "${url}"`;

		if (OPTIONS.user) {
			cmd += ` --user ${OPTIONS.user}`;
		}

		exec(cmd, (error, stdout) => {
			const out = JSON.parse(stdout);
			if (error) {
				if (OPTIONS.verbose) {
					console.log(chalk.red('[ERROR]', chalk.underline(url)));
					console.log(chalk.red('[ERROR]', out.data.errormsg));
					if (out.data.http_code >= 500) {
						console.log(
							chalk.red(
								`[ERROR] The error probably comes from a syntax error in your .htaccess file.`
							)
						);
					}
					console.log(
						chalk.red(
							'[ERROR] Try running the following command to confirm the error:\n'
						)
					);
					console.log(chalk.red(`\tcurl -sIL -X ${method} "${url}"\n`));
				}
				reject({ error, url, method, cmd, out });
			}
			resolve(out);
		});
	});
}

/**
 * @typedef {Object} RedirectionConfig
 * @property {string} from
 *   The origin URL.
 * @property {string} to
 *   The target URL.
 * @property {boolean} ignoreQueryParameters
 *   Whether to ignore the query parameters in the final URL when comparing it with the target URL.
 */

/**
 * @typedef {Object} RedirectionOptions
 * @property {number} concurrency
 * @property {number} delay
 */

/**
 * @typedef {Object} RedirectionResult
 * @property {string} msg    The test result message.
 * @property {string} from   The origin URL.
 * @property {string} to     The target URL.
 * @property {string} out    The final URL.
 * @property {string} [diff] The diff if the test has failed.
 */

function print(msg, type = 'success') {
	logUpdate(msg);
	if (type === 'error') {
		logUpdate.done();
	}
}

function printSuccess(msg) {
	print(msg, 'success');
}

function printError(msg) {
	print(msg, 'error');
}

let current = 0;

/**
 * Test a redirection.
 * @param {RedirectionConfig} options
 * @return {Promise<RedirectionResult>}
 */
async function redirectionTest({ options, total }) {
	let { from, to } = options;

	if (OPTIONS.replaceHost || OPTIONS.replaceFromHost || OPTIONS.replaceToHost) {
		if (OPTIONS.replaceHost || OPTIONS.replaceFromHost) {
			from = new URL(from);
			from.host = OPTIONS.replaceFromHost || OPTIONS.replaceHost;
			from = from.toString();
		}

		if (OPTIONS.replaceHost || OPTIONS.replaceToHost) {
			to = new URL(to);
			to.host = OPTIONS.replaceToHost || OPTIONS.replaceHost;
			to = to.toString();
		}
	}

	if (from.includes('/.*')) {
		from = from.replace('/.*', '/__CLI_TEST_REDIRECTION__');
	}

	return new Promise(async (resolve, reject) => {
		let out, error, url;

		try {
			out = await getFinalRedirect(from, options.method);
			url = out.data.url_effective;
		} catch (err) {
			error = err;
		}

		if (OPTIONS.ignoreQueryParameters || options.ignoreQueryParameters) {
			const parsedUrl = new URL(out);
			parsedUrl.search = '';
			out = parsedUrl.toString();
		}

		const delayingFn = typeof OPTIONS.delay === 'number' ? wait : () => {};

		current++;
		let count = chalk.gray(
			`[${current.toString().padStart(total.toString().length)}/${total}]`
		);

		if (error) {
			const msg = `❌ ${chalk.white(from)} \n  → ${chalk.red('-')} ${chalk.red.strikethrough(
				to
			)} \n  → ${chalk.magentaBright('+ ' + error.out.data.url)} (${
				error.out.data.errormsg
			})`;

			if (!OPTIONS.verbose) {
				printError(count + ' ' + msg);
			} else {
				console.log(count, msg);
			}

			await delayingFn(OPTIONS.delay);
			reject({ msg, from, to, out });
		} else if (url !== to) {
			const msg = `🚫 ${chalk.white(from)} \n  → ${chalk.red(
				'-'
			)} ${chalk.red.strikethrough(to)} \n  → ${chalk.magentaBright(
				`+ ${url}`
			)}`;
			const diff = diffStringsUnified(to, url, DIFF_OPTIONS);

			if (!OPTIONS.verbose) {
				printError(count + ' ' + msg); // write text
			} else {
				console.log(count, msg);
			}

			await delayingFn(OPTIONS.delay);
			reject({ msg, from, to, url, diff });
		} else {
			const msg = `✅ ${chalk.white(from)} \n  ${chalk.black('→')} ${chalk.blue(
				to
			)}`;

			if (!OPTIONS.verbose) {
				printSuccess(count + ' ' + msg);
			} else {
				if (!OPTIONS.onlyErrors) {
					console.log(count, msg);
				}
			}

			await delayingFn(OPTIONS.delay);
			resolve({ msg, from, to, url });
		}
	});
}

/**
 * Run tests based on the given config
 * @param {RedirectionConfig[]} config
 * @param {RedirectionOptions} options
 * @return {void}
 */
export default function run(config, options = {}) {
	console.log('');
	Object.entries(options).forEach(([name, value]) => {
		OPTIONS[name] = value;
	});

	current = 0;

	const queue = fastq.promise(redirectionTest, OPTIONS.concurrency);
	const runners = config.map((c, index) =>
		queue.push({ options: c, index, total: config.length })
	);

	const total = runners.length;
	Promise.allSettled(runners).then((results) => {
		const rejected = results.filter((r) => r.status === 'rejected');
		const totalRejected = rejected.length;

		logUpdate('');

		if (totalRejected > 0) {
			if (totalRejected !== total) {
				console.log(
					chalk.green(
						`🟢 ${total - totalRejected} out of ${total} test passed.`
					)
				);
			}

			console.log(
				chalk.red(`🔴 ${totalRejected} out of ${total} tests failed.`)
			);
			console.log('');

			// rejected.forEach(({ reason }) => {
			// 	console.log(reason.msg, '\n');
			// 	console.log(reason.diff, '\n');
			// });
			// console.log('');

			// if (totalRejected !== total) {
			// 	console.log(
			// 		chalk.green`🟢 ${total - totalRejected} out of ${total} test passed.`
			// 	);
			// }

			// console.log(chalk.red`🔴 ${totalRejected} out of ${total} tests failed:`);
			// console.log('');

			process.exit(1);
		} else {
			if (OPTIONS.verbose) {
				console.log('');
			}
			logUpdate(chalk.green(`🟢 All ${total} redirection tests passed.`));
			process.exit();
		}
	});
}
