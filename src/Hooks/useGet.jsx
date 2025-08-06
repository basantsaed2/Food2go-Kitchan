import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../Context/Auth";
import { useSelector , useDispatch} from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeKitchen } from "../Store/CreateSlices";

export const useGet = ({ url, required }) => {
    // const auth = useAuth();
    const kitchen = useSelector(state => state?.kitchen?.data || '');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const auth = useAuth();
    const dispatch = useDispatch();

    const fetchData = useCallback(async () => {
        if (required === true && !kitchen?.token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': kitchen?.token ? `Bearer ${kitchen?.token}` : '',
                },
            });
            if (response.status === 200) {
                setData(response.data);
            }
        } catch (error) {
            console.error('errorGet', error);
            if (error.response.data.message === "Unauthenticated." && error.status === 401) {
                dispatch(removeKitchen()); // Remove from Redux
                localStorage.clear();
                navigate('/login', { replace: true });
            }
        } finally {
            setLoading(false);
        }
    }, [url, kitchen?.token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { refetch: fetchData, loading, data, required };
};
