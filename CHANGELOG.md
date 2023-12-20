# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## v0.7.3 (2023-12-20)

### Changed

- Add support for ARM architecture ([acf5569](https://github.com/studiometa/cli-test-redirection/commit/acf5569))

## v0.7.2 (2023-10-27)

### Fixed

- Fix bin path ([bcc450b](https://github.com/studiometa/cli-test-redirection/commit/bcc450b))

## v0.7.1 (2023-10-27)

### Fixed

- Fix NPM bin path ([5694cb4](https://github.com/studiometa/cli-test-redirection/commit/5694cb4))

## v0.7.0 (2023-10-27)

### Added

- Add support for executing sh in the Docker container ([#6](https://github.com/studiometa/cli-test-redirection/pull/6))

### Fixed

- Fix Docker image build ([#6](https://github.com/studiometa/cli-test-redirection/pull/6))

### Changed

- ⚠️ Drop CJS support ([#6](https://github.com/studiometa/cli-test-redirection/pull/6))

## v0.6.1 (2023-10-27)

### Fixed

- Fix Docker image name in GitHub Action ([79416e0](https://github.com/studiometa/cli-test-redirection/commit/79416e0))

## v0.6.0 (2023-10-27)

### Added

- Add a Docker image for advanced usage with host mocking ([#3](https://github.com/studiometa/cli-test-redirection/pull/3))
- Add `--replace-(from|to)-host` flags ([d738fc1](https://github.com/studiometa/cli-test-redirection/commit/d738fc1))

### Changed

- Improve logging ([3bbbc1e](https://github.com/studiometa/cli-test-redirection/commit/3bbbc1e))
- ⚠️ Bump Node version to >=20 ([#3](https://github.com/studiometa/cli-test-redirection/pull/3))

### Deleted

- ⚠️ Remove the `--password` parameter in favor of a single `--user user:pass` parameter ([#3](https://github.com/studiometa/cli-test-redirection/pull/3))

### Fixed

- Decode output URL ([1de1585](https://github.com/studiometa/cli-test-redirection/commit/1de1585))

## v0.5.0 (2022-03-25)

### Added

- Add support for basic auth ([786a53e](https://github.com/studiometa/cli-test-redirection/commit/786a53e))
- Add support for host replacement from CSV file ([d78ab82](https://github.com/studiometa/cli-test-redirection/commit/d78ab82))
- Add support for CSV input file ([549f568](https://github.com/studiometa/cli-test-redirection/commit/549f568))

### Changed

- Improve logging ([175e75e](https://github.com/studiometa/cli-test-redirection/commit/175e75e))
- Improve curl error logging ([14a183e](https://github.com/studiometa/cli-test-redirection/commit/14a183e))
- Update dependencies ([88ce93a](https://github.com/studiometa/cli-test-redirection/commit/88ce93a))

## v0.4.0 (2021-07-27)

### Added

- Add support for custom method (GET, POST, etc.) when testing a redirection

## v0.3.0 (2021-07-27)

### Added

- Add support for ignoring query parameters
  - Globally with the `--ignore-query-parameters` CLI parameter
  - Per test with the `ignoreQueryParameters` property

### Changed

- Improve CLI documentation

## v0.2.0 (2021-07-27)

### Added

- Add `--delay` CLI parameter
- Add `--concurrency` CLI parameter

### Fixed

- Set minimum Node compatibility to 12

### Changed

- Switch from CJS to ESM
- Improve logging
