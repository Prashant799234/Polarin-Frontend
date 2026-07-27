/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          1: '#f6feff',
          2: '#effcfd',
          3: '#b1f1f6',
          4: '#3696b1',
          5: '#227a93',
          6: '#0a3954',
        },
        secondary: {
          1: '#f6f9fc',
          2: '#e6ecf3',
          3: '#e2e8f1',
          4: '#c5d0df',
          5: '#94a7c4',
          6: '#7e93b2',
          7: '#0a3954',
        },
        red: {
          2: '#ffe2e1',
          3: '#ffb6c1',
          4: '#ff4c61',
          5: '#d8233a',
        },
        blue: {
          2: '#d3e7fe',
          3: '#b8dbff',
          5: '#1367d6',
        },
        yellow: {
          2: '#fffbdb',
        },
        orange: {
          3: '#ffd8b8',
        },
      },
      fontFamily: {
        lato: ['Lato', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        card: '0px 1px 2px 0px rgba(0,0,0,0.03), 0px 1px 6px -1px rgba(0,0,0,0.02), 0px 2px 4px 0px rgba(0,0,0,0.02)',
        'btn-sec': '0px 2px 0px #c5d0df',
        'btn-danger': '0px 2px 0px #d8233a',
        table: '0px 1px 2px 0px rgba(58,58,58,0.05)',
      },
      borderRadius: {
        xl2: '16px',
      },
    },
  },
  plugins: [],
}
