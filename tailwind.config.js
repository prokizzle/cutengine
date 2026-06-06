/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        positive: "#34c759",
        attention: "#ff9f0a",
        warning: "#ff3b30",
        info: "#007aff",
        anaerobic: "#af52de",
        "surface-primary": "#1c1c1e",
        "surface-secondary": "#2c2c2e",
        "surface-tertiary": "#3a3a3c",
        "text-primary": "#ffffff",
        "text-secondary": "#ebebf5",
        "text-tertiary": "#8e8e93",
      },
    },
  },
  plugins: [],
};
