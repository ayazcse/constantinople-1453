/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#10121A',
          soft: '#171A25',
          panel: '#1C2030',
          line: '#2A2F42',
        },
        parchment: {
          DEFAULT: '#ECE3CE',
          dim: '#C7BC9F',
          faint: '#8C8570',
        },
        gold: {
          DEFAULT: '#C6A24E',
          bright: '#E8C579',
          dim: '#8A6E36',
        },
        byz: {
          DEFAULT: '#6B4088',
          bright: '#8E5FB0',
          dim: '#432A56',
        },
        ottoman: {
          DEFAULT: '#A23B3B',
          bright: '#C85252',
          dim: '#5E2323',
        },
        verdigris: {
          DEFAULT: '#3E6E64',
          bright: '#57937F',
          dim: '#28453F',
        },
      },
      fontFamily: {
        display: ['"Newsreader Variable"', 'Georgia', 'serif'],
        body: ['"IBM Plex Sans Condensed"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widish: '0.04em',
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(198,162,78,0.15), 0 12px 30px -12px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'grain': "radial-gradient(circle at 1px 1px, rgba(236,227,206,0.05) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
}
