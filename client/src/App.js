import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import path from './utils/path'
import { Home, Public, Login } from './pages/public'
import { useDispatch } from 'react-redux'
import { getCategories } from './store/asyncAction'

function App() {
  //
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getCategories())
  })
  //
  return (
    <div className='min-h-screen'>
      <Routes>
        <Route path={path.PUBLIC} element={<Public />}>
          <Route path={path.HOME} element={<Home />} />
          <Route path={path.LOGIN} element={<Login />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
