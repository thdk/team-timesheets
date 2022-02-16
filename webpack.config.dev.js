const { merge } = require('webpack-merge');
const common = require('./webpack.config.common.js');
const path = require('path');

module.exports = merge(common, {
    mode: "development",
    // Enable sourcemaps for debugging webpack's output.
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.s?(a|c)ss$/,
                use: [
                    // Creates `style` nodes from JS strings
                    "style-loader",
                    // Translates CSS into CommonJS
                    "css-loader",
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            },
        ],
    },
});