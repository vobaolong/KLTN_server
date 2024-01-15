import React, { useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import { Badge, Divider } from '@mui/material'
import { Link } from 'react-router-dom'
import path from '../utils/path'

//
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const shouldShowHeader = scrollY > 200

      setIsScrolled(shouldShowHeader)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const [isCurrencyHovered, setIsCurrencyHovered] = useState(false)
  const [isLangHovered, setIsLangHovered] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState('VND')
  const [selectedLang, setSelectedLang] = useState('VI')

  const handleCurrencyMouseEnter = () => {
    setIsCurrencyHovered(true)
  }

  const handleCurrencyMouseLeave = () => {
    setIsCurrencyHovered(false)
  }

  const handleLangMouseEnter = () => {
    setIsLangHovered(true)
  }

  const handleLangMouseLeave = () => {
    setIsLangHovered(false)
  }

  const handleCurrencyOptionClick = (currency) => {
    setSelectedCurrency(currency)
    setIsCurrencyHovered(false)
  }

  const handleLangOptionClick = (lang) => {
    setSelectedLang(lang)
    setIsLangHovered(false)
  }

  return (
    <header className='tracking-tight bg-white'>
      <div className='tracking-tight border-b-[1px] w-full h-[40px] py-[13px] flex justify-between items-center text-slate-500 text-sm bg-white'>
        <div className='flex items-center max-w-main w-full px-5 mx-auto'>
          <div className='flex items-center flex-1 '>
            <span className='m-0 py-4 px-0 whitespace-nowrap'>
              Welcome to ZenithTech store!
            </span>
          </div>
          <div className='ml-auto gap-2 items-center flex '>
            <div className='ml-0 relative flex items-center'>
              <Link
                className='leading-none py-2 flex items-center'
                onMouseEnter={handleCurrencyMouseEnter}
                onMouseLeave={handleCurrencyMouseLeave}
                onClick={() => setIsCurrencyHovered(!isCurrencyHovered)}
              >
                {selectedCurrency}
                {isCurrencyHovered && (
                  <ul className='text-md absolute drop-shadow-md z-1000 bg-white p-1 rounded-sm transition-all duration-500 ease-in-out text-gray-700 top-7'>
                    <li
                      className='cursor-pointer hover:text-main p-1'
                      onClick={() => handleCurrencyOptionClick('VND')}
                    >
                      VND
                    </li>
                    <Divider />
                    <li
                      className='cursor-pointer hover:text-main p-1'
                      onClick={() => handleCurrencyOptionClick('USD')}
                    >
                      USD
                    </li>
                  </ul>
                )}
                <KeyboardArrowDownOutlinedIcon fontSize='sm' />
              </Link>
            </div>
            <div className='ml-5 relative flex items-center'>
              <Link
                className='leading-none py-2 flex items-center'
                onMouseEnter={handleLangMouseEnter}
                onMouseLeave={handleLangMouseLeave}
                onClick={() => setIsLangHovered(!isLangHovered)}
              >
                {selectedLang}
                {isLangHovered && (
                  <ul className='text-md absolute drop-shadow-md z-1000 bg-white p-1 rounded-sm transition-all duration-500 ease-in-out text-gray-700 top-7'>
                    <li
                      className='cursor-pointer hover:text-main p-1'
                      onClick={() => handleLangOptionClick('VI')}
                    >
                      VI
                    </li>
                    <Divider />
                    <li
                      className='cursor-pointer hover:text-main p-1'
                      onClick={() => handleLangOptionClick('EN')}
                    >
                      EN
                    </li>
                  </ul>
                )}
                <KeyboardArrowDownOutlinedIcon fontSize='sm' />
              </Link>
            </div>
            <Divider orientation='vertical' variant='fullWidth' flexItem />
            <Link
              to='/'
              className='pl-4 gap-1 items-center flex hover:text-main '
            >
              <ErrorOutlineOutlinedIcon fontSize='small' />
              <span>Need Help</span>
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`h-[110px] py-[35px] flex justify-between ${
          isScrolled
            ? 'opacity-100 fixed transform translate-y-0 bg-white transition-all w-full'
            : 'opacity-100 w-main'
        }`}
      >
        <Link to={`${path.HOME}`}>
          <img src={logo} alt='' className='w-[234px] object-contain' />
        </Link>
        <div className='flex text-[13px] gap-2 divide-x'>
          <div className='flex flex-col px-4 items-center'>
            <Link
              to='tel: +84348073013'
              className='flex gap-2 items-center hover:text-main'
            >
              <LocalPhoneOutlinedIcon />
              <span className='font-semibold'>(+84) 34 8073 013</span>
            </Link>
            <span>Mon-Sat 9:00 AM - 8:00 PM</span>
          </div>

          <div className='flex flex-col items-center px-4'>
            <Link
              to='mailto:support@zenithtech.com'
              className='flex gap-2 items-center hover:text-main'
            >
              <EmailOutlinedIcon />
              <span className='font-semibold'>support@zenithtech.com</span>
            </Link>
            <span>Online support 24/7</span>
          </div>

          <Link
            to='/'
            className='flex items-center justify-center px-4 hover:text-main'
          >
            <Badge badgeContent={4} color='primary'>
              <LocalMallOutlinedIcon fontSize='large' />
            </Badge>
          </Link>

          <Link className='flex items-center justify-center px-4 hover:text-main'>
            <AccountCircleOutlinedIcon fontSize='large' />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
