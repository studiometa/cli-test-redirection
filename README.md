# Redirection test CLI

> Easily test your redirection plan.

## Usage

You can directly use the CLI with `npx`:

```sh
npx @studiometa/cli-test-redirection path/to/config.json
```

Your `config.json` file sould contain an array of objects with both `from` and `to` properties describing the origin and the target to test. For example:

```json
[
  {
    "from": "http://fqdn.com",
    "to": "https://www.fqdn.com",
    "ignoreQueryParameters": false,
    "method": "GET"
  }
]
```
The `ignoreQueryParameters` property allow to ignore query parameters in the final URL before comparing it with the `to` URL as some redirection directives will keep them.

## Options

### `--concurrecy [number]`

Limit the number of tests running concurrently.

```bash
# Limit to 1 test
test-redirection --concurrency 1 path/to/config.json
test-redirection -c 1 path/to/config.json
```

### `--delay [number]`

Add a delay in milliseconds between batch of tests.

```bash
# Wait for 1s between each batch of tests
test-redirection --delay 1000 path/to/config.json
test-redirection -d 1000 path/to/config.json

# Wait for 1s between each tests
test-redirection --delay 1000 --concurrency 1 path/to/config.json
test-redirection -d 1000 -c 1 path/to/config.json
```

### `--ignore-query-parameters`

Ignore query parameters when comparing the final URL with the target URL defined in the config.

```bash
test-redirection --ignore-query-parameters path/to/config.json
```

