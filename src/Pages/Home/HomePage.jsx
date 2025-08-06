import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { useGet } from '../../Hooks/useGet';
import { useChangeState } from '../../Hooks/useChangeState';
import { usePost } from "../../Hooks/usePost";
import { useAuth } from "../../Context/Auth";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { refetch: refetchOrders, data: ordersData } = useGet({
        url: `${apiUrl}/kitchen/orders`,
        required: true,
    });
    const { refetch: refetchNotifications, data: notificationsData } = useGet({
        url: `${apiUrl}/kitchen/orders/notification`,
        required: true,
    });
    const { postData: logoutPost, loadingPost } = usePost({ url: `${apiUrl}/api/logout` });
    const { changeState: markAsReadPost, loadingChange: loadingMarkAsRead } = useChangeState();
    const auth = useAuth();
    const navigate = useNavigate();
    const { changeState, loadingChange } = useChangeState();
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]); // New state for notifications
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState("preparing");
    const [filterType, setFilterType] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showChefDialog, setShowChefDialog] = useState(false);
    const [showNotificationDialog, setShowNotificationDialog] = useState(false);
    const [showOrderDialog, setShowOrderDialog] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [prevOrderCount, setPrevOrderCount] = useState(0);

    const handlers = useSwipeable({
        onSwipedLeft: () => handleSwipe("left"),
        onSwipedRight: () => handleSwipe("right"),
        trackMouse: true,
    });

    const chefData = {
        name: auth?.kitchen?.kitchen.name || "Unknown Chef",
        branch: auth?.kitchen?.kitchen?.branch?.name || "Main Kitchen",
    };

    const transformOrders = (data) => {
        if (data && data.kitchen_order) {
            return data.kitchen_order.map(order => ({
                id: order.id.toString(),
                type: order.type === "take_away" ? "Take Away" : order.type === "dine_in" ? "Dine In" : "Delivery",
                date: order.created_at
                    ? new Date(order.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                    : new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
                time: order.created_at
                    ? new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                status: order.status || "preparing",
                read: order.read || false,
                icon: order.type === "take_away" ? "🚚" : order.type === "dine_in" ? "🍽️" : "📦",
                table: order.type === "dine_in" ? order.table?.table_number || "N/A" : null,
                items: order.order.map(item => ({
                    name: item.name,
                    quantity: parseInt(item.count),
                    variation: item.variation_selected?.map(v => `${v.name}: ${v.options[0].name}`).join(", ") || "",
                    price: parseFloat(item.price_after_tax),
                    addons: item.addons_selected?.map(addon => ({
                        name: addon.name,
                        count: parseInt(addon.count),
                        price: 0,
                    })) || [],
                    excludes: item.excludes?.map(ex => ex.name) || [],
                    extras: item.extras?.map(ex => ex.name) || [],
                })),
                note: order.note || "",
                itemsPrice: order.order.reduce((sum, item) => sum + (parseFloat(item.price_after_tax) * parseInt(item.count)), 0),
                addonsPrice: order.order.reduce((sum, item) => sum + (item.addons_selected?.reduce((s, addon) => s + (0 * parseInt(addon.count)), 0) || 0), 0),
                discount: order.discount || 0,
                vatTax: order.tax || 0,
                total: order.order.reduce((sum, item) => sum + (parseFloat(item.price_after_tax) * parseInt(item.count)), 0),
            }));
        }
        return [];
    };

    useEffect(() => {
        refetchOrders();
        refetchNotifications();
        const interval = setInterval(() => {
            refetchOrders();
            refetchNotifications();
        }, 30000);
        return () => clearInterval(interval);
    }, [refetchOrders, refetchNotifications]);

    useEffect(() => {
        const transformedOrders = transformOrders(ordersData);
        const transformedNotifications = transformOrders(notificationsData);
        setOrders(transformedOrders); // Only use ordersData for orders
        setNotifications(transformedNotifications); // Store notifications separately
        if (transformedOrders.length > 0 && !selectedOrder) {
            setSelectedOrder(transformedOrders[0]);
            setCurrentSlideIndex(0);
        }
        setPrevOrderCount(transformedOrders.length);
    }, [ordersData, notificationsData, selectedOrder]);

    const handleOrderClick = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        setSelectedOrder(order);
        setCurrentSlideIndex(orders.findIndex(o => o.id === orderId));
    };

    const handleStatusChange = async (orderId, newStatus) => {
        const url = `${apiUrl}/kitchen/orders/done_status/${orderId}`;
        const success = await changeState(url, "Order Status", { status: newStatus });
        if (success) {
            const updatedOrders = orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            );
            setOrders(updatedOrders);
            setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev);
            refetchOrders();
            refetchNotifications();
        }
        return success;
    };

    const handleMarkAsRead = async (orderId) => {
        const success = await markAsReadPost(
            `${apiUrl}/kitchen/orders/read_status/${orderId}`,
            `Order marked as read!`
        );
        if (success) {
            // Update orders state to mark the order as read
            const updatedOrders = orders.map(order =>
                order.id === orderId ? { ...order, read: true } : order
            );
            // Remove the order from notifications state
            const updatedNotifications = notifications.filter(order => order.id !== orderId);
            setOrders(updatedOrders);
            setNotifications(updatedNotifications);
            setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, read: true } : prev);
            refetchNotifications(); // Refetch to ensure backend sync
            refetchOrders(); // Refetch orders to ensure consistency
        }
    };

    const handleShow = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        setSelectedOrder(order);
        setCurrentSlideIndex(orders.findIndex(o => o.id === orderId));
        setShowOrderDialog(true);
        setShowNotificationDialog(false);
    };

    const handleSwipe = (direction) => {
        if (direction === "left" && currentSlideIndex < orders.length - 1) {
            setCurrentSlideIndex(currentSlideIndex + 1);
            setSelectedOrder(orders[currentSlideIndex + 1]);
        } else if (direction === "right" && currentSlideIndex > 0) {
            setCurrentSlideIndex(currentSlideIndex - 1);
            setSelectedOrder(orders[currentSlideIndex - 1]);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === "all" || order.status.toLowerCase() === filterStatus.toLowerCase();
        const matchesType = filterType === "all" || order.type.toLowerCase() === filterType.toLowerCase();
        const matchesSearch = searchQuery === "" ||
            order.id.includes(searchQuery) ||
            order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.table && order.type === "dine_in" && order.table.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesType && matchesSearch;
    });

    const handleLogout = async () => {
        try {
            await logoutPost("Logout Successful!");
            auth.logout();
            navigate("/login", { replace: true });
            setShowChefDialog(false);
        } catch (error) {
            console.error("Logout failed:", error);
            auth.toastError("Logout failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center p-6 bg-gradient-to-br from-red-50 to-pink-100 font-sans text-gray-800">
            <div className="bg-white rounded-2xl w-full max-w-7xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header Section */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4 bg-white sticky top-0 z-20">
                    <div className="flex items-center">
                        <span className="text-4xl font-bold text-red-600">Food2Go</span>
                    </div>
                    <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 flex-grow max-w-md border border-gray-300 focus-within:border-red-600 transition-all duration-300">
                        <input
                            type="text"
                            placeholder="Search by ID, item, or table..."
                            className="border-none outline-none bg-transparent flex-grow text-sm placeholder-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span className="ml-2 text-gray-400 text-base">🔍</span>
                    </div>
                    <div className="flex gap-2 bg-gray-100 rounded-full p-1">
                        {["all", "Take Away", "Dine In", "Delivery"].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type.toLowerCase())}
                                className={`
                                    py-2 px-6 rounded-full cursor-pointer text-sm font-semibold transition-all duration-300
                                    ${filterType === type.toLowerCase()
                                        ? 'bg-red-600 text-white shadow-md'
                                        : 'bg-transparent text-gray-600 hover:bg-gray-200 hover:text-red-600'}
                                `}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowNotificationDialog(true)}
                            className={`p-3 rounded-full hover:bg-gray-100 transition-colors relative ${notifications.length > 0 ? 'animate-pulse' : ''}`}
                        >
                            <span className="text-xl text-gray-600">🔔</span>
                            {notifications.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {notifications.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setShowChefDialog(true)}
                            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-xl text-gray-600">👨‍🍳</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-grow p-6 gap-6 flex-wrap lg:flex-nowrap bg-gray-50">
                    {/* Orders List */}
                    <div className="flex-1 min-w-[300px] p-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full overflow-y-auto max-h-[calc(100vh-200px)] scrollPage">
                        {filteredOrders.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 text-lg">No orders found for the selected filters.</p>
                            </div>
                        ) : (
                            filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    onClick={() => handleOrderClick(order.id)}
                                    className={`
                                        bg-white rounded-2xl p-5 shadow-lg flex flex-col justify-between cursor-pointer
                                        hover:shadow-xl hover:bg-gray-50 transition-all duration-300
                                        ${selectedOrder?.id === order.id ? 'ring-4 ring-red-600 ring-offset-2 z-10 border-none' : ''}
                                        ${!order.read ? 'border-l-2 border-red-600' : ''}
                                    `}
                                >
                                    <div>
                                        <h3 className="m-0 text-xl font-bold text-gray-800 mb-3">Order ID <span className="text-red-600">#{order.id}</span></h3>
                                        <div className="flex items-center gap-3 text-gray-600 text-sm mb-3">
                                            <span className="text-xl">{order.icon}</span>
                                            <span className="font-medium">{order.type}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            <p>Items: {order.items.map(item => `${item.quantity}x ${item.name}`).join(", ")}</p>
                                            {order.items.some(item => item.addons.length > 0) && (
                                                <p>Addons: {order.items
                                                    .filter(item => item.addons.length > 0)
                                                    .map(item => item.addons.map(addon => `${addon.count}x ${addon.name}`).join(", "))
                                                    .join("; ")}</p>
                                            )}
                                            {order.items.some(item => item.excludes.length > 0) && (
                                                <p>Excludes: {order.items
                                                    .filter(item => item.excludes.length > 0)
                                                    .map(item => item.excludes.join(", "))
                                                    .join("; ")}</p>
                                            )}
                                            {order.items.some(item => item.extras.length > 0) && (
                                                <p>Extras: {order.items
                                                    .filter(item => item.extras.length > 0)
                                                    .map(item => item.extras.join(", "))
                                                    .join("; ")}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end mt-4 pt-3 border-t border-dashed border-gray-200">
                                        <div>
                                            <p className="m-0 text-xs text-gray-500">Order Time</p>
                                            <p className="m-0 font-bold text-sm text-gray-800">{order.time}</p>
                                            <p className="m-0 text-xs text-gray-400">{order.date}</p>
                                        </div>
                                        <button
                                            className={`
                                                border-none py-1.5 px-3 rounded-full text-xs font-bold shadow-sm transition-colors duration-200
                                                ${order.status === "preparing" ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : ''}
                                                ${order.status === "done" ? 'bg-green-100 text-green-600 hover:bg-green-200' : ''}
                                            `}
                                        >
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="flex-none w-full lg:w-[400px] min-w-[300px] bg-white border border-gray-200 rounded-2xl p-6 shadow-lg overflow-y-auto max-h-[calc(100vh-200px)] scrollPage">
                        <h3 className="mb-4 text-2xl text-red-600 font-bold border-b border-gray-200 pb-3">Order Summary</h3>
                        {selectedOrder ? (
                            <>
                                <p className="mb-4 text-sm text-gray-800">
                                    Order# <span className="font-bold">{selectedOrder.id}</span> |
                                    Type: <span className="font-bold">{selectedOrder.type}</span>
                                    {selectedOrder.type === "Dine In" && selectedOrder.table && (
                                        <> | Table <span className="font-bold">{selectedOrder.table}</span></>
                                    )}
                                    {/* | Status: <span className="font-bold">{selectedOrder.read ? "Read" : "Unread"}</span> */}
                                </p>
                                <div className="border-b border-dashed border-gray-200 pb-4 mb-4">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="mb-4">
                                            <div className="flex justify-between items-center">
                                                <p className="m-0 font-semibold text-sm text-gray-800">{item.quantity} x {item.name}</p>
                                                <span className="font-bold text-sm text-gray-800">EGP {item.price.toFixed(2)}</span>
                                            </div>
                                            {item.variation && <p className="m-0 text-xs text-gray-500">Variation: {item.variation}</p>}
                                            {item.addons.length > 0 && (
                                                <p className="m-0 text-xs text-gray-500">Addons: {item.addons.map(addon => `${addon.count}x ${addon.name}`).join(", ")}</p>
                                            )}
                                            {item.excludes.length > 0 && (
                                                <p className="m-0 text-xs text-gray-500">Excludes: {item.excludes.join(", ")}</p>
                                            )}
                                            {item.extras.length > 0 && (
                                                <p className="m-0 text-xs text-gray-500">Extras: {item.extras.join(", ")}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {selectedOrder.note && (
                                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                                        <p className="m-0 font-medium">Note: <span className="text-blue-700">{selectedOrder.note}</span></p>
                                    </div>
                                )}
                                <div className="mb-4 text-xs text-gray-500">
                                    <div className="flex justify-between mb-2">
                                        <span>Items Price</span>
                                        <span>EGP {selectedOrder.itemsPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span>Addons Price</span>
                                        <span>EGP {selectedOrder.addonsPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span>Discount</span>
                                        <span className="text-red-500">-EGP {selectedOrder.discount.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                                    <h3 className="m-0 text-lg font-bold text-gray-800">Total</h3>
                                    <h3 className="m-0 text-2xl font-extrabold text-red-600">EGP {selectedOrder.total.toFixed(2)}</h3>
                                </div>
                                {selectedOrder.status === "preparing" && (
                                    <button
                                        onClick={() => handleStatusChange(selectedOrder.id, "done")}
                                        disabled={loadingChange}
                                        className={`
                                            w-full py-3 text-white rounded-lg mt-4 text-base font-bold cursor-pointer flex items-center justify-center gap-2 shadow-md
                                            ${loadingChange ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 transform hover:scale-105 transition-all duration-300'}
                                        `}
                                    >
                                        <span className="text-lg">✅</span>
                                        {loadingChange ? "Processing..." : "Mark as Done"}
                                    </button>
                                )}
                                {selectedOrder.status === "done" && (
                                    <button
                                        disabled
                                        className="w-full py-3 bg-gray-400 text-white rounded-lg mt-4 text-base font-bold cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <span className="text-lg">✔️</span>
                                        Order Completed
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <p className="mb-2 text-lg">No orders available</p>
                                <p className="text-sm">Waiting for new orders...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Dialog with Swiper */}
            {showOrderDialog && orders.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full relative overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-gray-100 scrollbar-w-0.5">
                        <button
                            onClick={() => setShowOrderDialog(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-red-600 text-2xl font-bold"
                        >
                            &times;
                        </button>
                        <div {...handlers}>
                            <div className="p-4">
                                <h3 className="mb-4 text-xl text-red-600 font-bold">Order #{orders[currentSlideIndex].id}</h3>
                                <p className="mb-4 text-sm text-gray-800">
                                    Type: <span className="font-bold">{orders[currentSlideIndex].type}</span>
                                    {orders[currentSlideIndex].type === "Dine In" && orders[currentSlideIndex].table && (
                                        <> | Table <span className="font-bold">{orders[currentSlideIndex].table}</span></>
                                    )}
                                    | Status: <span className="font-bold">{orders[currentSlideIndex].read ? "Read" : "Unread"}</span>
                                </p>
                                <div className="border-b border-dashed border-gray-200 pb-4 mb-4">
                                    {orders[currentSlideIndex].items.map((item, index) => (
                                        <div key={index} className="mb-4">
                                            <div className="flex justify-between items-center">
                                                <p className="m-0 font-semibold text-sm text-gray-800">{item.quantity} x {item.name}</p>
                                                <span className="font-bold text-sm text-gray-800">EGP {item.price.toFixed(2)}</span>
                                            </div>
                                            {item.variation && <p className="m-0 text-xs text-gray-500">Variation: {item.variation}</p>}
                                            {item.addons.length > 0 && (
                                                <p className="m-0 text-xs text-gray-500">Addons: {item.addons.map(addon => `${addon.count}x ${addon.name}`).join(", ")}</p>
                                            )}
                                            {item.excludes.length > 0 && (
                                                <p className="m-0 text-xs text-gray-500">Excludes: {item.excludes.join(", ")}</p>
                                            )}
                                            {item.extras.length > 0 && (
                                                <p className="m-0 text-xs text-gray-500">Extras: {item.extras.join(", ")}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {orders[currentSlideIndex].note && (
                                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                                        <p className="m-0 font-medium">Note: <span className="text-blue-700">{orders[currentSlideIndex].note}</span></p>
                                    </div>
                                )}
                                <div className="flex justify-between gap-2 mt-4">
                                    <button
                                        onClick={() => setCurrentSlideIndex(currentSlideIndex > 0 ? currentSlideIndex - 1 : 0)}
                                        disabled={currentSlideIndex === 0}
                                        className="p-2 bg-gray-200 text-gray-800 rounded-full disabled:opacity-50"
                                    >
                                        ⬅️
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(orders[currentSlideIndex].id, "done")}
                                        disabled={loadingChange || orders[currentSlideIndex].status === "done"}
                                        className={`
                                            flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300
                                            ${loadingChange || orders[currentSlideIndex].status === "done"
                                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                                : 'bg-red-600 text-white hover:bg-red-700'}
                                        `}
                                    >
                                        {loadingChange ? "Processing..." : orders[currentSlideIndex].status === "done" ? "Completed" : "Mark as Done"}
                                    </button>
                                    {!orders[currentSlideIndex].read && (
                                        <button
                                            onClick={() => handleMarkAsRead(orders[currentSlideIndex].id)}
                                            disabled={loadingMarkAsRead}
                                            className={`
                                                flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300
                                                ${loadingMarkAsRead ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}
                                            `}
                                        >
                                            {loadingMarkAsRead ? "Processing..." : "Mark as Read"}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setCurrentSlideIndex(currentSlideIndex < orders.length - 1 ? currentSlideIndex + 1 : orders.length - 1)}
                                        disabled={currentSlideIndex === orders.length - 1}
                                        className="p-2 bg-gray-200 text-gray-800 rounded-full disabled:opacity-50"
                                    >
                                        ➡️
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Dialog */}
            {showNotificationDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full relative overflow-y-auto max-h-[80vh] scrollbar scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-gray-100 scrollbar-w-0.5">
                        <button
                            onClick={() => setShowNotificationDialog(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-red-600 text-2xl font-bold"
                        >
                            &times;
                        </button>
                        <h3 className="mb-4 text-2xl text-red-600 font-bold">Notifications</h3>
                        {notifications.length === 0 ? (
                            <p className="text-gray-500 text-lg">No new orders.</p>
                        ) : (
                            notifications.map((order) => (
                                <div
                                    key={order.id}
                                    className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200"
                                >
                                    <div className="flex justify-between items-center gap-2">
                                        <div>
                                            <p className="m-0 font-semibold text-sm text-gray-800">Order #{order.id}</p>
                                            <p className="m-0 text-xs text-gray-500">{order.type} | {order.time} | {order.read ? "Read" : "Unread"}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleShow(order.id)}
                                                disabled={order.status === "done"}
                                                className={`
                                                    py-1.5 px-4 rounded-lg text-xs font-semibold
                                                    ${order.status === "done"
                                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                                        : 'bg-red-600 text-white hover:bg-red-700'}
                                                `}
                                            >
                                                {order.status === "done" ? "Completed" : "Show"}
                                            </button>
                                            {!order.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(order.id)}
                                                    disabled={loadingMarkAsRead}
                                                    className={`
                                                        py-1.5 px-4 rounded-lg text-xs font-semibold
                                                        ${loadingMarkAsRead ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}
                                                    `}
                                                >
                                                    {loadingMarkAsRead ? "Processing..." : "Mark as Read"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Chef Profile Dialog */}
            {showChefDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full relative">
                        <button
                            onClick={() => setShowChefDialog(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-red-600 text-2xl font-bold"
                        >
                            &times;
                        </button>
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                                {chefData.name.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{chefData.name}</h2>
                            <p className="text-sm text-gray-500 mb-4">Branch: {chefData.branch}</p>
                            <button
                                onClick={handleLogout}
                                className="py-2 px-6 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all duration-300"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;