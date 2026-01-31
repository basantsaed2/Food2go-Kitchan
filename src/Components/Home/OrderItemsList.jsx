import React from "react";

const OrderItemsList = ({ items, t }) => (
    <div className="text-sm font-semibold text-gray-900 space-y-3">
        <div>
            <span className="font-bold text-[var(--first-color)]">{t.items}:</span>
            <div className="ml-2 mt-1 space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="border-b border-gray-100 pb-1 last:border-0">
                        <div className="flex justify-between">
                            <span>• {item.quantity}x {item.name}</span>
                        </div>
                        {item.notes && (
                            <p className="ml-4 text-xs text-blue-600 italic">
                                {t.note}: {item.notes}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default OrderItemsList;
