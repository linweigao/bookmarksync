const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    plugins: [
        new CopyWebpackPlugin([
            {
                context: 'static/dev',
                from: 'options.html',
                to: '../',
                force: true
            }
        ])
    ]
});
