import React from "react";

const SectionSeparator = () => (
    <div className="relative flex items-center justify-center my-4 md:my-0 md:mx-4">
        <div className="hidden md:block h-full w-1 bg-gradient-to-b from-[var(--first-color)] to-pink-200 rounded-full opacity-30"></div>
        <div className="md:hidden w-full h-1 bg-gradient-to-r from-[var(--first-color)] to-pink-200 rounded-full opacity-30"></div>
        <div className="absolute hidden md:flex items-center justify-center w-10 h-10 bg-white border-2 border-[var(--first-color)] rounded-full shadow-lg z-10">
            <span className="text-lg">🔔</span>
        </div>
    </div>
);

export default SectionSeparator;
