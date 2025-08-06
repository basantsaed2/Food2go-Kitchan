import { useEffect, useState } from 'react';
import LoginBackground from '../../Assets/Images/LoginBackground';
import { usePost } from '../../Hooks/usePost';
import { useAuth } from '../../Context/Auth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
       // API base URL (fallback for local development)
       const apiUrl = import.meta.env.VITE_API_BASE_URL;
       const auth = useAuth();
       // const dispatch = useDispatch();
       const navigate = useNavigate();

       // State for form inputs and errors
       const [name, setName] = useState('');
       const [password, setPassword] = useState('');
       const [loginError, setLoginError] = useState('');
       const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/api/kitchen/auth/login` });

       // Handle form submission
       const handleLogin = (e) => {
              e.preventDefault();
              setLoginError('');

              if (!name) {
                     auth.toastError('Please enter your username.');
                     return;
              }
              if (!password) {
                     auth.toastError('Please enter your password.');
                     return;
              }

              postData({ name, password });
       };

       // Handle login response
       useEffect(() => {
              if (response) {
                     if (response.status === 200) {
                            console.log("response",response)
                            setLoginError('Login successful! Redirecting...');
                            auth.login(response.data);
                            navigate('/');
                     } else {
                            auth.toastError(response.message);
                     }
              }
       }, [response]);

       return (
              <div className="w-full min-h-screen flex items-center justify-center">
                     <div className="w-full flex flex-col md:flex-row shadow-xl rounded-lg overflow-hidden">
                            {/* Left: Form Section */}
                            <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center">
                                   <h1 className="text-3xl md:text-4xl font-bold text-red-800 mb-2">Welcome Back</h1>
                                   <p className="text-red-600 mb-6">Login to your account</p>

                                   {loginError && (
                                          <div
                                                 className={`p-3 rounded-md mb-4 text-sm ${response?.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}
                                                 role="alert"
                                          >
                                                 {loginError}
                                          </div>
                                   )}

                                   <form onSubmit={handleLogin} className="space-y-6">
                                          <div>
                                                 <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                        Username
                                                 </label>
                                                 <input
                                                        id="name"
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        placeholder="Enter your username"
                                                        className="mt-1 w-full p-3 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                                        aria-required="true"
                                                        disabled={loadingPost}
                                                        autoComplete='off'
                                                 />
                                          </div>

                                          <div>
                                                 <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                        Password
                                                 </label>
                                                 <input
                                                        id="password"
                                                        type="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder="Enter your password"
                                                        className="mt-1 w-full p-3 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                                        aria-required="true"
                                                        disabled={loadingPost}
                                                        autoComplete='new-password'
                                                 />
                                          </div>

                                          <button
                                                 type="submit"
                                                 disabled={loadingPost}
                                                 className={`w-full py-3 rounded-md text-white font-semibold transition-colors ${loadingPost ? 'bg-red-400 cursor-not-allowed' : 'bg-red-800 hover:bg-red-700'
                                                        }`}
                                          >
                                                 {loadingPost ? 'Logging in...' : 'Login'}
                                          </button>
                                   </form>
                            </div>

                            {/* Right: Background Image Section */}
                            <div className="hidden md:flex md:w-1/2 items-center justify-center">
                                   <LoginBackground
                                          className="w-full h-full object-cover"
                                          aria-hidden="true"
                                          style={{ maxHeight: '100%' }}
                                   />
                            </div>
                     </div>
              </div>
       );
};

export default LoginPage;