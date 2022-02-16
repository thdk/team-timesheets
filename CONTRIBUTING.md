# Contributing to Team Timesheets

## Getting started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

#### Node

Supported node version: 14

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

#### Add your firebase secrets to .env file

Create a file `.env` in the root this project with the following content:

```
FIREBASE_API_KEY=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxx
FIREBASE_AUTH_DOMAIN=xxxxxxxx.firebaseapp.com
FIREBASE_PROJECT_ID=xxxxxxxxxxxx
FIREBASE_STORAGE_BUCKET=xxxxxxxx.appspot.com
```

(The values for these secrets can be found on your firebase console)

### Running locally

Install dependencies

```sh
    npm install
```

Build common package (only needed once)

```sh
    npm run build:refs
```

Start development server (open `http://localhost:5000/`)

```
    npm run start
```

## Running the tests

Before you can run tests, you must start the firestore emulator.

```shell
npm run emulators
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

For pull requests, and commits on master branch, google cloud build will use `cloudbuild.build.yaml`.

Each time a release tag `v0.0` is pushed to the repository, a build will start using `cloudbuild.deploy.yaml` and deploy the project.

See these files for information of the build steps.