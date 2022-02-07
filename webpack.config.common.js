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
    // https://medium.com/hackernoon/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        // get the name. E.g. node_modules/packageName/not/this/part.js
                        // or node_modules/packageName
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                        // npm package names are URL-safe, but some servers don't like @ symbols
                        return `${packageName.replace('@', '')}`;
                    },
                },
            },
        },
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
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            // {
            //     test: /\.js$/,
            //     enforce: "pre",
            //     loader: "source-map-loader"
            // },
        ]
    },

    plugins: [
        new webpack.ProgressPlugin(),
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG)
        }),
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