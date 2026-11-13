// Preserve the portal theme and scan the static page and rendered templates.
module.exports = {
    content: ["./index.html", "./js/**/*.js"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "on-secondary-container": "#606365",
                "primary": "#004ac6",
                "surface": "#f8f9ff",
                "on-background": "#121c2a",
                "surface-variant": "#d9e3f6",
                "surface-container": "#e6eeff",
                "surface-bright": "#f8f9ff",
                "on-surface": "#121c2a",
                "error-container": "#ffdad6",
                "on-surface-variant": "#434655",
                "secondary-container": "#dee0e2",
                "background": "#f8f9ff",
                "tertiary": "#006242",
                "primary-container": "#2563eb",
                "error": "#ba1a1a",
                "outline": "#737686",
                "on-tertiary": "#ffffff",
                "tertiary-container": "#007d55",
                "on-error": "#ffffff",
                "surface-container-high": "#dee9fc",
                "surface-container-low": "#eff4ff",
                "on-error-container": "#93000a",
                "surface-container-lowest": "#ffffff",
                "outline-variant": "#c3c6d7",
                "on-primary": "#ffffff",
                "secondary": "#5c5f60",
                "on-secondary": "#ffffff",
                "primary-fixed": "#dbe1ff"
            },
            fontFamily: {
                body: ["Inter", "sans-serif"],
                headline: ["Inter", "sans-serif"]
            },
            boxShadow: {
                ambient: "0px 10px 15px -3px rgba(0, 0, 0, 0.05)"
            }
        }
    },
    plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")],
};
