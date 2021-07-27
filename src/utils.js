import { readFileSync } from 'fs';

/**
 * Import a JSON file.
 *
 * @param {string} path The path to the JSON file.
 * @param {string} base The base path from which the import should be resolved.
 * @return {Object}
 */
export function importJson(path, base) {
	return JSON.parse(readFileSync(new URL(path, base)).toString());
}

/**
 * Wait for a given delay.
 *
 * @param {number} delay = 0 The time to wait in milliseconds.
 * @return {Promise<number>}
 */
export async function wait(delay = 0) {
	return new Promise((resolve) => {
		setTimeout(() => resolve(delay), delay);
	});
}