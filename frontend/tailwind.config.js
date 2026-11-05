module.exports = {
    future: {
        hoverOnlyWhenSupported: true,
    },
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: 'media', // or 'media' or 'class'
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
                serif: ['ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
            },
        },
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
                    "primary-content": "#ffffff",
                    "secondary": "#0a6fb0",
                    "secondary-content": "#ffffff",
                    "accent": "#ff71cf",
                    "accent-content": "#2a0a1f",
                    "neutral": "#c9cecb",
                    "neutral-content": "#1d2320",
                    "base-300": "#e6e9e7",
                    "base-200": "#f6f7f6",
                    "base-100": "#ffffff",
                    "base-content": "#151515",
                    "info": "#0a6fb0",
                    "info-content": "#ffffff",
                    "success": "#047a3d",
                    "success-content": "#ffffff",
                    "warning": "#a15c00",
                    "warning-content": "#ffffff",
                    "error": "#c0262d",
                    "error-content": "#ffffff",
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
                    "primary-content": "#ffffff",
                    "secondary": "#4aa8ee",
                    "secondary-content": "#04121d",
                    "accent": "#ff71cf",
                    "accent-content": "#2a0a1f",
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
