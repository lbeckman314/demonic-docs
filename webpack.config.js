const webpack = require('webpack');

module.exports = {
    entry: {
        docs: './src/demonic-docs.js',
    },
    output: {
        path: __dirname,
        filename: './dist/demonic-[name].bundle.js',
        library: 'DemonicDocs',
        libraryTarget: 'umd',
        chunkFilename: '[name]-[chunkhash].js',
        globalObject: 'this',
    },
    watchOptions: {
        poll: true
    },
    target: 'web',
    watch: false,
    devtool: 'eval-source-map',
    devServer: {
        port: 5000
    },
    cache: true,
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
};

