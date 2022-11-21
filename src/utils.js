import chalk from 'chalk';
import { readFileSync } from 'fs';

/**
 * Import a file.
 * @param {string} path The path to the file.
 * @param {string} base The base path from which the import should be resolved.
 * @returns {string}
 */
export function importFile(path) {
  const file = readFileSync(new URL(path, 'file://')).toString();
  return file;
}

/**
 * Import a JSON file.
 *
 * @param {string} path The path to the JSON file.
 * @return {Object}
 */
export function importJson(path) {
  return JSON.parse(importFile(path));
}

/**
 * Parse a CSV file.
 * @param {string} csv
 * @returns {Array<any>}
 * @param {{ delimiter?: string|RegExp }} [options]
 * @returns {Array<{ from: string, to: string }>}
 */
export function csvToJson(csv, { delimiter = ' ', file = '' } = {}) {
  const errors = [];
  const data = csv
    .split('\n')
    .filter(Boolean)
    .map((line, index) => {
      const [from, to] = line.split(delimiter);

      if (!to) {
        errors.push(
          [
            chalk.red`❌ Failed parsing the \`to\` column from CSV file while reading line:`,
            `  ${line}`,
            chalk.grey`  in ${file}:${index + 1}\n`,
          ].join('\n')
        );
      }

      if (!from) {
        errors.push(
          [
            chalk.red`❌ Failed parsing the \`from\` column from CSV file while reading line:`,
            `  ${line}`,
            chalk.grey`  in ${file}:${index + 1}\n`,
          ].join('\n')
        );
      }

      return {
        from,
        to,
      };
    });

  if (errors.length) {
    errors.forEach((error) => console.log(error));
    process.exit(1);
  }

  return data;
}

/**
 * Import a CSV file as a config object.
 * @param {string} path
 * @param {{ delimiter?: string|RegExp }} [options]
 * @returns {Array<{ from: string, to: string }>}
 */
export function importCsv(path, options) {
  return csvToJson(importFile(path), { ...options, file: path });
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
