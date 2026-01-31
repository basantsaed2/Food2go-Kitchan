import React, { useState, useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { useGet } from '../../Hooks/useGet';
import { useChangeState } from '../../Hooks/useChangeState';
import { usePost } from "../../Hooks/usePost";
import { useAuth } from "../../Context/Auth";
import { useNavigate } from "react-router-dom";
import translations from "../../i18n";

// Split Components
import OrderCard from "../../Components/Home/OrderCard";
import NotificationOrderCard from "../../Components/Home/NotificationOrderCard";
import SectionSeparator from "../../Components/Home/SectionSeparator";
import OrderSkeleton from "../../Components/Home/OrderSkeleton";
import OrderDetailsDialog from "../../Components/Home/OrderDetailsDialog";
import ChefDialog from "../../Components/Home/ChefDialog";

const HomePage = () => {
    const auth = useAuth();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const kitchenData = auth.kitchen;
    const projectNameEn = kitchenData?.app_setup?.name || "Food2Go";
    const projectNameAr = kitchenData?.app_setup?.ar_name || "فود تو جو";
    const firstColor = kitchenData?.app_setup?.first_color || "#9e090f";
    const secondColor = kitchenData?.app_setup?.second_color || "#6B6A6A";
    const thirdColor = kitchenData?.app_setup?.third_color || "#d7030b1A";
    const logo = kitchenData?.app_setup?.logo;
    const notificationSound = kitchenData?.notification;
    const preparingTimeStr = kitchenData?.kitchen?.preparing_time;

    // Update CSS variables
    useEffect(() => {
        document.documentElement.style.setProperty('--first-color', firstColor);
        document.documentElement.style.setProperty('--second-color', secondColor);
        document.documentElement.style.setProperty('--third-color', thirdColor);
    }, [firstColor, secondColor, thirdColor]);

    const audioRef = useRef(null);

    console.log(auth.kitchen)

    // Language state
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const projectName = selectedLanguage === "ar" ? projectNameAr : projectNameEn;

    // Translations

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

    const { postData: logoutPost } = usePost({ url: `${apiUrl}/api/logout` });
    const { changeState: markAsReadPost, loadingChange: loadingMarkAsRead } = useChangeState();
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

    const handlers = useSwipeable({
        onSwipedLeft: () => handleSwipe("left"),
        onSwipedRight: () => handleSwipe("right"),
        trackMouse: true,
    });

    const chefData = {
        name: auth?.kitchen?.kitchen.name || "Unknown Chef",
        phone: auth?.kitchen?.branch_phone || "N/A",
        branch: auth?.kitchen?.kitchen?.branch?.name || "Main Kitchen",
    };

    const transformOrders = (data) => {
        if (data && data.kitchen_order) {
            return data.kitchen_order.map(order => ({
                id: order.id.toString(),
                rawType: order.type, // Store original API value for filtering
                type: order.type === "take_away" ? t.takeAway : order.type === "dine_in" ? t.dineIn : t.delivery,
                date: order.created_at,
                dateFormatted: order.created_at
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
                    notes: item.notes || item.note || "",
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

        // Play sound if new notifications arrive
        if (transformedNotifications.length > notifications.length) {
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
        }

        setOrders(transformedOrders);
        setNotifications(transformedNotifications);

        if (transformedOrders.length > 0 && !selectedOrder) {
            setSelectedOrder(transformedOrders[0]);
            setCurrentSlideIndex(0);
        }
    }, [ordersData, notificationsData, selectedLanguage]);

    const handleOrderClick = (orderId) => {
        const order = orders.find(o => o.id === orderId) || notifications.find(o => o.id === orderId);
        if (order) {
            setSelectedOrder(order);
            const index = orders.findIndex(o => o.id === orderId);
            setCurrentSlideIndex(index !== -1 ? index : 0);
            setShowOrderDialog(true);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        const url = `${apiUrl}/kitchen/orders/done_status/${orderId}`;
        const success = await changeState(url, "Order Status", { status: newStatus });
        if (success) {
            setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
            setNotifications(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
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
            const orderToMove = notifications.find(o => o.id === orderId);
            if (orderToMove) {
                setOrders(prev => {
                    if (prev.some(o => o.id === orderId)) return prev;
                    return [orderToMove, ...prev];
                });
            }
            setNotifications(prev => prev.filter(order => order.id !== orderId));
            await Promise.all([refetchNotifications(), refetchOrders()]);
        }
    };

    const handleShowDetails = (orderId) => {
        handleOrderClick(orderId);
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
        const matchesType = filterType === "all" || order.rawType === filterType;
        const matchesSearch = searchQuery === "" ||
            order.id.includes(searchQuery) ||
            order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.table && order.type === "dine_in" && order.table.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesType && matchesSearch;
    });

    const isOrderUnread = (orderId) => notifications.some(order => order.id === orderId);
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

    return (
        <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-[var(--third-color)] to-white font-sans text-gray-800" dir={isRTL ? "rtl" : "ltr"}>
            <audio ref={audioRef} src={notificationSound} />
            <div className="bg-white rounded-2xl w-full shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4 bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        {logo ? <img src={logo} alt={projectName} className="h-12 w-auto object-contain" /> : <span className="text-4xl font-bold text-[var(--first-color)]">{projectName}</span>}
                        <button onClick={toggleLanguage} className="px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 text-sm font-semibold">{selectedLanguage === "en" ? "العربية" : "English"}</button>
                    </div>
                    <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 flex-grow max-w-md border border-gray-300 focus-within:border-[var(--first-color)]">
                        <input type="text" placeholder={t.searchPlaceholder} className="border-none outline-none bg-transparent flex-grow text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} disabled={ordersLoading} />
                        <span className="ml-2">🔍</span>
                    </div>
                    <div className="flex gap-2 bg-gray-100 rounded-full p-1">
                        {["all", "take_away", "dine_in", "delivery"].map(type => (
                            <button key={type} onClick={() => setFilterType(type)} disabled={ordersLoading} className={`py-2 px-4 rounded-full text-sm font-semibold transition-all ${filterType === type ? 'bg-[var(--first-color)] text-white shadow-md' : 'text-gray-600 hover:text-[var(--first-color)]'}`}>
                                {type === "all" ? t.all : type === "take_away" ? t.takeAway : type === "dine_in" ? t.dineIn : t.delivery}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowNotificationDialog(true)} disabled={notificationsLoading} className={`p-3 rounded-full hover:bg-gray-100 relative ${notifications.length > 0 ? 'animate-pulse' : ''}`}>
                            <span className="text-xl">🔔</span>
                            {notifications.length > 0 && <span className="absolute top-0 right-0 bg-[var(--first-color)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{notifications.length}</span>}
                        </button>
                        <button onClick={() => setShowChefDialog(true)} className="p-3 rounded-full hover:bg-gray-100"><span className="text-xl">👨‍🍳</span></button>
                    </div>
                </div>

                <div className="flex-grow flex flex-col md:flex-row gap-6 p-4 bg-gray-50">
                    {/* Left Side: All Orders */}
                    <div className="flex-1 p-2 overflow-y-auto max-h-[calc(100vh-200px)] scrollPage">
                        <h2 className="mb-4 text-lg font-semibold text-gray-700">{t.allOrders}</h2>
                        {ordersLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 9 }).map((_, i) => <OrderSkeleton key={i} />)}</div>
                        ) : readOrders.length === 0 ? (
                            <div className="text-center py-20">
                                <span className="text-5xl block mb-4">🧊</span>
                                <p className="text-gray-500">{t.noOrders}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {readOrders.map(order => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        t={t}
                                        preparingTimeStr={preparingTimeStr}
                                        handleOrderClick={handleOrderClick}
                                        handleShowDetails={handleShowDetails}
                                        handleStatusChange={handleStatusChange}
                                        loadingChange={loadingChange}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <SectionSeparator />

                    {/* Right Side: Notifications */}
                    <div className="w-full md:w-64 p-2 overflow-y-auto max-h-[calc(100vh-200px)] scrollPage">
                        <div className="bg-white rounded-2xl p-4 shadow-lg mb-4 border-b-2 border-[var(--first-color)]">
                            <h2 className="text-2xl font-bold text-[var(--first-color)] flex items-center gap-2"><span>🚀</span>{t.notifications}</h2>
                        </div>
                        {notificationsLoading ? <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)}</div> : notifications.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl p-6 border border-dashed border-gray-300">
                                <p className="text-gray-400 text-sm">{t.noNewOrders}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {notifications.map(order => (
                                    <NotificationOrderCard
                                        key={order.id}
                                        order={order}
                                        t={t}
                                        preparingTimeStr={preparingTimeStr}
                                        handleOrderClick={handleOrderClick}
                                        handleShowDetails={handleShowDetails}
                                        handleStatusChange={handleStatusChange}
                                        handleMarkAsRead={handleMarkAsRead}
                                        loadingChange={loadingChange}
                                        loadingMarkAsRead={loadingMarkAsRead}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            {showOrderDialog && (
                <OrderDetailsDialog
                    selectedOrder={selectedOrder}
                    t={t}
                    isOrderUnread={isOrderUnread}
                    setShowOrderDialog={setShowOrderDialog}
                    handlers={handlers}
                    orders={orders}
                    handleOrderClick={handleOrderClick}
                    handleMarkAsRead={handleMarkAsRead}
                    handleStatusChange={handleStatusChange}
                    loadingChange={loadingChange}
                    loadingMarkAsRead={loadingMarkAsRead}
                />
            )}

            {showChefDialog && (
                <ChefDialog
                    chefData={chefData}
                    t={t}
                    handleLogout={handleLogout}
                    setShowChefDialog={setShowChefDialog}
                />
            )}
        </div>
    );
};

export default HomePage;