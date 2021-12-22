# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v2.1.0](https://github.com/thdk/team-timesheets/compare/v2.0.2...v2.1.0)

### Fixed

- feat: prevent deletion of used projects [`#78`](https://github.com/thdk/team-timesheets/issues/78)

### Commits

- test: add tests for projects page [`07e8a37`](https://github.com/thdk/team-timesheets/commit/07e8a37a93fd65e4bfe2d14853dc01896158674a)
- test: fix warning in favorite detail tests [`12cc6ae`](https://github.com/thdk/team-timesheets/commit/12cc6aef1bec739af2c3b93808c24793bd95a589)

## [v2.0.2](https://github.com/thdk/team-timesheets/compare/v2.0.1...v2.0.2) - 2021-11-04

### Commits

- ci: don't run tests when deploy is triggered [`9a19a00`](https://github.com/thdk/team-timesheets/commit/9a19a0084e4cf3310a63ce0199dac7306b4d7fbb)

## [v2.0.1](https://github.com/thdk/team-timesheets/compare/v2.0.0...v2.0.1) - 2021-11-04

### Commits

- chore: configure auto-changelog [`cbe65de`](https://github.com/thdk/team-timesheets/commit/cbe65de6bd4b1c026bd04834b545fa58e1394883)
- ci: create .env file with container env variables [`261368a`](https://github.com/thdk/team-timesheets/commit/261368aa621ac8046c8328e920db5cbbe42336ef)

## [v2.0.0](https://github.com/thdk/team-timesheets/compare/v1.4.0...v2.0.0) - 2021-11-04

### Fixed

- feat: add preference setting to set number of recent projects to use [`#217`](https://github.com/thdk/team-timesheets/issues/217)

### Commits

- Bump y18n from 4.0.0 to 4.0.1 [`af9f950`](https://github.com/thdk/team-timesheets/commit/af9f950d4386b46f837bb6be4a0b5752aa8b6323)
- chore: make everything work with latest versions of mobx, firebase, ... [`4ab6cc7`](https://github.com/thdk/team-timesheets/commit/4ab6cc71eb11378b6b18d9900f8a8ebcd1156944)
- chore: ugprade firebase-tools and firebase-admin [`44656c8`](https://github.com/thdk/team-timesheets/commit/44656c87e0a96b199482d502d4e0e1a3e58e982e)

## [v1.4.0](https://github.com/thdk/team-timesheets/compare/v1.3.1...v1.4.0) - 2021-06-20

### Fixed

- feat: add preference setting to set number of recent projects to use [`#217`](https://github.com/thdk/team-timesheets/issues/217)

## [v1.3.1](https://github.com/thdk/team-timesheets/compare/v1.3.0...v1.3.1) - 2021-04-06

### Commits

- ci: increase timeout for deploy build [`21943ae`](https://github.com/thdk/team-timesheets/commit/21943ae7b74d20d628cbce53d36de5072e77108b)
- feat: add option to overwrite existing favorite group [`a15e11e`](https://github.com/thdk/team-timesheets/commit/a15e11e6771fdb0dbd8a93b6c8f506b0b378ddca)

## [v1.3.0](https://github.com/thdk/team-timesheets/compare/v1.2.22...v1.3.0) - 2021-04-06

### Merged

- feat/override favorite group [`#206`](https://github.com/thdk/team-timesheets/pull/206)

### Commits

- feat: add fav group combox box to fav group form to overwrite existing fav group [`39faec2`](https://github.com/thdk/team-timesheets/commit/39faec20d1bcd541f5a0de16d21d5191acf6cf60)
- feat: allow to override existing favorite registration group [`85dc8d2`](https://github.com/thdk/team-timesheets/commit/85dc8d21fb231694f09b6afd92ceb0ce596941f3)
- test: add test for favorite group detail page [`7ef64ba`](https://github.com/thdk/team-timesheets/commit/7ef64ba696764a9a764cf89bbd230289bf20d186)

## [v1.2.22](https://github.com/thdk/team-timesheets/compare/v1.2.21...v1.2.22) - 2021-02-15

### Commits

- fix: deleted registrations should still be synced to biqquery reports [`3a13d7c`](https://github.com/thdk/team-timesheets/commit/3a13d7c26ea2f5e0e7e600baf78e381b0c8203e8)

## [v1.2.21](https://github.com/thdk/team-timesheets/compare/v1.2.20...v1.2.21) - 2021-02-01

### Fixed

- fix: favorite menu isn't fully displayed [`#204`](https://github.com/thdk/team-timesheets/issues/204)

## [v1.2.20](https://github.com/thdk/team-timesheets/compare/v1.2.19...v1.2.20) - 2021-01-31

### Commits

- fix: top app bar css is not loaded [`21b2067`](https://github.com/thdk/team-timesheets/commit/21b206741ccae1f2de5ce620bd65e3decdea2d00)
- feat: override browser save dialog when in inline edit mode of a registration [`fe2f1ab`](https://github.com/thdk/team-timesheets/commit/fe2f1abe219630008fde90b93adbf4ddfc4655ed)
