import axios from "axios";
import { useAuth } from "../Context/Auth";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";

export const usePost = ({ url, type = false }) => {
       const auth = useAuth();
       const kitchen = useSelector(state => state?.kitchen?.data || null);

       const mutation = useMutation({
              mutationFn: async ({ data, name }) => {
                     const contentType = type ? 'application/json' : 'multipart/form-data';
                     const config = kitchen?.token
                            ? {
                                   headers: {
                                          'Content-Type': contentType,
                                          'Authorization': `Bearer ${kitchen?.token || ''}`,
                                   },
                            }
                            : {
                                   headers: { 'Content-Type': contentType },
                            };

                     const response = await axios.post(url, data, config);
                     return { response, name };
              },
              onSuccess: ({ response, name }) => {
                     if (response.status === 200) {
                            if (name) {
                                   auth.toastSuccess(name);
                            }
                     }
              },
              onError: (error) => {
                     console.error('Error post JSON:', error);

                     // Special case: if this is the "processing order" error, just let it be handled if needed
                     if (error?.response?.data?.errors === "You has order at proccessing") {
                            // We could re-throw or handle it specifically, but for now we follow the original logic
                            // which was to throw it to be handled by the component. 
                            // In React Query, we can check error in the component.
                     }

                     if (error?.response?.data?.errors) {
                            if (typeof error.response.data.errors === 'object') {
                                   Object.entries(error.response.data.errors).forEach(([field, messages]) => {
                                          if (Array.isArray(messages)) {
                                                 messages.forEach(message => {
                                                        auth.toastError(message);
                                                 });
                                          } else {
                                                 auth.toastError(messages);
                                          }
                                   });
                            } else {
                                   auth.toastError(error.response.data.errors);
                            }
                     } else if (error?.response?.data?.message) {
                            auth.toastError(error.response.data.message);
                     } else {
                            auth.toastError('An unknown error occurred.');
                     }
              }
       });

       const postData = async (data, name) => {
              try {
                     await mutation.mutateAsync({ data, name });
              } catch (error) {
                     if (error?.response?.data?.errors === "You has order at proccessing") {
                            throw error;
                     }
              }
       };

       return {
              postData,
              loadingPost: mutation.isPending,
              response: mutation.data?.response,
              error: mutation.error,
              isSuccess: mutation.isSuccess
       };
};

