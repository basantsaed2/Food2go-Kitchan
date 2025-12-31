import React from "react";

const ChefDialog = ({ chefData, t, handleLogout, setShowChefDialog }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative flex flex-col items-center">
            <button
                onClick={() => setShowChefDialog(false)}
                className="absolute top-4 right-4 text-2xl"
            >
                &times;
            </button>
            <div className="w-20 h-20 rounded-full bg-[var(--first-color)] text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-lg">
                {chefData.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{chefData.name}</h2>
            <p className="text-gray-500 text-sm mb-2">{chefData.branch}</p>
            <p className="text-gray-400 text-xs mb-8">{chefData.phone}</p>
            <button
                onClick={handleLogout}
                className="w-full py-3 bg-[var(--first-color)] text-white rounded-xl font-bold hover:shadow-lg transition-transform active:scale-95"
            >
                {t.logout}
            </button>
        </div>
    </div>
);

export default ChefDialog;
