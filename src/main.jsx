import { createRoot } from 'react-dom/client'
import './index.css'
import { ContextProvider } from './Context/Auth.jsx'
import { RouterProvider } from 'react-router-dom'
import { router } from './Router.jsx'
import { Provider } from 'react-redux'
import { StoreApp } from './Store/Store.jsx'
import './app.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <Provider store={StoreApp}>
    <QueryClientProvider client={queryClient}>
      <ContextProvider>
        <RouterProvider router={router} />
      </ContextProvider>
    </QueryClientProvider>
  </Provider>
)

