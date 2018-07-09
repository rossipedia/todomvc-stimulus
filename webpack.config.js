const HtmlWebpackPlugin = require('html-webpack-plugin');
const IncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.ts'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
            },
        ],
    },
    plugins: [
        new CopyPlugin([
            {
                from: 'node_modules/todomvc-app-css/index.css',
                to: '.',
            },
        ]),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
        }),
        new IncludeAssetsPlugin({
            assets: ['index.css'],
            append: false,
        }),
    ],
};
