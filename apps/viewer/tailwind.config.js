/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Tokens del sistema de diseño
      colors: {
        // Colores semánticos
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          900: '#7f1d1d',
        },
        // Colores para backgrounds dinámicos de bots
        bot: {
          default: '#ffffff',
          transparent: 'transparent',
        },
      },
      // Tipografía del sistema
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
      },
      // Espaciado personalizado
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
    },
  },
  plugins: [],
  // Optimización para producción
  corePlugins: {
    preflight: true,
  },
  // Clases que siempre se mantienen
  safelist: [
    'h-screen',
    'w-full',
    'flex',
    'items-center',
    'justify-center',
    'flex-col',
    'px-4',
    'font-bold',
    'text-3xl',
    'text-2xl',
    'text-lg',
    'text-center',
    'text-error-600',
    'text-black',
  ],
}
