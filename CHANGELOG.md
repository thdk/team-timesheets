# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v2.5.1](https://github.com/thdk/team-timesheets/compare/v2.5.0...v2.5.1)

### Commits

- fix: production build not used for deploy [`1338b61`](https://github.com/thdk/team-timesheets/commit/1338b61260af50d967c20b2202fce5648767289e)

## [v2.5.0](https://github.com/thdk/team-timesheets/compare/v2.4.1...v2.5.0) - 2022-02-08

### Fixed

- feat: add checkbox to explicitly provide repo scope when connecting with github account [`#241`](https://github.com/thdk/team-timesheets/issues/241)

### Commits

- deps: upgrade to webpack 5 [`a5803c5`](https://github.com/thdk/team-timesheets/commit/a5803c5cd602596859c64cfe2acaa7092e1ec16f)
- fix: don't rerender suggestions when one provider is refetching to prevent flickr [`3fe9949`](https://github.com/thdk/team-timesheets/commit/3fe99491fa282b586f6e14482e23d208b7d7d0a5)
- style: remove console.log [`5ce027c`](https://github.com/thdk/team-timesheets/commit/5ce027c2e04c431b67fd487e72bd0c0eb651150d)

## [v2.4.1](https://github.com/thdk/team-timesheets/compare/v2.4.0...v2.4.1) - 2022-02-07

### Commits

- fix: add padding to forms [`5d18690`](https://github.com/thdk/team-timesheets/commit/5d18690f241ac335d52802be4359a0e950c85d97)

## [v2.4.0](https://github.com/thdk/team-timesheets/compare/v2.3.0...v2.4.0) - 2022-02-07

### Merged

- feat: implement oauth for authenticating with github [`#239`](https://github.com/thdk/team-timesheets/pull/239)

### Fixed

- feat: implement oauth for authenticating with github (#239) [`#238`](https://github.com/thdk/team-timesheets/issues/238)
- feat: use default project instead of using last used project [`#236`](https://github.com/thdk/team-timesheets/issues/236)

### Commits

- feat: add parameter userId to changeProjectOfRegistrations function [`e0002e9`](https://github.com/thdk/team-timesheets/commit/e0002e978a0201ae587f81b6fd607a57b3dfaf4d)
- feat: change sync time from 6 am to midnight CET [`001602e`](https://github.com/thdk/team-timesheets/commit/001602e8f9af7df77977ceb5433876dd327fa741)

## [v2.3.0](https://github.com/thdk/team-timesheets/compare/v2.2.2...v2.3.0) - 2022-02-02

### Fixed

- feat: show jira updates as timesheet suggestions [`#234`](https://github.com/thdk/team-timesheets/issues/234)

### Commits

- ci: upgrade node version [`e1159e6`](https://github.com/thdk/team-timesheets/commit/e1159e64d3f28afd1187d9205479da8a8f79b230)
- deps: upgrade node-sass and sass-loader [`9ea63dc`](https://github.com/thdk/team-timesheets/commit/9ea63dc7b3343d23600413b2898e5da04ba1a7af)
- refactor: create a seperate component and hook for each registration sugestion source [`8f4dae2`](https://github.com/thdk/team-timesheets/commit/8f4dae20181280ce41a576c34ed180d6f78d9cab)

## [v2.2.2](https://github.com/thdk/team-timesheets/compare/v2.2.1...v2.2.2) - 2022-01-28

### Commits

- fix: missing suggestions from google calendar after adding suggested event [`0a3bfe3`](https://github.com/thdk/team-timesheets/commit/0a3bfe3e33cd2dd5974d32c40e842ee580b25487)
- style: fix typo [`4ba5a10`](https://github.com/thdk/team-timesheets/commit/4ba5a1026258df39943f2712b2613a59503892f6)

## [v2.2.1](https://github.com/thdk/team-timesheets/compare/v2.2.0...v2.2.1) - 2022-01-27

### Fixed

- feat: add github commits as timesheet suggestions [`#231`](https://github.com/thdk/team-timesheets/issues/231)

### Commits

- fix: don't fetch commits when github is not configured [`f4c2726`](https://github.com/thdk/team-timesheets/commit/f4c27260dda81e9476295ea328b4faee352cc022)
- style: remove unused import [`3edf2b7`](https://github.com/thdk/team-timesheets/commit/3edf2b796f1dee1e3c0d7967244661e8ec9f3908)

## [v2.2.0](https://github.com/thdk/team-timesheets/compare/v2.1.0...v2.2.0) - 2022-01-27

### Fixed

- feat: add github commits as timesheet suggestions [`#231`](https://github.com/thdk/team-timesheets/issues/231)

## [v2.1.0](https://github.com/thdk/team-timesheets/compare/v2.0.2...v2.1.0) - 2021-12-22

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
