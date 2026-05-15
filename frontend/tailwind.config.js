export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
          text: '#F9FAFB',
          muted: '#9CA3AF',
          primary: '#7C3AED',
          accent: '#22C55E',
          danger: '#EF4444',
          warning: '#F59E0B'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
};
