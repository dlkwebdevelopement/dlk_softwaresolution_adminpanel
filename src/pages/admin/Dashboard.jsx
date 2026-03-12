import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { GetRequest } from "../../apis/config";
import { 
  ADMIN_GET_CATEGORIES, 
  ADMIN_GET_SUBCATEGORIES, 
  ADMIN_GET_ENQUIRIES, 
  ADMIN_GET_ALL_QUESTIONS 
} from "../../apis/endpoints";
import {
  FolderTree,
  CornerDownRight,
  Mail,
  HelpCircle,
  TrendingUp,
  Plus,
  Image as ImageIcon,
  MessageSquare,
  Edit
} from "lucide-react";

const StatCard = ({ title, count, icon, colorClass, iconClass }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col h-full">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-slate-500 text-sm font-semibold mb-1">{title}</h3>
        <p className="text-slate-900 text-3xl font-bold">{count}</p>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        {icon}
      </div>
    </div>
    <div className="mt-auto flex items-center gap-1.5">
      <TrendingUp className="w-4 h-4 text-emerald-500" />
      <span className="text-emerald-500 text-sm font-semibold">Active</span>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    cats: 0,
    subs: 0,
    enquiries: 0,
    faqs: 0,
  });

  const fetch = async () => {
    try {
      const cats = await GetRequest(ADMIN_GET_CATEGORIES);
      const subs = await GetRequest(ADMIN_GET_SUBCATEGORIES);
      const enquiries = await GetRequest(ADMIN_GET_ENQUIRIES);
      const faqs = await GetRequest(ADMIN_GET_ALL_QUESTIONS);

      setCounts({
        cats: Array.isArray(cats) ? cats.length : cats?.data?.length || 0,
        subs: Array.isArray(subs) ? subs.length : subs?.data?.length || 0,
        enquiries: Array.isArray(enquiries) ? enquiries.length : enquiries?.data?.length || 0,
        faqs: Array.isArray(faqs) ? faqs.length : faqs?.data?.length || 0,
      });
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in py-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Categories" 
          count={counts.cats} 
          icon={<FolderTree className="h-6 w-6 text-blue-600" />}
          colorClass="bg-blue-50"
        />
        <StatCard 
          title="Subcategories" 
          count={counts.subs} 
          icon={<CornerDownRight className="h-6 w-6 text-purple-600" />}  
          colorClass="bg-purple-50"
        />
        <StatCard 
          title="Enquiries" 
          count={counts.enquiries} 
          icon={<Mail className="h-6 w-6 text-amber-600" />}
          colorClass="bg-amber-50"
        />
        <StatCard 
          title="FAQ Items" 
          count={counts.faqs} 
          icon={<HelpCircle className="h-6 w-6 text-emerald-600" />}  
          colorClass="bg-emerald-50"
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <span>Quick Actions</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Add Category", path: "/categories", icon: <Plus className="w-5 h-5 mb-2 text-blue-500" /> },
            { label: "Manage Banners", path: "/banners", icon: <ImageIcon className="w-5 h-5 mb-2 text-purple-500" /> },
            { label: "View Enquiries", path: "/enquiries", icon: <MessageSquare className="w-5 h-5 mb-2 text-amber-500" /> },
            { label: "Update FAQ", path: "/faq", icon: <Edit className="w-5 h-5 mb-2 text-emerald-500" /> },
          ].map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 transition-all duration-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              {action.icon}
              <span className="text-sm font-semibold">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
