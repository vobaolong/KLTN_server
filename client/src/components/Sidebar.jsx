import React from 'react'
import { NavLink } from 'react-router-dom'
import { createSlug } from '../utils/helper'
import { useSelector } from 'react-redux'

const Sidebar = () => {
  const { categories } = useSelector((state) => state.app)
  console.log(categories)
  return (
    <>
      <div className='flex flex-col border divide-y'>
        {categories?.map((e) => (
          <NavLink
            className={({ isActive }) =>
              isActive
                ? 'text-white bg-main text-sm hover:text-main'
                : 'px-5 pt-4 pb-3 text-sm hover:text-main'
            }
            key={createSlug(e.title)}
            to={createSlug(e.title)}
          >
            {e.title}
          </NavLink>
        ))}
      </div>
    </>
  )
}

export default Sidebar
