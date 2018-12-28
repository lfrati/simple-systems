const path = require('path');

module.exports = {
    //mode: 'production',
    entry: ['@babel/polyfill', './src/sketch.js'],
    output: {
        path: `${__dirname}/dist`,
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    performance: { hints: false }
};
