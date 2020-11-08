# Contributing to Team Timesheets

## Getting started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

#### Node

Supported node version: 10 (I'm using 10.18.0)

#### Firebase tools

```
npm install -g firebase-tools
```

### Firebase

The project is build entirely for Google Cloud Firebase.

#### Firebase project

If you want to develop for an existing project, ask the project admin to add you as a user for that firebase project.

You can [create and/or manage firebase projects here](https://console.firebase.google.com).

Once you have setup your firebase project, continue below.

#### Get authenticated

`firebase login`

#### Select firebase project
`firebase use --add`

(follow instructions)

When your project was succesfully selected, it will be stored in the file called: *.firebasesrc*

### Installing

Install dependencies

    npm install

Build everything (outputs will live in `dist/`-directory)

    npm run build

    // run build for production (default is development)
    npm run build:production

Start development server (open `http://localhost:5000/`)

    npm run server

## Running the tests

Before you can run tests, you must start the firestore emulator.

```shell
npm run emulator
```
Keep the emulator running in one terminal window while running tests in another terminal.

```shell
npm run test
```

If you only need to run the test once, you can use:

```shell
npm run test:emulator
```
This will start the emulator, run the tests and finally also stop the firebase emulator.

## Google cloud build (CI/CD)

A google cloud build trigger has been setup for CI/CD purposes for this repo.

For pull requests, google cloud build will use `cloudbuild.build.yaml`.

Commits on the `develop` branch will trigger a build using `cloudbuild.deploy.yaml` and deploy the project.

See these files for information of the build steps.