import React from 'react'
import { navigation } from '../utils/contants'
import { NavLink } from 'react-router-dom'

const Navigation = () => {
  return (
    <div className='w-main h-[48x] py-2 border text-sm flex items-center'>
      {navigation.map((e) => (
        <NavLink
          to={e.path}
          key={e.id}
          className={({ isActive }) =>
            isActive
              ? 'pr-12 hover:text-main text-main'
              : 'pr-12 hover:text-main'
          }
        >
          {e.value}
        </NavLink>
      ))}
    </div>
  )
}

export default Navigation
