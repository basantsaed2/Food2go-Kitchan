import axios from "axios";
import { useAuth } from "../Context/Auth";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeKitchen } from "../Store/CreateSlices";
import { useQuery } from "@tanstack/react-query";

export const useGet = ({ url, required }) => {
    const kitchen = useSelector(state => state?.kitchen?.data || '');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { data, isLoading, refetch } = useQuery({
        queryKey: [url],
        queryFn: async () => {
            try {
                const response = await axios.get(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': kitchen?.token ? `Bearer ${kitchen?.token}` : '',
                    },
                });
                return response.data;
            } catch (error) {
                console.error('errorGet', error);
                if (error.response?.data?.message === "Unauthenticated." && (error.status === 401 || error.response?.status === 401)) {
                    dispatch(removeKitchen()); // Remove from Redux
                    localStorage.clear();
                    navigate('/login', { replace: true });
                }
                throw error;
            }
        },
        enabled: !required || (required === true && !!kitchen?.token),
    });

    return { refetch, loading: isLoading, data, required };
};

