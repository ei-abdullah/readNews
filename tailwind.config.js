/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        lightGray: "rgb(217, 217, 217)",
        paleChestnut: "rgb(223, 141, 141)",
        charcoal: "rgb(54, 69, 79)",
        darkGray: "rgb(33, 33, 33)",
      },
      fontFamily: {
        dmSerif: ['"DM Serif Text"', "serif"],
      },
      height: {
        boxHeight: "calc(92.2vh - 7.2rem - 3 * 2.4rem)",
      },
      noScrollBar: {},
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hidden": {
          "-ms-overflow-style": "none" /* IE and Edge */,
          "scrollbar-width": "none" /* Firefox */,
        },
        ".scrollbar-hidden::-webkit-scrollbar": {
          display: "none" /* Safari and Chrome */,
        },
      });
    },
  ],
};
