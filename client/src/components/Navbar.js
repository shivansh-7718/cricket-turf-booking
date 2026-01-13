// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { motion } from 'framer-motion';
// import {
//   FaSignOutAlt,
//   FaCalendarAlt,
//   FaChartLine,
//   FaBars,
//   FaTimes
// } from 'react-icons/fa';
// import CalendarModal from './CalendarModal'; // ✅ ADD THIS

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const [menuOpen, setMenuOpen] = useState(false);
//   const [calendarOpen, setCalendarOpen] = useState(false); // ✅ NEW

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//     setMenuOpen(false);
//   };

//   // ✅ When date is selected from calendar
//   const handleDateSelect = (date) => {
//     const formatted = date.toISOString().split('T')[0];
//     setCalendarOpen(false);
//     setMenuOpen(false);
//     navigate(`/slots?date=${formatted}`);
//   };

//   return (
//     <>
//       <motion.nav
//         initial={{ y: -100 }}
//         animate={{ y: 0 }}
//         className="bg-white shadow-lg sticky top-0 z-50"
//       >
//         <div className="max-w-7xl mx-auto px-4 py-3">
//           {/* TOP BAR */}
//           <div className="flex items-center justify-between">
//             {/* LOGO */}
//             <Link to="/" className="flex items-center space-x-2">
//               <FaCalendarAlt className="text-primary-600 text-2xl" />
//               <span className="text-xl font-bold text-primary-600">
//                 Cricket Turf
//               </span>
//             </Link>

//             {/* DESKTOP MENU */}
//             <div className="hidden md:flex items-center gap-4">
//               {user ? (
//                 <>
//                   {user.role === 'admin' && (
//                     <Link
//                       to="/admin/analytics"
//                       className="text-primary-600 font-semibold"
//                     >
//                       <FaChartLine className="inline mr-1" />
//                       AI Dashboard
//                     </Link>
//                   )}

//                   {/* ✅ BOOK SLOT → OPEN CALENDAR */}
//                   <button
//                     onClick={() => setCalendarOpen(true)}
//                     className="btn-primary text-sm py-2 px-4"
//                   >
//                     Book Slot
//                   </button>

//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center gap-1 text-red-600"
//                   >
//                     <FaSignOutAlt /> Logout
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <Link to="/login" className="btn-primary text-sm py-2 px-5">
//                     Login
//                   </Link>
//                   <Link to="/register" className="btn-primary text-sm py-2 px-5">
//                     Register
//                   </Link>
//                 </>
//               )}
//             </div>

//             {/* MOBILE HAMBURGER */}
//             <button
//               className="md:hidden ml-auto text-2xl text-primary-600"
//               onClick={() => setMenuOpen(!menuOpen)}
//             >
//               {menuOpen ? <FaTimes /> : <FaBars />}
//             </button>
//           </div>

//           {/* MOBILE DROPDOWN */}
//           {menuOpen && (
//             <div className="md:hidden mt-4 flex flex-col items-center gap-4">
//               {user ? (
//                 <>
//                   {user.role === 'admin' && (
//                     <Link
//                       to="/admin/analytics"
//                       onClick={() => setMenuOpen(false)}
//                       className="btn-primary w-full text-center py-2"
//                     >
//                       AI Dashboard
//                     </Link>
//                   )}

//                   {/* ✅ MOBILE BOOK SLOT */}
//                   <button
//                     onClick={() => setCalendarOpen(true)}
//                     className="btn-primary w-full text-center py-2"
//                   >
//                     Book Slot
//                   </button>

//                   <button
//                     onClick={handleLogout}
//                     className="text-red-600 font-semibold"
//                   >
//                     Logout
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <Link
//                     to="/login"
//                     onClick={() => setMenuOpen(false)}
//                     className="btn-primary w-full text-center py-2"
//                   >
//                     Login
//                   </Link>

//                   <Link
//                     to="/register"
//                     onClick={() => setMenuOpen(false)}
//                     className="btn-primary w-full text-center py-2"
//                   >
//                     Register
//                   </Link>
//                 </>
//               )}
//             </div>
//           )}
//         </div>
//       </motion.nav>

//       {/* ✅ CALENDAR MODAL */}
//       <CalendarModal
//         open={calendarOpen}
//         onClose={() => setCalendarOpen(false)}
//         onSelectDate={handleDateSelect}
//       />
//     </>
//   );
// };

// export default Navbar;



import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FaSignOutAlt,
  FaCalendarAlt,
  FaChartLine,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import CalendarModal from './CalendarModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  // ✅ Date selected from calendar
  const handleDateSelect = (date) => {
    const formatted = date.toISOString().split('T')[0];
    setCalendarOpen(false);
    setMenuOpen(false);
    navigate(`/slots?date=${formatted}`);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-lg sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <Link to="/" className="flex items-center space-x-2">
              <FaCalendarAlt className="text-primary-600 text-2xl" />
              <span className="text-xl font-bold text-primary-600">
                Cricket Turf
              </span>
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <span className="font-medium text-gray-700">
                    Hi, {user.name}
                  </span>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin/analytics"
                      className="text-primary-600 font-semibold"
                    >
                      <FaChartLine className="inline mr-1" />
                      AI Dashboard
                    </Link>
                  )}

                  {/* ✅ ONLY THIS BUTTON OPENS CALENDAR
                  <button
                    onClick={() => setCalendarOpen(true)}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Book Slot
                  </button> */}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-red-600"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-primary text-sm py-2 px-5">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-5">
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* MOBILE */}
            <button
              className="md:hidden ml-auto text-2xl text-primary-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden mt-4 flex flex-col items-center gap-4">
              {user ? (
                <>
                  <span className="font-medium text-gray-700">
                    Hi, {user.name}
                  </span>

                  {/* <button
                    onClick={() => setCalendarOpen(true)}
                    className="btn-primary w-full text-center py-2"
                  >
                    Book Slot
                  </button> */}

                  <button
                    onClick={handleLogout}
                    className="text-red-600 font-semibold"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="btn-primary w-full text-center py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="btn-primary w-full text-center py-2"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </motion.nav>

      {/* ✅ CALENDAR MODAL (CONNECTED PROPERLY) */}
      <CalendarModal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onSelect={handleDateSelect}   
      />
    </>
  );
};

export default Navbar;
