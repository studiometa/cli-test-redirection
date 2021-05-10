const { exec } = require('child_process');
const chalk = require('chalk');
const { diffStringsUnified } = require('jest-diff');

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
				// process.exit(1);
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
 * Run tests based on the given config
 * @param {RedirectionConfig[]} config
 * @param {RedirectionOptions} options
 * @return {void}
 */
function run(config, options = {}) {
	console.log('');

	const runners = config.map(({ from, to }) => {
		return new Promise(async (resolve, reject) => {
			const out = await getFinalRedirect(from);
			if (out !== to) {
				const msg = `🚫 ${from} ${chalk.black('→')} ${to}`;
				const diff = diffStringsUnified(to, out);
				console.log(msg, '\n');
				console.log(diff, '\n');
				reject({ msg, from, to, out, diff });
			} else {
				const msg = `✅ ${from} ${chalk.black('→')} ${to}`;
				console.log(msg);
				resolve({ msg, from, to, out });
			}
		});
	});

	Promise.allSettled(runners).then((results) => {
		const rejected = results.filter((r) => r.status === 'rejected');
		const total = rejected.length;

		console.log('');

		if (total > 0) {
			console.log(
				chalk.red`Redirection tests failed with ${total} error${
					total > 1 ? 's' : ''
				}:`
			);
			console.log('');
			rejected.forEach(({ reason }) => {
				console.log(chalk.white(reason.msg), '\n');
				console.log(reason.diff, '\n');
			});
			process.exit(1);
		} else {
			console.log(chalk.green`🎉 All redirection tests passed!`);
		}
	});
}

module.exports = run;
