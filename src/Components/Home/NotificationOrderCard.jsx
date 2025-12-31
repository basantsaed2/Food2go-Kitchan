import React from "react";
import OrderTimer from "./OrderTimer";
import OrderItemsList from "./OrderItemsList";

const NotificationOrderCard = ({ order, t, preparingTimeStr, handleOrderClick, handleShowDetails, handleStatusChange, handleMarkAsRead, loadingChange, loadingMarkAsRead }) => (
    <OrderTimer date={order.date} status={order.status} preparingTimeStr={preparingTimeStr}>
        {(isLate) => (
            <div
                onClick={() => handleOrderClick(order.id)}
                className={`
                    bg-white rounded-2xl p-4 shadow-lg flex flex-col justify-between cursor-pointer
                    hover:shadow-xl hover:bg-gray-50 transition-all duration-300
                    border-l-4 border-[var(--first-color)]
                    ${isLate ? 'animate-flash' : ''}
                `}
            >
                <div className="flex justify-between items-center mb-3">
                    <h3 className="m-0 text-lg font-bold text-gray-800">
                        {t.orderId} <span className="text-[var(--first-color)]">#{order.id}</span>
                    </h3>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">{t.unread}</span>
                </div>

                <OrderItemsList items={order.items} t={t} />

                {order.note && (
                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
                        <p className="m-0 font-bold">{t.note}: {order.note}</p>
                    </div>
                )}

                <div className="flex justify-between items-end mt-3 mb-3">
                    <p className="m-0 text-xs font-bold text-gray-600">{order.time}</p>
                    <p className="m-0 text-[10px] text-gray-400">{order.type}</p>
                </div>

                <div className="flex gap-1">
                    <button onClick={e => { e.stopPropagation(); handleShowDetails(order.id); }} className="p-2 bg-blue-600 text-white rounded flex-1 text-xs font-bold">{t.viewDetails}</button>
                    <button onClick={e => { e.stopPropagation(); handleStatusChange(order.id, "done"); }} disabled={loadingChange} className="p-2 bg-green-600 text-white rounded flex-1 text-xs font-bold disabled:bg-gray-300">{t.markDone}</button>
                    <button onClick={e => { e.stopPropagation(); handleMarkAsRead(order.id); }} disabled={loadingMarkAsRead} className="p-2 bg-orange-600 text-white rounded flex-1 text-xs font-bold disabled:bg-gray-300">{t.markAsRead}</button>
                </div>
            </div>
        )}
    </OrderTimer>
);

export default NotificationOrderCard;
