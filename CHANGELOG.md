# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add `--replace-(from|to)-host` flags ([d738fc1](https://github.com/studiometa/cli-test-redirection/commit/d738fc1))

### Changed

- Improve logging ([3bbbc1e](https://github.com/studiometa/cli-test-redirection/commit/3bbbc1e))

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
