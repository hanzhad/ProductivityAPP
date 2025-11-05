/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                colors: {
                    'bg-primary': 'rgb(var(--color-bg-primary) / <alpha-value>)',
                    'bg-secondary': 'rgb(var(--color-bg-secondary) / <alpha-value>)',
                    'bg-tertiary': 'rgb(var(--color-bg-tertiary) / <alpha-value>)',
                    'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
                    'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
                    'text-tertiary': 'rgb(var(--color-text-tertiary) / <alpha-value>)',
                    primary: {
                        DEFAULT: '#007AFF',
                        dark: '#0051D5',
                        light: '#4DA2FF',
                    },
                    secondary: {
                        DEFAULT: '#5856D6',
                        dark: '#3634A3',
                        light: '#8583E8',
                    },
                },
                boxShadow: {
                    'sm': 'var(--shadow-sm)',
                    'md': 'var(--shadow-md)',
                    'lg': 'var(--shadow-lg)',
                },
            },
        },
        plugins: [
            require("@kobalte/tailwindcss"),
        ],
    },
}
