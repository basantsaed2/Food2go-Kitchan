import axios from "axios";
import { useAuth } from "../Context/Auth";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";

export const useChangeState = () => {
  const auth = useAuth();
  const token = useSelector(state => state?.kitchen?.data?.token || '');

  const mutation = useMutation({
    mutationFn: async ({ url, name, data }) => {
      const config = {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      };
      const response = await axios.put(url, data || {}, config);
      return { response, name };
    },
    onSuccess: ({ response, name }) => {
      if (response.status === 200) {
        auth.toastSuccess(name);
      }
    },
    onError: (error) => {
      auth.toastError(error.message);
      console.error('Error changing state:', error);
    }
  });

  const changeState = async (url, name, data) => {
    try {
      await mutation.mutateAsync({ url, name, data });
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    changeState,
    loadingChange: mutation.isPending,
    responseChange: mutation.data?.response,
    isSuccess: mutation.isSuccess
  };
};

