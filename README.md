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
    "to": "https://www.fqdn.com"
  }
]
```
