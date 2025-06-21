module.exports = {
    entry: {
        htmx: './src/js/htmx-entry.js'
    },
    output: {
        path: __dirname + '/public/js',
        filename: '[name].min.js'
    },
    mode: 'production'
};