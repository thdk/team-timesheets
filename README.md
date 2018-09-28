# typescript-start
I start every web project based on this simple project.
It installs the following npm packages:
* typescript
* concurrently
* lite-server
* gulp
* gulp-sass
* rollup
* rollup-plugin-typescript

It makes and src folder with the following:
* app.ts (entry file for the app)
* utils/foo.ts (dummy module)
* style (contains two dummy scss files styles.scss and _vars.scss)

The src folder also contains an index.html file which will be the container for this app.

A gulpfile.js contains tasks to compile typescript and scss files and copy the combined files in the dist folder.
Rollup will bundle the ES bundles into iife format in a single js file which can be understood by a browser
.
The index.html file from src folder is also copied into the dist folder.

The default gulp task will compile and copy all folders as well as watch the typescript and scss files for changes.

# how to get started with this
Simply fork this repo!

Next, to start a new project based on this repo (or your fork):
* Create a new git repository on github called [New_Repo]

From your project folder on your local machine, enter the following commands:
* git clone https://github.com/userName/Repo New_Repo
* cd New_Repo
* git remote set-url origin https://github.com/userName/New_Repo
* git remote add upstream https://github.com/userName/Repo
* git push origin master
* git push --all