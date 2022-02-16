function buildConfig(_, { env: { mode = "development"}}) {

    if (mode === 'development' || mode === 'production') {
        return require(`./webpack.config.${mode === "development" ? "dev" : "prod"}.js`)
    } else {
        console.log("Wrong webpack build parameter. Possible choices: 'dev' or 'prod'.")
    }
}

module.exports = buildConfig;
