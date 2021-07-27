import { exec } from 'child_process';
import chalk from 'chalk';
import { diffStringsUnified } from 'jest-diff';
import fastq from 'fastq';
import { wait } from './utils.js';

const OPTIONS = {
	concurrency: 10,
	delay: 100,
};

const DIFF_OPTIONS = {
	expand: false,
	omitAnnotationLines: true,
	aIndicator: '\t-',
	bIndicator: '\t+',
};

/**
 * Get the final URL for a request.
 *
 * @param {String} url The URL to test
 * @param {String} [method] The method to use for the request, defaults to 'GET'.
 * @return {Promise<string>} The final URL after all redirection have taken place
 */
async function getFinalRedirect(url, method = 'GET') {
	return new Promise((resolve) => {
		const cmd = `curl -o /dev/null -sL -k -w "%{url_effective}" -X ${method} -I "${url}"`;
		exec(cmd, (error, out) => {
			if (error) {
				console.log(chalk.red(error.message));
				process.exit(1);
			}
			resolve(out);
		});
	});
}

/**
 * @typedef {Object} RedirectionConfig
 * @property {string} from The origin URL.
 * @property {string} to The target URL.
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

/**
 * Test a redirection.
 * @param {RedirectionConfig} options
 * @return {Promise<RedirectionResult>}
 */
async function redirectionTest(options) {
	const { from, to } = options;
	return new Promise(async (resolve, reject) => {
		const out = await getFinalRedirect(from);

		const delayingFn = typeof OPTIONS.delay === 'number' ? wait : () => {};

		if (out !== to) {
			const msg = `🚫 ${chalk.white(from)} → ${chalk.red.strikethrough(
				to
			)} → ${chalk.magentaBright(out)}`;
			const diff = diffStringsUnified(to, out, DIFF_OPTIONS);
			console.log(msg);

			await delayingFn(OPTIONS.delay);
			reject({ msg, from, to, out, diff });
		} else {
			const msg = `✅ ${chalk.white(from)} ${chalk.black('→')} ${chalk.blue(
				to
			)}`;
			console.log(msg);
			await delayingFn(OPTIONS.delay);
			resolve({ msg, from, to, out });
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

	const queue = fastq.promise(redirectionTest, OPTIONS.concurrency);
	const runners = config.map((options) => queue.push(options));

	const total = runners.length;
	Promise.allSettled(runners).then((results) => {
		const rejected = results.filter((r) => r.status === 'rejected');
		const totalRejected = rejected.length;

		console.log('');

		if (totalRejected > 0) {
			if (totalRejected !== total) {
				console.log(chalk.green`${total - totalRejected} test passed.`);
			}

			console.log(chalk.red`❌ ${totalRejected} out of ${total} tests failed:`);
			console.log('');
			rejected.forEach(({ reason }) => {
				console.log(reason.msg, '\n');
				console.log(reason.diff, '\n');
			});
			process.exit(1);
		} else {
			console.log(chalk.green`🎉 All ${total} redirection tests passed!`);
		}
	});
}
