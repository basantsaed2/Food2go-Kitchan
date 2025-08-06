/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        TextFontLight: ["Light"],
        TextFontRegular: ["Regular"],
        TextFontMedium: ["Medium"],
        TextFontSemiBold: ["SemiBold"],
        TextFontBold: ["Bold"],
                sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        mainColor: "#9E090F",
        secoundColor: "#6B6A6A",
        thirdColor: "#6B6A6A",
        AddText: "#5E5E5E",

         // Main Brand Reds
        'brand-red': '#E44D26', // Primary strong red
        'brand-light-red': '#FFDBD1', // Lighter red for accents/background gradient start
        'brand-pink-end': '#FFC4B4', // Slightly pinker for gradient end

        // Status Greens
        'status-green': '#28A745', // Strong green for "Done"
        'status-light-green': '#D4EDDA', // Light green background for "Done" status button

        // Status Yellow/Orange
        'status-yellow': '#FFC107', // Yellow for "Cooking"
        'status-light-yellow': '#FFF3CD', // Light yellow background for "Cooking" status button

        // Status Blue (from original image)
        'status-blue': '#007BFF', // Strong blue for "Confirmed" text
        'status-light-blue': '#CCE5FF', // Light blue background for "Confirmed" status button

        // Neutrals
        'background-main': '#F8F9FA', // Very light grey for main content background
        'card-bg': '#FFFFFF', // White for card backgrounds
        'border-light': '#E0E0E0', // Light grey for borders
        'text-primary': '#343A40', // Dark grey for main text
        'text-secondary': '#6C757D', // Mid grey for secondary text
        'text-lighter': '#ADB5BD', // Lighter grey for placeholders/subtle info
      },
        boxShadow: {
        'smooth': '0 4px 12px rgba(0, 0, 0, 0.08)', // Softer shadow for cards/summary
        'elevated': '0 25px 50px -12px rgba(0, 0, 0, 0.15)', // More refined shadow for main container
      },
      backgroundColor: {
        mainBgColor: "#E5E5E5",
        secoundBgColor: "#F5F5F5",
        thirdBgColor: "#9D9D9D",
        AddButton: "#ffffff",
      },
      screens: {
        sm: "320px",
        md: "640px",
        lg: "740px",
        xl: "1280px",
        // "2xl": "1536px",
      },
    },
  },
  plugins: [],
};
