# Timesheets app

Web base timesheet app. Built to replace old school excel timesheets.

Demo:
* Master branch - [Latest release](https://timesheets-ffc4b.firebaseapp.com)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

#### Node

If you don't have node installed yet, install [node](https://nodejs.org/en/download/)

#### Firebase tools

npm install -g firebase-tools

#### Firebase

The project is build entirely for Google Cloud Firebase.

##### Firebase project

To seperate a development environment from the production environment you'll need two firebase projects so you can deploy dev and production seperately.

If you want develop for an existing project, ask the project admin to add you as a user for that firebase project.

You can manage firebase projects from the [Firebase console](https://console.firebase.google.com).

I have two firebase projects: 

* dev-thdk-timesheets
* thdk-timesheets

Follow the instructions below for each environment you want to configure.

##### Get authenticated

`firebase login`

##### Select firebase project
`firebase use --add`

(follow instructions)

(I'll use *dev* as alias for *dev-thdk-timesheets* project and *production* for *thdk-timesheets* project.)

When your project was succesfully selected, it will be stored in the file called: *.firebasesrc*

##### Firebase hosting

Go back to the firebase console and create a new site from the *hosting* menu.
I've created a site with name *timesheets-web*.

This project will use *web-app* as target name for the hosting environment of the timesheets web app.

You'll need to map each target name with one of your firebase sites. Run the following command form your working directory:

`firebase target:apply hosting [target-name] [resource-name]`

So you 'll have to run something like:

```
firebase target:apply hosting web-app timesheets-web
```

These settings will also be stored in the file called: *.firebasesrc*

This is how *.firebasesrc* file looks like after following the instructions above:

```
{
  "projects": {
    "dev": "dev-thdk-timesheets",
  },
  "targets": {
    "dev-thdk-timesheets": {
      "hosting": {
        "web-app": [
          "timesheets-web"
        ]
      }
    }
  }
}
```

##### Firebase authentication

From the firebase console, go to the authentication tab.
Activate authentication and set up the desired authentication providers.

Verify the authorized domain list. You'll need:
* localhost
* your hosting site url

#### Installing

Install dependencies

    npm install

Build everything (outputs will live in `dist/`-directory)

    npm run build

    // run build for production (default is development)
    npm run build:production

Start development server (open `http://localhost:5000/`)

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

## Hosting

To deploy the timesheets application to firebase hosting run:

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