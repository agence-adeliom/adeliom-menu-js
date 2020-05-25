const webpack = require("webpack");
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const webpackOption = {
    mode: "production",
    entry: {
        menu: './src/Menu.js',
    },
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: '[name].js',
        library: "Menu",
        libraryTarget: "umd"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    "css-loader",
                    "sass-loader"
                ]
            }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                keep_classnames: true,
                keep_fnames: true,
                output: {
                    comments: false,
                },
            },
            extractComments: false
        })]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: `/[name].css`
        }),
    ]
};

module.exports = webpackOption;
