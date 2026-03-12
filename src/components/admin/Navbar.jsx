// Navbar.jsx - Enhanced UI
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, MessageSquare, Search, Menu, User, ChevronDown, LogOut, Settings } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    // Add logout logic here
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex w-full bg-white border-b border-slate-200">
      <div className="flex h-[64px] w-full items-center justify-between px-6">
        
        {/* Left - Search */}
        <div className="flex items-center flex-1">
          <div className="relative w-full max-w-md hidden md:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search admin panel..."
              className="block w-full rounded-full border-0 py-2 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 bg-slate-50 hover:bg-white transition-all outline-none"
            />
          </div>
          <button className="md:hidden p-2 text-slate-500 hover:text-slate-700">
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Right - Profile & Actions */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          
          <button className="relative p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          <div className="h-8 w-px bg-slate-200 mx-2"></div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold shadow-sm">
                A
              </div>
              <div className="hidden md:flex flex-col items-start pr-1">
                <span className="text-sm font-semibold text-slate-700 leading-none">Admin User</span>
                <span className="text-xs text-slate-500">Super Admin</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-20 animate-fade-in border border-slate-100">
                  <div className="px-4 py-3 border-b border-slate-100 mb-1">
                    <p className="text-sm text-slate-500">Signed in as</p>
                    <p className="text-sm font-medium text-slate-900 truncate">admin@dlk.com</p>
                  </div>
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600">
                    <User className="h-4 w-4" />
                    Your Profile
                  </Link>
                  <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;