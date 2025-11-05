
import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { useGet } from '../../Hooks/useGet';
import { useChangeState } from '../../Hooks/useChangeState';
import { usePost } from "../../Hooks/usePost";
import { useAuth } from "../../Context/Auth";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const projectNameEn = import.meta.env.VITE_PROJECT_EN_NAME || "Food2Go";
    const projectNameAr = import.meta.env.VITE_PROJECT_AR_NAME || "فود تو جو";

    // Language state
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const projectName = selectedLanguage === "ar" ? projectNameAr : projectNameEn;

    // Translations
    const translations = {
        en: {
            searchPlaceholder: "Search by ID, item, or table...",
            noOrders: "No orders found for the selected filters.",
            newOrders: "New Orders",
            allOrders: "All Orders",
            orderId: "Order ID",
            items: "Items",
            addons: "Addons",
            excludes: "Excludes",
            extras: "Extras",
            note: "Note",
            orderTime: "Order Time",
            preparing: "Preparing",
            done: "Done",
            viewDetails: "View Details",
            markDone: "Mark Done",
            notifications: "Notifications",
            noNewOrders: "No new orders.",
            type: "Type",
            table: "Table",
            status: "Status",
            read: "Read",
            unread: "Unread",
            markAsRead: "Mark as Read",
            completed: "Completed",
            show: "Show",
            processing: "Processing...",
            logout: "Logout",
            branch: "Branch",
            all: "All",
            takeAway: "Take Away",
            dineIn: "Dine In",
            delivery: "Delivery",
            loadingOrders: "Loading orders...",
            loading: "Loading...",
            orders: "Orders"
        },
        ar: {
            searchPlaceholder: "ابحث بالرقم، الصنف، أو الطاولة...",
            noOrders: "لا توجد طلبات تطابق الفلاتر المحددة.",
            newOrders: "الطلبات الجديدة",
            allOrders: "جميع الطلبات",
            orderId: "رقم الطلب",
            items: "الأصناف",
            addons: "الإضافات",
            excludes: "المستثنيات",
            extras: "الإضافات الإضافية",
            note: "ملاحظة",
            orderTime: "وقت الطلب",
            preparing: "قيد التحضير",
            done: "مكتمل",
            viewDetails: "عرض التفاصيل",
            markDone: "إتمام",
            notifications: "الإشعارات",
            noNewOrders: "لا توجد طلبات جديدة.",
            type: "النوع",
            table: "الطاولة",
            status: "الحالة",
            read: "مقروء",
            unread: "غير مقروء",
            markAsRead: "تعيين كمقروء",
            completed: "مكتمل",
            show: "عرض",
            processing: "جاري المعالجة...",
            logout: "تسجيل الخروج",
            branch: "الفرع",
            all: "الكل",
            takeAway: "تيك أواي",
            dineIn: "صالة",
            delivery: "توصيل",
            loadingOrders: "جاري تحميل الطلبات...",
            loading: "جاري التحميل...",
            orders: "الطلبات"
        }
    };

    const t = translations[selectedLanguage];

    // Use loading state from useGet hook
    const { refetch: refetchOrders, data: ordersData, loading: ordersLoading } = useGet({
        url: `${apiUrl}/kitchen/orders?locale=${selectedLanguage}`,
        required: true,
    });

    const { refetch: refetchNotifications, data: notificationsData, loading: notificationsLoading } = useGet({
        url: `${apiUrl}/kitchen/orders/notification?locale=${selectedLanguage}`,
        required: true,
    });

    const { postData: logoutPost, loadingPost } = usePost({ url: `${apiUrl}/api/logout` });
    const { changeState: markAsReadPost, loadingChange: loadingMarkAsRead } = useChangeState();
    const auth = useAuth();
    const navigate = useNavigate();
    const { changeState, loadingChange } = useChangeState();
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
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
        phone: auth?.kitchen?.kitchen.phone || "N/A",
        branch: auth?.kitchen?.kitchen?.branch?.name || "Main Kitchen",
    };

    const transformOrders = (data) => {
        if (data && data.kitchen_order) {
            return data.kitchen_order.map(order => ({
                id: order.id.toString(),
                type: order.type === "take_away" ? t.takeAway : order.type === "dine_in" ? t.dineIn : t.delivery,
                date: order.created_at
                    ? new Date(order.created_at).toLocaleDateString(selectedLanguage === "ar" ? 'ar-EG' : 'en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })
                    : new Date().toLocaleDateString(selectedLanguage === "ar" ? 'ar-EG' : 'en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }),
                time: order.created_at
                    ? new Date(order.created_at).toLocaleTimeString(selectedLanguage === "ar" ? 'ar-EG' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                    : new Date().toLocaleTimeString(selectedLanguage === "ar" ? 'ar-EG' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                status: order.status || "preparing",
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
    }, [refetchOrders, refetchNotifications, selectedLanguage]);

    useEffect(() => {
        const transformedOrders = transformOrders(ordersData);
        const transformedNotifications = transformOrders(notificationsData);
        setOrders(transformedOrders);
        setNotifications(transformedNotifications);
        if (transformedOrders.length > 0 && !selectedOrder) {
            setSelectedOrder(transformedOrders[0]);
            setCurrentSlideIndex(0);
        }
        setPrevOrderCount(transformedOrders.length);
    }, [ordersData, notificationsData, selectedOrder, selectedLanguage]);

    const handleOrderClick = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        setSelectedOrder(order);
        setCurrentSlideIndex(orders.findIndex(o => o.id === orderId));
        setShowOrderDialog(true);
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
            // Remove from notifications - this will make it disappear from right sidebar
            const updatedNotifications = notifications.filter(order => order.id !== orderId);
            setNotifications(updatedNotifications);
            refetchNotifications();
            refetchOrders();
        }
    };

    const handleShowDetails = (orderId) => {
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

    // Get notification order IDs for checking if an order is unread
    const notificationOrderIds = notifications.map(order => order.id);
    
    // Check if an order is unread (exists in notifications)
    const isOrderUnread = (orderId) => notificationOrderIds.includes(orderId);

    // Filter orders for left side - exclude orders that are in notifications (unread)
    const readOrders = filteredOrders.filter(order => !isOrderUnread(order.id));

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

    const toggleLanguage = () => {
        setSelectedLanguage(prev => prev === "en" ? "ar" : "en");
    };

    const isRTL = selectedLanguage === "ar";

    // Loading skeleton component
    const OrderSkeleton = () => (
        <div className="bg-white rounded-2xl p-5 shadow-lg flex flex-col justify-between animate-pulse">
            <div>
                <div className="h-6 bg-gray-300 rounded mb-3 w-3/4"></div>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
            </div>
            <div className="flex justify-between items-end mt-4 pt-3 border-t border-dashed border-gray-200">
                <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                    <div className="h-4 bg-gray-300 rounded w-12"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                </div>
            </div>
            <div className="flex gap-2 mt-2">
                <div className="h-8 bg-gray-300 rounded flex-1"></div>
                <div className="h-8 bg-gray-300 rounded flex-1"></div>
            </div>
        </div>
    );

    // Order Card Component for Left Side (Read Orders)
    const OrderCard = ({ order }) => (
        <div
            key={order.id}
            onClick={() => handleOrderClick(order.id)}
            className={`
                bg-white rounded-2xl p-5 shadow-lg flex flex-col justify-between cursor-pointer
                hover:shadow-xl hover:bg-gray-50 transition-all duration-300
                border-l-4 border-gray-300
            `}
        >
            <div>
                <h3 className="m-0 text-xl font-bold text-gray-800 mb-3">
                    {t.orderId} <span className="text-red-600">#{order.id}</span>
                </h3>
                <div className="flex items-center gap-3 text-gray-600 text-sm mb-3">
                    <span className="text-xl">{order.icon}</span>
                    <span className="font-medium">{order.type}</span>
                    {order.type === t.dineIn && order.table && (
                        <span className="font-medium">| {t.table} {order.table}</span>
                    )}
                </div>

                {/* Items, addons, excludes, extras */}
                <div className="text-sm font-semibold text-gray-900 space-y-2">
                    {/* Main Items */}
                    <div>
                        <span className="font-medium">{t.items}:</span>
                        <div className="ml-2 mt-1">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                    <span>• {item.quantity}x {item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Addons */}
                    {order.items.some(item => item.addons.length > 0) && (
                        <div>
                            <span className="font-medium">{t.addons}:</span>
                            <div className="ml-2 mt-1">
                                {order.items
                                    .filter(item => item.addons.length > 0)
                                    .map((item, itemIndex) => (
                                        <div key={itemIndex}>
                                            {item.addons.map((addon, addonIndex) => (
                                                <div key={addonIndex}>
                                                    • {addon.count}x {addon.name} ({item.name})
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Excludes */}
                    {order.items.some(item => item.excludes.length > 0) && (
                        <div>
                            <span className="font-medium">{t.excludes}:</span>
                            <div className="ml-2 mt-1">
                                {order.items
                                    .filter(item => item.excludes.length > 0)
                                    .map((item, itemIndex) => (
                                        <div key={itemIndex}>
                                            • {item.excludes.join(', ')} ({item.name})
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Extras */}
                    {order.items.some(item => item.extras.length > 0) && (
                        <div>
                            <span className="font-medium">{t.extras}:</span>
                            <div className="ml-2 mt-1">
                                {order.items
                                    .filter(item => item.extras.length > 0)
                                    .map((item, itemIndex) => (
                                        <div key={itemIndex}>
                                            • {item.extras.join(', ')} ({item.name})
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                {order.note && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-800">
                        <p className="m-0 font-medium">{t.note}: <span className="text-blue-700">{order.note}</span></p>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-end mt-4 pt-3 border-t border-dashed border-gray-200">
                <div>
                    <p className="m-0 text-xs text-gray-500">{t.orderTime}</p>
                    <p className="m-0 font-bold text-sm text-gray-800">{order.time}</p>
                    <p className="m-0 text-xs text-gray-400">{order.date}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        className={`
                            border-none py-1.5 px-3 rounded-full text-xs font-bold shadow-sm transition-colors duration-200 mb-2
                            ${order.status === "preparing" ? 'bg-blue-100 text-blue-600' : ''}
                            ${order.status === "done" ? 'bg-green-100 text-green-600' : ''}
                        `}
                    >
                        {order.status === "preparing" ? t.preparing : t.done}
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mt-2">
                <button
                    onClick={e => { e.stopPropagation(); handleShowDetails(order.id); }}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center flex-1"
                    title={t.viewDetails}
                >
                    <span className="text-sm font-semibold">{t.viewDetails}</span>
                </button>
                <button
                    onClick={e => { e.stopPropagation(); handleStatusChange(order.id, "done"); }}
                    disabled={loadingChange || order.status === "done"}
                    className={`
                        p-2 rounded-lg transition-colors duration-200 flex items-center justify-center flex-1
                        ${loadingChange || order.status === "done"
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-green-600 text-white hover:bg-green-700'}
                    `}
                    title={t.markDone}
                >
                    <span className="text-sm font-semibold">{t.markDone}</span>
                </button>
            </div>
        </div>
    );

    // Order Card Component for Right Side (Unread Orders from Notifications)
    const NotificationOrderCard = ({ order }) => (
        <div
            key={order.id}
            onClick={() => handleOrderClick(order.id)}
            className={`
                bg-white rounded-2xl p-5 shadow-lg flex flex-col justify-between cursor-pointer
                hover:shadow-xl hover:bg-gray-50 transition-all duration-300
                border-l-4 border-red-600
            `}
        >
            <div>
                <h3 className="m-0 text-xl font-bold text-gray-800 mb-3">
                    {t.orderId} <span className="text-red-600">#{order.id}</span>
                </h3>
                <div className="flex items-center gap-3 text-gray-600 text-sm mb-3">
                    <span className="text-xl">{order.icon}</span>
                    <span className="font-medium">{order.type}</span>
                    {order.type === t.dineIn && order.table && (
                        <span className="font-medium">| {t.table} {order.table}</span>
                    )}
                </div>

                {/* Items, addons, excludes, extras */}
                <div className="text-sm font-semibold text-gray-900 space-y-2">
                    {/* Main Items */}
                    <div>
                        <span className="font-medium">{t.items}:</span>
                        <div className="ml-2 mt-1">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                    <span>• {item.quantity}x {item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Addons */}
                    {order.items.some(item => item.addons.length > 0) && (
                        <div>
                            <span className="font-medium">{t.addons}:</span>
                            <div className="ml-2 mt-1">
                                {order.items
                                    .filter(item => item.addons.length > 0)
                                    .map((item, itemIndex) => (
                                        <div key={itemIndex}>
                                            {item.addons.map((addon, addonIndex) => (
                                                <div key={addonIndex}>
                                                    • {addon.count}x {addon.name} ({item.name})
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Excludes */}
                    {order.items.some(item => item.excludes.length > 0) && (
                        <div>
                            <span className="font-medium">{t.excludes}:</span>
                            <div className="ml-2 mt-1">
                                {order.items
                                    .filter(item => item.excludes.length > 0)
                                    .map((item, itemIndex) => (
                                        <div key={itemIndex}>
                                            • {item.excludes.join(', ')} ({item.name})
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Extras */}
                    {order.items.some(item => item.extras.length > 0) && (
                        <div>
                            <span className="font-medium">{t.extras}:</span>
                            <div className="ml-2 mt-1">
                                {order.items
                                    .filter(item => item.extras.length > 0)
                                    .map((item, itemIndex) => (
                                        <div key={itemIndex}>
                                            • {item.extras.join(', ')} ({item.name})
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                {order.note && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-800">
                        <p className="m-0 font-medium">{t.note}: <span className="text-blue-700">{order.note}</span></p>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-end mt-4 pt-3 border-t border-dashed border-gray-200">
                <div>
                    <p className="m-0 text-xs text-gray-500">{t.orderTime}</p>
                    <p className="m-0 font-bold text-sm text-gray-800">{order.time}</p>
                    <p className="m-0 text-xs text-gray-400">{order.date}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        className={`
                            border-none py-1.5 px-3 rounded-full text-xs font-bold shadow-sm transition-colors duration-200 mb-2
                            ${order.status === "preparing" ? 'bg-blue-100 text-blue-600' : ''}
                            ${order.status === "done" ? 'bg-green-100 text-green-600' : ''}
                        `}
                    >
                        {order.status === "preparing" ? t.preparing : t.done}
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mt-2">
                <button
                    onClick={e => { e.stopPropagation(); handleShowDetails(order.id); }}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center flex-1"
                    title={t.viewDetails}
                >
                    <span className="text-sm font-semibold">{t.viewDetails}</span>
                </button>
                <button
                    onClick={e => { e.stopPropagation(); handleStatusChange(order.id, "done"); }}
                    disabled={loadingChange || order.status === "done"}
                    className={`
                        p-2 rounded-lg transition-colors duration-200 flex items-center justify-center flex-1
                        ${loadingChange || order.status === "done"
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-green-600 text-white hover:bg-green-700'}
                    `}
                    title={t.markDone}
                >
                    <span className="text-sm font-semibold">{t.markDone}</span>
                </button>
                <button
                    onClick={e => { e.stopPropagation(); handleMarkAsRead(order.id); }}
                    disabled={loadingMarkAsRead}
                    className={`
                        p-2 rounded-lg transition-colors duration-200 flex items-center justify-center flex-1
                        ${loadingMarkAsRead ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-orange-600 text-white hover:bg-orange-700'}
                    `}
                    title={t.markAsRead}
                >
                    <span className="text-sm font-semibold">{t.markAsRead}</span>
                </button>
            </div>
        </div>
    );

    return (
        <div
            className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-red-50 to-pink-100 font-sans text-gray-800"
            dir={isRTL ? "rtl" : "ltr"}
        >
            <div className="bg-white rounded-2xl w-full shadow-2xl flex flex-col overflow-hidden">
                {/* Header Section */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4 bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-bold text-red-600">{projectName}</span>
                        <button
                            onClick={toggleLanguage}
                            className="px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200 text-sm font-semibold"
                        >
                            {selectedLanguage === "en" ? "العربية" : "English"}
                        </button>
                    </div>
                    <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 flex-grow max-w-md border border-gray-300 focus-within:border-red-600 transition-all duration-300">
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            className="border-none outline-none bg-transparent flex-grow text-sm placeholder-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={ordersLoading}
                        />
                        <span className="ml-2 text-gray-400 text-base">🔍</span>
                    </div>
                    <div className="flex gap-2 bg-gray-100 rounded-full p-1">
                        {["all", "take_away", "dine_in", "delivery"].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                disabled={ordersLoading}
                                className={`
                                    py-2 px-4 rounded-full cursor-pointer text-sm font-semibold transition-all duration-300
                                    ${filterType === type
                                        ? 'bg-red-600 text-white shadow-md'
                                        : 'bg-transparent text-gray-600 hover:bg-gray-200 hover:text-red-600'}
                                    ${ordersLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {type === "all" ? t.all :
                                    type === "take_away" ? t.takeAway :
                                        type === "dine_in" ? t.dineIn : t.delivery}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowNotificationDialog(true)}
                            disabled={notificationsLoading}
                            className={`p-3 rounded-full hover:bg-gray-100 transition-colors relative ${notifications.length > 0 ? 'animate-pulse' : ''} ${notificationsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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

                {/* Main Content Area - Split Layout */}
                <div className="flex-grow flex flex-col md:flex-row gap-6 p-4 bg-gray-50">
                    {/* ---------- LEFT – READ ORDERS ---------- */}
                    <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] scrollPage">
                        <h2 className="mb-4 text-lg font-semibold text-gray-700">{t.allOrders}</h2>

                        {ordersLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-6">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <OrderSkeleton key={i} />
                                ))}
                            </div>
                        ) : readOrders.length === 0 ? (
                            <p className="text-center text-gray-500">{t.noOrders}</p>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                {readOrders.map(order => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        )}
                    </div>


                    {/* ---------- RIGHT – NOTIFICATIONS (UNREAD ORDERS) ---------- */}
                    <div className="w-full md:w-80 overflow-y-auto max-h-[calc(100vh-200px)] scrollPage">
                        <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
                            <h2 className="text-2xl font-bold text-red-600 flex items-center gap-2">
                                <span>🆕</span>
                                {t.notifications}
                                {notifications.length > 0 && (
                                    <span className="bg-red-600 text-white text-sm rounded-full px-3 py-1">
                                        {notifications.length} {selectedLanguage === "ar" ? "جديد" : "new"}
                                    </span>
                                )}
                            </h2>
                        </div>

                        {notificationsLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <OrderSkeleton key={i} />
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl p-6">
                                <p className="text-gray-500 text-lg">{t.noNewOrders}</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    {selectedLanguage === "ar" ? "لا توجد طلبات جديدة" : "No new orders available"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {notifications.map(order => (
                                    <NotificationOrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Loading overlay for API calls */}
            {(ordersLoading || notificationsLoading) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                        <p className="text-gray-700">{t.loadingOrders}</p>
                    </div>
                </div>
            )}

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
                                <h3 className="mb-4 text-xl text-red-600 font-bold">
                                    {t.orderId} #{orders[currentSlideIndex].id}
                                </h3>
                                <p className="mb-4 text-sm text-gray-800">
                                    {t.type}: <span className="font-bold">{orders[currentSlideIndex].type}</span>
                                    {orders[currentSlideIndex].type === t.dineIn && orders[currentSlideIndex].table && (
                                        <> | {t.table} <span className="font-bold">{orders[currentSlideIndex].table}</span></>
                                    )}
                                    | {t.status}: <span className="font-bold">
                                        {isOrderUnread(orders[currentSlideIndex].id) ? t.unread : t.read}
                                    </span>
                                </p>
                                <div className="border-b border-dashed border-gray-200 pb-4 mb-4">
                                    {orders[currentSlideIndex].items.map((item, index) => (
                                        <div key={index} className="mb-4">
                                            <div className="flex justify-between items-center">
                                                <p className="m-0 font-semibold text-sm text-gray-800">{item.quantity} x {item.name}</p>
                                            </div>
                                            {item.variation && <p className="m-0 text-xs text-gray-500">Variation: {item.variation}</p>}
                                            {item.addons.length > 0 && (
                                                <p className="m-0 text-xs text-gray-500">{t.addons}: {item.addons.map(addon => `${addon.count}x ${addon.name}`).join(", ")}</p>
                                            )}
                                            {item.excludes.length > 0 && (
                                                <p className="m-0 text-xs text-gray-500">{t.excludes}: {item.excludes.join(", ")}</p>
                                            )}
                                            {item.extras.length > 0 && (
                                                <p className="m-0 text-xs text-gray-500">{t.extras}: {item.extras.join(", ")}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {orders[currentSlideIndex].note && (
                                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                                        <p className="m-0 font-medium">{t.note}: <span className="text-blue-700">{orders[currentSlideIndex].note}</span></p>
                                    </div>
                                )}
                                <div className="flex justify-between gap-2 mt-4">
                                    <button
                                        onClick={() => setCurrentSlideIndex(currentSlideIndex > 0 ? currentSlideIndex - 1 : 0)}
                                        disabled={currentSlideIndex === 0}
                                        className="p-2 bg-gray-200 text-gray-800 rounded-full disabled:opacity-50"
                                    >
                                        {isRTL ? "➡️" : "⬅️"}
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
                                        {loadingChange ? t.processing : orders[currentSlideIndex].status === "done" ? t.completed : t.markDone}
                                    </button>
                                    {isOrderUnread(orders[currentSlideIndex].id) && (
                                        <button
                                            onClick={() => handleMarkAsRead(orders[currentSlideIndex].id)}
                                            disabled={loadingMarkAsRead}
                                            className={`
                                                flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300
                                                ${loadingMarkAsRead ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}
                                            `}
                                        >
                                            {loadingMarkAsRead ? t.processing : t.markAsRead}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setCurrentSlideIndex(currentSlideIndex < orders.length - 1 ? currentSlideIndex + 1 : orders.length - 1)}
                                        disabled={currentSlideIndex === orders.length - 1}
                                        className="p-2 bg-gray-200 text-gray-800 rounded-full disabled:opacity-50"
                                    >
                                        {isRTL ? "⬅️" : "➡️"}
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
                        <h3 className="mb-4 text-2xl text-red-600 font-bold">{t.notifications}</h3>
                        {notificationsLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                <span className="ml-2 text-gray-600">{t.loading}</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <p className="text-gray-500 text-lg">{t.noNewOrders}</p>
                        ) : (
                            notifications.map((order) => (
                                <div
                                    key={order.id}
                                    className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200"
                                >
                                    <div className="flex justify-between items-center gap-2">
                                        <div>
                                            <p className="m-0 font-semibold text-sm text-gray-800">{t.orderId} #{order.id}</p>
                                            <p className="m-0 text-xs text-gray-500">{order.type} | {order.time} | {order.read ? t.read : t.unread}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleShowDetails(order.id)}
                                                disabled={order.status === "done"}
                                                className={`
                                                    py-1.5 px-4 rounded-lg text-xs font-semibold
                                                    ${order.status === "done"
                                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                                        : 'bg-red-600 text-white hover:bg-red-700'}
                                                `}
                                            >
                                                {order.status === "done" ? t.completed : t.show}
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
                                                    {loadingMarkAsRead ? t.processing : t.markAsRead}
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
                            <p className="text-sm text-gray-500 mb-4">{t.branch}: {chefData.branch}</p>
                            <button
                                onClick={handleLogout}
                                className="py-2 px-6 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all duration-300"
                            >
                                {t.logout}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;