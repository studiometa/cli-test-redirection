import { readFileSync } from 'fs';

/**
 * Import a file.
 * @param {string} path The path to the file.
 * @param {string} base The base path from which the import should be resolved.
 * @returns {string}
 */
export function importFile(path, base) {
  return readFileSync(new URL(path, base)).toString();
}

/**
 * Import a JSON file.
 *
 * @param {string} path The path to the JSON file.
 * @param {string} base The base path from which the import should be resolved.
 * @return {Object}
 */
export function importJson(path, base) {
  return JSON.parse(importFile(path, base));
}

/**
 * Parse a CSV file.
 * @param {string} csv
 * @returns {Array<any>}
 * @param {{ delimiter?: string|RegExp }} [options]
 * @returns {Array<{ from: string, to: string }>}
 */
export function csvToJson(csv, { delimiter = ' ' } = {}) {
  return csv.split('\n').filter(Boolean).map((line) => {
    const [from, to] = line.split(delimiter);
    return {
      from: from ?? '',
      to: to ?? '',
    };
  });
}

/**
 * Import a CSV file as a config object.
 * @param {string} path
 * @param {string} base
 * @param {{ delimiter?: string|RegExp }} [options]
 * @returns {Array<{ from: string, to: string }>}
 */
export function importCsv(path, base, options) {
  return csvToJson(importFile(path, base), options);
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
