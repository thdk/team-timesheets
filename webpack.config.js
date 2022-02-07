function buildConfig(_, { env: { mode = "dev"}}, c) {

    if (mode === 'dev' || mode === 'prod') {
        return require(`./webpack.config.${mode}.js`)
    } else {
        console.log("Wrong webpack build parameter. Possible choices: 'dev' or 'prod'.")
    }
}

module.exports = buildConfig;
