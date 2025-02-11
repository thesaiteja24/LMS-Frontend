module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'], // Adjust paths based on your project structure
  theme: {
    extend: {
      colors: {
        "primary-blue": "#0059a0",
        "secondary-purple": "#4f46e5",
      },
      animation: {
        pulse: "pulse 2s infinite",
        bounce: "bounce 2s infinite",
      },
    },
  },
  plugins: [],
};
