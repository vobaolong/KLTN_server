import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import App from './App'
import './index.css'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const container = document.getElementById('root')
const root = createRoot(container)
export const ScrollToTops = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ToastContainer
        position='top-right'
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
      <BrowserRouter>
        <ScrollToTops />
        <App />
        {/* <ScrollToTop
          title='Go to top'
          smooth
          style={{
            justifyContent: 'center',
            display: 'grid',
            alignContent: 'center',
            zIndex: 1000
          }}
        /> */}
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
