const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: "production",
    entry: {
        app: './src/app.tsx',
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".wasm", ".ts", ".tsx", ".mjs", ".cjs", ".js", ".json", ".scss"],
        modules: ["src", "node_modules"],
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].[contenthash].js',
        publicPath: '/',
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000,
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            },
        ]
    },

    plugins: [
        new webpack.ProgressPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin(
            {
                template: 'src/index.html',
            }
        ),
        new Dotenv(),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/images'),
                    to: path.resolve(__dirname, 'dist/images'),
                },
                path.resolve(__dirname, 'src/manifest.json'),
                path.resolve(__dirname, 'src/browserconfig.xml'),
                path.resolve(__dirname, 'src/images/icons/safari-pinned-tab.svg'),
                path.resolve(__dirname, 'src/images/icons/favicon.ico'),
            ],
        }),
    ],
};