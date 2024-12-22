/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: ({ colors }) => ({
        primary : colors.indigo,
        danger : colors.rose,
        warning : colors.yellow,
        success : colors.lime,
        info : colors.blue,
        gray : colors.zinc,
      }),
    }
  },
  plugins: [],
}
