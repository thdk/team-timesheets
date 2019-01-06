# Timesheets app

Web base timesheet app. Built to replace old school excel timesheets.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

## Node

If you don't have node installed yet, install [node](https://nodejs.org/en/download/)

## Firebase

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

### Installing

Install dependencies

    npm install

Build everything (outputs will live in `dist/`-directory)

    npm run build

Start development server with hot reloading (open `http://localhost:3000/`)

    npm start

## Running the tests

    npm run test (Sorry, no tests yet 👎)

## Deployment

    The whole project is set up to be deployed with firebase.

    Running `firebase deploy` will deploy:
    * Hosting: Everything in the dist folder will be deployed in a firebase hosting site. **Warning this will deploy to both production and develop environment!!! (See Hosting below)**
    * Firestore: Will set up read, write, update and delete rules from firestore.rules file on the active Firebase Firestore database. Will also set up the database indexes from *firestore.indexes.json*
    * Functions: All functions from the functions subpackage of this project will be build and deployed as Firebase functions.

## Hosting

    To seperate a development environment from the production environment you'll need to setup two sites in the Firebase Hosting console.

    * sitename
    * sitename-dev

    This project will use **dev** and **production** as target names for the hosting environments.

    You'll need to map each target name with one of your firebase sites.

    `firebase target:apply hosting [target-name] [resource-name]`

    So you 'll have to run something like:
    `firebase target:apply hosting dev sitename-dev`
    `firebase target:apply hosting production sitename`

    These settings will be stored in the file called: *.firebasesrc*

    To deploy you site to the development/production environment run:

    `firebase deploy --only hosting:dev`
    `firebase deploy --only hosting:production`

    **REMARK**
    Running firebase deploy or firebase deploy --only hosting will deploy the same data to both develop and production environment! DON'T do that.
##


## Built With

* Typescript
* React
* Mobx
* Rollup
* Gulp
* Material Design ([Material Components for the web](https://github.com/material-components/material-components-web))

## Contributing

Feel free to contribute!

## Authors

* **Thomas Dekiere** - *Initial work* - [thdk](https://github.com/thdk)

## License

No license yet. See [no permission](https://choosealicense.com/no-permission/).