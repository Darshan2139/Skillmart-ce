import { useEffect, useState } from "react"
import { AiOutlineMenu, AiOutlineShoppingCart, AiOutlineClose } from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { useSelector } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"

import logo from "../../assets/Logo/Logo-Full-Light.png"
import { NavbarLinks } from "../../data/navbar-links"
import { apiConnector } from "../../services/apiconnector"
import { categories } from "../../services/apis"
import { ACCOUNT_TYPE } from "../../utils/constants"
import ProfileDropdown from "../core/Auth/ProfileDropDown"

function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [subLinks, setSubLinks] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        setSubLinks(res.data.data)
      } catch (error) {
        console.log("Could not fetch Categories.", error)
      }
      setLoading(false)
    })()
  }, [])

  // console.log("sub links", subLinks)

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <div
      className={`flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 ${
        location.pathname !== "/" ? "bg-richblack-800" : ""
      } transition-all duration-200`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
        </Link>
        {/* Navigation links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-6 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <>
                    <div
                      className={`group relative flex cursor-pointer items-center gap-1 ${
                        matchRoute("/catalog/:catalogName")
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      <p>{link.title}</p>
                      <BsChevronDown />
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                        {loading ? (
                          <p className="text-center">Loading...</p>
                        ) : (subLinks && subLinks.length) ? (
                          <>
                            {subLinks
                              ?.filter(
                                (subLink) => subLink?.courses?.length > 0
                              )
                              ?.map((subLink, i) => (
                                <Link
                                  to={`/catalog/${subLink.name
                                    .split(" ")
                                    .join("-")
                                    .toLowerCase()}`}
                                  className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                                  key={i}
                                >
                                  <p>{subLink.name}</p>
                                </Link>
                              ))}
                          </>
                        ) : (
                          <p className="text-center">No Courses Found</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        {/* Login / Signup / Dashboard */}
        <div className="hidden items-center gap-x-4 md:flex">
          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {token === null && (
            <Link to="/login">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 transition-all duration-150 hover:bg-richblack-700 hover:text-yellow-25">
                Log in
              </button>
            </Link>
          )}
          {token === null && (
            <Link to="/signup">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 transition-all duration-150 hover:bg-richblack-700 hover:text-yellow-25">
                Sign up
              </button>
            </Link>
          )}
          {token !== null && <ProfileDropdown />}
        </div>
        <button 
          className="mr-4 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <AiOutlineClose fontSize={24} fill="#AFB2BF" />
          ) : (
            <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[9998] bg-black/40 transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Dropdown panel */}
          <div className="fixed top-0 right-0 h-full w-[80vw] max-w-xs z-[9999] bg-richblack-900 rounded-l-2xl shadow-2xl border-l border-richblack-700 flex flex-col justify-between animate-slidein">
            {/* Close icon */}
            <div className="flex justify-end p-4">
              <button onClick={() => setMobileMenuOpen(false)}>
                <AiOutlineClose fontSize={28} fill="#AFB2BF" />
              </button>
            </div>
            {/* Cart and Profile at top */}
            <div className="flex flex-row items-center gap-4 px-6 pb-2">
              {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
                <Link to="/dashboard/cart" className="relative" onClick={() => setMobileMenuOpen(false)}>
                  <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
                  {totalItems > 0 && (
                    <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}
              <ProfileDropdown mobile={true} />
            </div>
            {/* Profile and links */}
            <div className="flex flex-col items-start px-6 gap-6 flex-1 overflow-y-auto">
              <ul className="flex flex-col gap-4 text-richblack-25 w-full">
                {NavbarLinks.map((link, index) => (
                  <li key={index} className="text-left w-full">
                    {link.title === "Catalog" ? (
                      <div className="flex flex-col items-start gap-2 w-full">
                        <div className="flex cursor-pointer items-center gap-1">
                          <p>{link.title}</p>
                          <BsChevronDown />
                        </div>
                        <div className="flex flex-col gap-2 pl-4">
                          {loading ? (
                            <p className="text-left">Loading...</p>
                          ) : (subLinks && subLinks.length) ? (
                            subLinks
                              ?.filter((subLink) => subLink?.courses?.length > 0)
                              ?.map((subLink, i) => (
                                <Link
                                  key={i}
                                  to={`/catalog/${subLink.name
                                    .split(" ")
                                    .join("-")
                                    .toLowerCase()}`}
                                  className="rounded-lg bg-transparent py-2 block transition-all duration-150 hover:bg-richblack-700 hover:text-yellow-25"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  <p>{subLink.name}</p>
                                </Link>
                              ))
                          ) : (
                            <p className="text-left">No Courses Found</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Link 
                        to={link?.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full rounded-lg transition-all duration-150 hover:bg-richblack-700 hover:text-yellow-25"
                      >
                        <p className={matchRoute(link?.path) ? "text-yellow-25" : "text-richblack-25"}>
                          {link.title}
                        </p>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              {token === null && (
                <div className="flex gap-4 mt-4">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 transition-all duration-150 hover:bg-richblack-700 hover:text-yellow-25">
                      Log in
                    </button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 transition-all duration-150 hover:bg-richblack-700 hover:text-yellow-25">
                      Sign up
                    </button>
                  </Link>
                </div>
              )}
            </div>
            {/* Slide-in animation */}
            <style>{`
              @keyframes slidein {
                from { transform: translateX(100%); opacity: 0.5; }
                to { transform: translateX(0); opacity: 1; }
              }
              .animate-slidein { animation: slidein 0.25s cubic-bezier(.4,0,.2,1); }
            `}</style>
          </div>
        </>
      )}
    </div>
  )
}

export default Navbar