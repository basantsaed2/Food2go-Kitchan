import React from "react";

const OrderSkeleton = () => (
    <div className="bg-white rounded-2xl p-5 shadow-lg flex flex-col justify-between animate-pulse">
        <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
        </div>
        <div className="flex justify-between mt-4">
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
    </div>
);

export default OrderSkeleton;
