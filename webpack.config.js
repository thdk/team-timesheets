function buildConfig(env) {
    if (env === 'dev' || env === 'prod') {
        return require(`./webpack.config.${env}.js`)
    } else {
        console.log("Wrong webpack build parameter. Possible choices: 'dev' or 'prod'.")
    }
}

module.exports = buildConfig;
