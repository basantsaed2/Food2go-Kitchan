import React from "react";
import OrderTimer from "./OrderTimer";
import OrderItemsList from "./OrderItemsList";

const OrderCard = ({ order, t, preparingTimeStr, handleOrderClick, handleShowDetails, handleStatusChange, loadingChange }) => (
    <OrderTimer date={order.date} status={order.status} preparingTimeStr={preparingTimeStr}>
        {(isLate) => (
            <div
                onClick={() => handleOrderClick(order.id)}
                className={`
                    bg-white rounded-2xl p-5 shadow-lg flex flex-col justify-between cursor-pointer
                    hover:shadow-xl hover:bg-gray-50 transition-all duration-300
                    border-l-4 border-gray-300
                    ${isLate ? 'animate-flash' : ''}
                `}
            >
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="m-0 text-xl font-bold text-gray-800">
                            {t.orderId} <span className="text-[var(--first-color)]">#{order.id}</span>
                        </h3>
                        <button className={`py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === "preparing" ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                            {order.status === "preparing" ? t.preparing : t.done}
                        </button>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 text-xs mb-4">
                        <span>{order.icon} {order.type}</span>
                        {order.type === t.dineIn && order.table && (
                            <span>| {t.table} {order.table}</span>
                        )}
                    </div>

                    <OrderItemsList items={order.items} t={t} />

                    {order.note && (
                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-800">
                            <p className="m-0 font-bold underline decoration-yellow-300 mb-1">{t.note}:</p>
                            <p className="m-0">{order.note}</p>
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex justify-between items-end mt-4 pt-3 border-t border-dashed border-gray-200 mb-3">
                        <div>
                            <p className="m-0 text-[10px] text-gray-400 uppercase font-bold">{t.orderTime}</p>
                            <p className="m-0 font-bold text-sm text-gray-800">{order.time}</p>
                            <p className="m-0 text-[10px] text-gray-400">{order.dateFormatted}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={e => { e.stopPropagation(); handleShowDetails(order.id); }} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1 text-xs font-bold">
                            {t.viewDetails}
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleStatusChange(order.id, "done"); }} disabled={loadingChange || order.status === "done"} className={`p-2 rounded-lg flex-1 text-xs font-bold ${order.status === "done" ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                            {t.markDone}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </OrderTimer>
);

export default OrderCard;
