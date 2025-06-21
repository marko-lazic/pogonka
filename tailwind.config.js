module.exports = {
    content: [
        "./views/**/*.{hbs,html}",
        "./public/**/*.{html,js}"
    ],
    theme: {
        extend: {}
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: ["light", "dark"],
    }
};
