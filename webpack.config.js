const path = require('path');
const webpack = require('webpack');

var config = {
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.API_URL': JSON.stringify(process.env.API_URL || 'https://api.purdue.io/odata')
        })
    ]
};

module.exports = (env, argv) => {
    if (argv.mode === 'production') {
        config.devtool = "source-map";
    }
    return config;
};