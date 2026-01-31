import React from "react";
import OrderItemsList from "./OrderItemsList";

const OrderDetailsDialog = ({
    selectedOrder,
    t,
    isOrderUnread,
    setShowOrderDialog,
    handlers,
    orders,
    handleOrderClick,
    handleMarkAsRead,
    handleStatusChange,
    loadingChange,
    loadingMarkAsRead
}) => {
    if (!selectedOrder) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full relative overflow-y-auto max-h-[90vh]">
                <button
                    onClick={() => setShowOrderDialog(false)}
                    className="absolute top-4 right-4 text-3xl font-bold text-gray-400 hover:text-[var(--first-color)]"
                >
                    &times;
                </button>
                <div {...handlers} className="p-2">
                    <h3 className="mb-1 text-2xl text-[var(--first-color)] font-bold">{t.orderId} #{selectedOrder.id}</h3>
                    <div className="flex gap-2 mb-6">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold text-gray-600 capitalize">{selectedOrder.type}</span>
                        <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${isOrderUnread(selectedOrder.id) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {isOrderUnread(selectedOrder.id) ? t.unread : t.read}
                        </span>
                    </div>

                    <div className="space-y-6">
                        <OrderItemsList items={selectedOrder.items} t={t} />

                        {selectedOrder.note && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                                <h4 className="text-sm font-bold text-yellow-800 mb-1">{t.note}</h4>
                                <p className="text-sm text-yellow-900">{selectedOrder.note}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const idx = orders.findIndex(o => o.id === selectedOrder.id);
                                    if (idx > 0) handleOrderClick(orders[idx - 1].id);
                                }}
                                disabled={orders.findIndex(o => o.id === selectedOrder.id) <= 0}
                                className="p-3 bg-gray-100 rounded-full disabled:opacity-30"
                            >
                                ←
                            </button>
                            <button
                                onClick={() => {
                                    const idx = orders.findIndex(o => o.id === selectedOrder.id);
                                    if (idx !== -1 && idx < orders.length - 1) handleOrderClick(orders[idx + 1].id);
                                }}
                                disabled={orders.findIndex(o => o.id === selectedOrder.id) === -1 || orders.findIndex(o => o.id === selectedOrder.id) === orders.length - 1}
                                className="p-3 bg-gray-100 rounded-full disabled:opacity-30"
                            >
                                →
                            </button>
                        </div>
                        <div className="flex gap-2 flex-grow justify-end ml-4">
                            {isOrderUnread(selectedOrder.id) && (
                                <button
                                    onClick={() => handleMarkAsRead(selectedOrder.id)}
                                    disabled={loadingMarkAsRead}
                                    className="px-6 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm disabled:bg-gray-300"
                                >
                                    {t.markAsRead}
                                </button>
                            )}
                            <button
                                onClick={() => handleStatusChange(selectedOrder.id, "done")}
                                disabled={loadingChange || selectedOrder.status === "done"}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold text-sm disabled:bg-gray-300"
                            >
                                {t.markDone}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsDialog;
