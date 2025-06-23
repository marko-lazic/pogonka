module.exports = {
    entry: {
        htmx: './src/js/htmx-entry.js',
        'htmx-ext-sse': './src/js/htmx-ext-sse-entry.js',
        'tom-select': './src/js/tom-select-entry.js'

    },
    output: {
        path: __dirname + '/public/js',
        filename: '[name].min.js'
    },
    mode: 'production'
};
