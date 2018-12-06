// this file exists to fix circular dependencies
// https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de

// The crux of this pattern is to introduce an index.js and internal.js file.
// The rules of the game are as follows:

// 1. The internal.js module both imports and exports everything from every local module in the project
// 2. Every other module in the project only imports from the internal.js file, and never directly from other files in the project.
// 3. The index.js file is the main entry point and imports and exports everything from internal.js that you want to expose to the outside world.
// Note that this step (3) is only relevant if your are publishing a library that is consumed by others.

export * from './components/App';
export * from './routes/timesheets/overview';
export * from './routes/config/projects';