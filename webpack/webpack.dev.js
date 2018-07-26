const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        contentBase: './dist',
        port: 3000,
        inline: true,
        hot: true,
        openPage: 'options.html'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
});
