import axios from "axios";
import { useSelector } from "react-redux";
import { useAuth } from "../Context/Auth";
import { useMutation } from "@tanstack/react-query";

export const useDelete = () => {
  const auth = useAuth();
  const token = useSelector(state => state?.kitchen?.data?.token || '');

  const mutation = useMutation({
    mutationFn: async ({ url, name }) => {
      const config = {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      };
      const response = await axios.delete(url, config);
      return { response, name };
    },
    onSuccess: ({ response, name }) => {
      if (response.status === 200) {
        auth.toastSuccess(name);
      }
    },
    onError: (error) => {
      auth.toastError(error.message);
      console.error('Error Delete:', error);
    }
  });

  const deleteData = async (url, name) => {
    try {
      await mutation.mutateAsync({ url, name });
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    deleteData,
    loadingDelete: mutation.isPending,
    responseDelete: mutation.data?.response,
    isSuccess: mutation.isSuccess
  };
};
