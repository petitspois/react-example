var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
var pathToReact = path.resolve(node_modules, 'react/dist/react.min.js');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
    entry: path.resolve(__dirname, './app/main.js'),
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'bundle.js',
    },
    resolve:{
        alias: {
          'react': pathToReact
        }
    },
    module: {
        noParse: [pathToReact],
        loaders: [{
            test: /\.js$/,
            loader: 'babel'
        },
        {
            test: /\.scss$/,
            loader: 'style!css!sass'
        }]
    }
};
