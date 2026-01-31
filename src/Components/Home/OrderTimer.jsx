import React, { useState, useEffect } from "react";

const OrderTimer = ({ date, status, preparingTimeStr, children }) => {
    const [isLate, setIsLate] = useState(false);

    useEffect(() => {
        if (status === "done") return;

        const checkLate = () => {
            if (!date || !preparingTimeStr) return;

            const now = new Date();

            // Normalize date string for cross-browser parsing (especially for Safari/mobile)
            // If date is "2025-12-31 15:00:00", convert to "2025-12-31T15:00:00Z" (assuming UTC)
            let normalizedDate = date;
            if (typeof normalizedDate === 'string' && !normalizedDate.includes('T')) {
                normalizedDate = normalizedDate.replace(' ', 'T');
                if (!normalizedDate.includes('Z') && !normalizedDate.includes('+')) {
                    normalizedDate += 'Z'; // Assume server returns UTC
                }
            }

            const createdAt = new Date(normalizedDate);
            const diffMs = now.getTime() - createdAt.getTime();

            // Parse preparing_time (HH:MM:SS)
            const parts = preparingTimeStr.split(':').map(Number);
            const hrs = parts[0] || 0;
            const mins = parts[1] || 0;
            const secs = parts[2] || 0;
            const prepMs = ((hrs * 3600) + (mins * 60) + secs) * 1000;

            const late = prepMs > 0 && diffMs > prepMs;

            // Helpful logging for the developer to see why it might not be flashing
            if (late !== isLate) {
                console.log(`Order Timer Check: 
                    Now: ${now.toISOString()}
                    Created: ${createdAt.toISOString()}
                    Elapsed: ${Math.floor(diffMs / 1000)}s
                    Required: ${Math.floor(prepMs / 1000)}s
                    Is Late: ${late}`);
            }

            setIsLate(late);
        };

        checkLate();
        const interval = setInterval(checkLate, 5000); // Check every 5s for better responsiveness
        return () => clearInterval(interval);
    }, [date, status, preparingTimeStr, isLate]);

    return children(isLate);
};


export default OrderTimer;
