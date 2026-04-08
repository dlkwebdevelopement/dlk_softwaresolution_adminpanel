import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderTree,
  CornerDownRight,
  Image as ImageIcon,
  Building2,
  Briefcase,
  Mail,
  Users,
  Video,
  FileText,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Home,
  BookOpen,
  Contact,
  Youtube,
  Tag,
  Award,
  Calendar,
} from "lucide-react";

const menuItems = [
  { text: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
  { text: "Registrations", icon: <Users size={20} />, path: "/register" },
  { text: "Enquiries", icon: <Mail size={20} />, path: "/enquiries" },
  { text: "Contacts", icon: <Contact size={20} />, path: "/contacts" },
  { text: "Categories", icon: <FolderTree size={20} />, path: "/categories" },
  { text: "Courses", icon: <BookOpen size={20} />, path: "/courses" },
  { text: "Live Classes", icon: <Video size={20} />, path: "/liveclass" },
  { text: "Workshop", icon: <Calendar size={20} />, path: "/workshops-management" },
  { text: "Videos", icon: <Youtube size={20} />, path: "/videos" },
  { text: "Banners", icon: <ImageIcon size={20} />, path: "/banners" },
  { text: "Offers", icon: <Tag size={20} />, path: "/offers" },
  { text: "Placements", icon: <Award size={20} />, path: "/placements" },
  { text: "Gallery Management", icon: <ImageIcon size={20} />, path: "/gallery" },
  { text: "Gallery Events", icon: <Calendar size={20} />, path: "/gallery-events" },
  { text: "Office Gallery", icon: <ImageIcon size={20} />, path: "/office-gallery" },
  { text: "Office Events", icon: <Calendar size={20} />, path: "/office-gallery-events" },
  { text: "Skills", icon: <Briefcase size={20} />, path: "/skills" },
  { text: "Blogs", icon: <FileText size={20} />, path: "/blogs" },
  { text: "Student Projects", icon: <FileText size={20} />, path: "/student-projects" },
  { text: "Testimonial", icon: <MessageSquare size={20} />, path: "/testimonials" },
  { text: "FAQ", icon: <HelpCircle size={20} />, path: "/faq" },
  { text: "Company", icon: <Building2 size={20} />, path: "/company" },
];

const SidebarItem = ({ icon, text, path, subItems }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = location.pathname.includes(path);

  if (subItems) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors duration-200 group ${isActive || isOpen
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
        >
          <div className="flex items-center gap-3">
            <span className={`${isActive || isOpen ? "text-brand-500" : "text-slate-500 group-hover:text-brand-400"}`}>
              {icon}
            </span>
            <span className="font-medium text-sm">{text}</span>
          </div>
          {isOpen ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
        </button>

        {/* Dropdown Content */}
        {isOpen && (
          <div className="mt-1 ml-4 pl-4 border-l border-slate-700/50 space-y-1 py-1 animate-fade-in">
            {subItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${location.pathname === item.path || (item.path !== '/' && location.pathname.includes(item.path))
                    ? "bg-brand-500/10 text-brand-400 font-medium"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                {item.icon && <span className="text-slate-500">{item.icon}</span>}
                <span>{item.text}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-colors duration-200 group ${isActive
          ? "bg-brand-500/10 text-brand-400 font-medium"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
    >
      <span className={`${isActive ? "text-brand-500" : "text-slate-500 group-hover:text-brand-400"}`}>
        {icon}
      </span>
      <span className="text-sm font-medium">{text}</span>
    </Link>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <aside className={`fixed top-0 left-0 w-[250px] h-screen bg-sidebar text-white z-50 flex flex-col shadow-xl transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Brand Header */}
      <div className="h-[64px] min-h-[64px] flex items-center justify-between px-6 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/30">
            D
          </div>
          <span className="font-bold text-lg tracking-wide">DLK Admin</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 md:hidden"
        >
          <ChevronRight className="h-5 w-5 rotate-180" />
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-3 py-6">
        <div className="mb-2 px-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Navigation Terminal</span>
        </div>

        <nav className="space-y-1 mb-8" onClick={() => { if (window.innerWidth < 768) onClose(); }}>
          {menuItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              text={item.text}
              path={item.path}
            />
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-sidebar-border/50 bg-slate-900/50">
        <div className="bg-slate-800 rounded-lg p-3 text-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
          <span className="text-slate-300 font-medium">System Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
