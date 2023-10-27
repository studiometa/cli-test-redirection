# Redirection test CLI

> Easily test your redirection plan.

## Usage

You can directly use the CLI with `docker`:

```sh
docker run -it --rm -v $PWD:/app studiometa/test-redirection redirects.csv 
```

Or with `npx`:

```sh
npx @studiometa/cli-test-redirection redirects.csv
```

Or you can install it globally:

```sh
npm install -g @studiometa/cli-test-redirection
test-redirection redirects.csv
```

The `redirects.csv` file should have 2 columns: the first one is the original URL, the second is the redirected URL.

### Mock hosts to test redirects before deploying

The Docker image can configure an Apache environment to test request against a mocked environment. 

```sh
# Create your .htaccess file with redirections to test
vim .htaccess

# Create a CSV fiels containing from,to URLS
vim redirects.csv

# Configure the temporary hosts referenced in your redirects, they will be configured in the Docker container
export DOMAINS='fqdn.com,www.fqdn.com'

# Run the Docker image by linking the current directy to /app
docker run -it --rm -v $PWD:/app -e DOMAINS studiometa/cli-test-redirection redirects.csv 
```

## Parameters

### `--concurrecy [number]`

Limit the number of tests running concurrently.

```bash
# Limit to 1 test
test-redirection --concurrency 1 path/to/redirects.csv
test-redirection -c 1 path/to/redirects.csv
```

### `--delay [number]`

Add a delay in milliseconds between batch of tests.

```bash
# Wait for 1s between each batch of tests
test-redirection --delay 1000 path/to/redirects.csv
test-redirection -d 1000 path/to/redirects.csv

# Wait for 1s between each tests
test-redirection --delay 1000 --concurrency 1 path/to/redirects.csv
test-redirection -d 1000 -c 1 path/to/redirects.csv
```

### `--ignore-query-parameters`

Ignore query parameters when comparing the final URL with the target URL defined in the config.

```bash
test-redirection --ignore-query-parameters path/to/config.json
```

### `--parser [json|csv]`

Define how the input file should be parsed. The parser is inferred by the given file extension.

```bash
test-redirection path/to/file.csv --parser csv
```

### `--replace-host`

Replace the host from the values in the configuration file to easily test against different environment.

```bash
test-redirection path/to/config.json --replace-host preprod.fqdn.com
```

### `-v, --verbose`

Display verbose output.

```bash
test-redirection path/to/config.json -v
```

### `--only-errors`

When in verbose mode, will only print errors to the console. Useful when you have hundreds of redirections with only a few one failing.

```bash
test-redirection path/to/config.json -v --only-errors
```

### `--user`

Define basic auth user. This parameter is directly passed to the underlying `curl` command.

```bash
test-redirection path/to/config.json --user user:password
```
