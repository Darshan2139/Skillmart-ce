import { useRef, useState } from "react"
import { AiOutlineCaretDown } from "react-icons/ai"
import { VscDashboard, VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

import useOnClickOutside from "../../../hooks/useOnClickOutside"
import { logout } from "../../../services/operations/authAPI"

export default function ProfileDropdown({ mobile = false }) {
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useOnClickOutside(ref, () => setOpen(false))

  if (!user) return null

  return (
    <div className={mobile ? "relative w-full flex flex-col items-center" : "relative"}>
      <button
        className={
          mobile
            ? "flex flex-col items-center gap-1 focus:outline-none"
            : "relative"
        }
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-x-1">
          <img
            src={user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-[36px] h-[36px] rounded-full object-cover border-2 border-richblack-700"
          />
          <AiOutlineCaretDown className="text-base text-richblack-100" />
        </div>
      </button>
      {/* Backdrop for mobile */}
      {open && mobile && (
        <div
          className="fixed inset-0 z-[999] bg-black/30 animate-fadein"
          onClick={() => setOpen(false)}
        ></div>
      )}
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          ref={ref}
          className={
            mobile
              ? "absolute left-1/2 top-full mt-2 z-[1000] -translate-x-1/2 w-64 max-w-xs rounded-xl bg-richblack-900 shadow-lg border border-richblack-700 animate-dropdown flex flex-col"
              : "absolute top-[118%] right-0 z-[1000] min-w-[180px] rounded-md border-[1px] border-richblack-700 bg-richblack-800 shadow-lg animate-dropdown"
          }
        >
          <Link to="/dashboard/my-profile" onClick={() => setOpen(false)}>
            <div className="flex w-full items-center gap-x-2 py-4 px-6 text-base text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25 cursor-pointer transition-all">
              <VscDashboard className="text-lg" />
              Dashboard
            </div>
          </Link>
          <div
            onClick={() => {
              dispatch(logout(navigate))
              setOpen(false)
            }}
            className="flex w-full items-center gap-x-2 py-4 px-6 text-base text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25 cursor-pointer transition-all"
          >
            <VscSignOut className="text-lg" />
            Logout
          </div>
        </div>
      )}
      {/* Animations */}
      <style>{`
        @keyframes dropdown {
          0% { opacity: 0; transform: translateY(20px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-dropdown { animation: dropdown 0.18s cubic-bezier(.4,0,.2,1); }
        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadein { animation: fadein 0.2s; }
      `}</style>
    </div>
  )
}