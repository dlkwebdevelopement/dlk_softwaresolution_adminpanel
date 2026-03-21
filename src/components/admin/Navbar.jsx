// Navbar.jsx - Enhanced UI with Real-time Notifications
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, MessageSquare, Search, Menu, User, ChevronDown, LogOut, Settings, Clock, UserPlus, Info } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    navigate("/login");
  };

  const handleNotifClick = (notif) => {
    markAsRead(notif.id);
    setNotifOpen(false);
    
    // Determine path and highlighting
    let path = "";
    if (notif.type === "Enquiry") path = `/enquiries?highlight=${notif.id}`;
    if (notif.type === "Registration") path = `/register?highlight=${notif.id}`;
    if (notif.type === "Contact") path = `/contacts?highlight=${notif.id}`;
    
    navigate(path);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <header className="fixed top-0 right-0 z-40 flex w-full md:w-[calc(100%-250px)] h-[64px] bg-white border-b border-slate-200">
      <div className="flex h-[64px] w-full items-center justify-between px-4 md:px-6">
        
        {/* Left - Hamburger & Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-base md:text-lg font-bold text-slate-800 hidden md:block lg:block">Admin Dashboard</h2>
        </div>

        {/* Right - Notifications & Profile */}
        <div className="flex items-center gap-4">
          
          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className={`relative p-2 rounded-full transition-all duration-300 ${notifOpen ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'}`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 z-20 overflow-hidden animate-slide-up">
                  <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-brand-50/30">
                    <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                    <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-2 py-0.5 rounded-full">LIVE</span>
                  </div>
                  
                  <div className="max-height-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-400">No new notifications</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          className={`flex items-start gap-3 p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${!notif.read ? 'bg-brand-50/20' : ''}`}
                        >
                          <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                            notif.type === 'Enquiry' ? 'bg-blue-100 text-blue-600' : 
                            notif.type === 'Registration' ? 'bg-green-100 text-green-600' : 
                            'bg-amber-100 text-amber-600'
                          }`}>
                            {notif.type === 'Enquiry' ? <Info className="h-4 w-4" /> : 
                             notif.type === 'Registration' ? <UserPlus className="h-4 w-4" /> : 
                             <MessageSquare className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 line-clamp-1">{notif.name}</p>
                            <p className="text-[11px] text-slate-600 line-clamp-1">
                              {notif.type === 'Enquiry' ? `Intersted in ${notif.course}` :
                               notif.type === 'Registration' ? `Signed up for ${notif.course}` :
                               'Sent a new contact message'}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                              <Clock className="h-3 w-3" />
                              {getTimeAgo(notif.receivedAt)}
                            </div>
                          </div>
                          {!notif.read && (
                            <div className="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                      <button className="w-full py-2 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors">
                        View All Activity
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

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
              <ChevronDown className={`h-4 w-4 text-slate-400 hidden md:block transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-20 border border-slate-100 overflow-hidden animate-slide-up">
                  <div className="px-4 py-3 border-b border-slate-100 mb-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Account</p>
                    <p className="text-sm font-medium text-slate-900 truncate">admin@dlk.com</p>
                  </div>
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50/50 hover:text-brand-600 transition-colors">
                    <User className="h-4 w-4" />
                    Your Profile
                  </Link>
                  <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50/50 hover:text-brand-600 transition-colors">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors"
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