module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: 'media', // or 'media' or 'class'
    theme: {
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [
        require('daisyui')
    ],
    daisyui: {
        themes: [
            {
                light: {
                    "color-scheme": "light",
                    "primary": "#06974c",
                    "primary-content": "#e5e5e5",
                    "secondary": "#0c93e8",
                    "secondary-content": "#e5e5e5",
                    "accent": "#ff71cf",
                    "accent-content": "#e5e5e5",
                    "neutral": "#2a323c",
                    "neutral-content": "#e5e5e5",
                    "base-100": "#ebebeb",
                    "base-200": "#f0f0f0",
                    "base-300": "#F5F5F5",
                    "base-content": "#151515",
                    "--rounded-box": "1rem",
                    "--rounded-btn": "0.5rem",
                    "--rounded-badge": "1.9rem",
                    "--animation-btn": "0.25s",
                    "--animation-input": ".2s",
                    "--btn-focus-scale": "0.95",
                    "--border-btn": "1px",
                    "--tab-border": "1px",
                    "--tab-radius": "0.5rem",
                },
                dark: {
                    "color-scheme": "dark",
                    "primary": "#06974c",
                    "primary-content": "#e5e5e5",
                    "secondary": "#0c93e8",
                    "secondary-content": "#e5e5e5",
                    "accent": "#ff71cf",
                    "accent-content": "#e5e5e5",
                    "neutral": "#2a323c",
                    "neutral-content": "#e5e5e5",
                    "base-100": "#1d232a",
                    "base-200": "#191e24",
                    "base-300": "#151515",
                    "base-content": "#e5e5e5",
                    "--rounded-box": "1rem",
                    "--rounded-btn": "0.5rem",
                    "--rounded-badge": "1.9rem",
                    "--animation-btn": "0.25s",
                    "--animation-input": ".2s",
                    "--btn-focus-scale": "0.95",
                    "--border-btn": "1px",
                    "--tab-border": "1px",
                    "--tab-radius": "0.5rem",
                }
            },
        ],
    },
};
