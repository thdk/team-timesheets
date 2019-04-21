# Timesheets app

Web base timesheet app. Built to replace old school excel timesheets.

Demo:
* Master branch - [Latest release](https://timesheets-ffc4b.firebaseapp.com)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

#### Node

If you don't have node installed yet, install [node](https://nodejs.org/en/download/)

#### Firebase

**Remark 1:** You can skip Firebase section if you are contributing to an existing project and if you don't have to deploy.

**Remark 2:** If you do are alowed to deploy for an existing project where a firebase project has already been set up, simply ask for the *src/config.ts* and the *.firebasesrc* file of one of your team members and skip this section. Note that you'll need to be added as a user of the firebase project and given correct permissions"

##### Firebase project

The project is build entirely for Google Cloud Firebase.

You'll need to create or select an existing Firebase project from the [Firebase console](https://console.firebase.google.com).

From the project overview page, click **Add an app** and select **Web**

Copy the javascript object with your project configuration settings:

```
{
    apiKey: "YOUR API KEY",
    authDomain: "YOUR AUTH DOMAIN",
    databaseURL: "YOUR DATABASE URL",
    projectId: "YOUR PROJECT ID",
    storageBucket: "YOUR STORAGE BUCKET",
    messagingSenderId: "YOUR MESSAGE SENDER ID"
  }
```

Now copy these into the *src/config-sample.text* and save the file as *src/config.ts*

**Tell firebase cli to use your project:**

`firebase login`
`firebase use --add`

(follow instructions)

When your project was succesfully selected, it will be stored in the file called: *.firebasesrc*

##### Firebase hosting
To seperate a development environment from the production environment you'll need to setup two sites in the Firebase Hosting console.

* sitename
* sitename-dev

This project will use **dev** and **production** as target names for the hosting environments.

You'll need to map each target name with one of your firebase sites.

`firebase target:apply hosting [target-name] [resource-name]`

So you 'll have to run something like:

```
firebase target:apply hosting dev sitename-dev
firebase target:apply hosting production sitename
```

These settings will also be stored in the file called: *.firebasesrc*

##### Firebase authentication

From the firebase console, go to the authentication tab.
Activate authentication and set up the desired authentication providers.

Verify if the authorized domain list. You'll need:
* localhost
* production site domain
* develop site domain

#### Installing

Install dependencies

    npm install

Build everything (outputs will live in `dist/`-directory)

    npm run build

    // run build for production (default is development)
    npm run build:production

Start development server (open `http://localhost:3000/`)

    npm run server

Build (development) and watch scss and ts files

    npm start

## Running the tests

    npm run test (Sorry, no tests yet 👎)

## Deployment

The whole project is set up to be deployed with firebase.

Running `firebase deploy` will deploy:
* Hosting: Everything in the dist folder will be deployed in a firebase hosting site.
* Firestore: Will set up read, write, update and delete rules from firestore.rules file on the active Firebase Firestore database. Will also set up the database indexes from *firestore.indexes.json*
* Functions: All functions from the functions subpackage of this project will be build and deployed as Firebase functions.

**WARNING: Set the environment and build before deployment:**

```
npm run deploy:development
npm run deploy:production
```

These commands will both build the code ánd deploy to all firebase services used by this project.

## Hosting

To deploy the timesheets application to firebase hosting run:

WARNING: Always build the code for the save environment before deploying!
```
firebase deploy --only hosting
```


## Built With

* Typescript
* React
* Mobx
* Rollup
* Gulp
* Material Design ([Material Components for the web](https://github.com/material-components/material-components-web))
* Firebase

## Contributing

Feel free to contribute!

## Authors

* **Thomas Dekiere** - *Initial work* - [thdk](https://github.com/thdk)

## License

No license yet. See [no permission](https://choosealicense.com/no-permission/).