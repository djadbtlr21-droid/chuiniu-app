/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: { deep: "#0A0606", surface: "#1A0F0F", elevated: "#2A1818" },
        accent: { red: "#C8102E", redDark: "#8B0000", gold: "#D4AF37", goldLight: "#F4D03F" },
        text: { primary: "#F5E6D3", secondary: "#A89080", muted: "#6B5B4F" },
        dice: { face: "#F8F0E3", pip: "#1A0F0F", pipOne: "#C8102E" }
      },
      fontFamily: {
        kr: ['"Noto Sans KR"', "sans-serif"],
        zh: ['"Noto Sans SC"', "sans-serif"],
        title: ['"ZCOOL XiaoWei"', "serif"]
      }
    }
  },
  plugins: []
}
