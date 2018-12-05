const webpack = require("webpack");
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const tsImportPluginFactory = require('ts-import-plugin')

module.exports = {
    entry: {
        options: path.join(__dirname, '../src/options.ts'),
        popup: path.join(__dirname, '../src/popup.ts'),
        background: path.join(__dirname, '../src/background.ts'),
        content_script: path.join(__dirname, '../src/content_script.ts')
    },
    output: {
        path: path.join(__dirname, '../dist/js'),
        filename: '[name].js',
    },
    optimization: {
        splitChunks: {
            name: 'vendor',
            chunks: "initial"
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                // options: {
                //     getCustomTransformers: () => {
                //         before: [tsImportPluginFactory({
                //             libraryDirectory: 'es',
                //             libraryName: 'antd',
                //             style: 'css',
                //         })]
                //     }
                // },
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.css']
    },
    plugins: [
        // exclude locale files in moment
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new CopyWebpackPlugin([
            {
                context: 'static',
                from: '*',
                to: '../'
            }
        ])
    ]
};
