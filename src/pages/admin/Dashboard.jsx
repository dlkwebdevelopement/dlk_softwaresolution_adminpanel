import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { GetRequest } from "../../apis/config";
import { 
  ADMIN_GET_ENQUIRIES,
  ADMIN_GET_ALL_CONTACTS,
  ADMIN_GET_REGISTER,
} from "../../apis/endpoints";
import {
  TrendingUp,
  Plus,
  Image as ImageIcon,
  MessageSquare,
  Edit,
  Mail,
  Users,
  GraduationCap,
  ArrowRight,
  Loader2,
  CheckCircle2,
  LayoutDashboard,
  Calendar,
  Layers
} from "lucide-react";

const StatCard = ({ title, count, icon, color, path, navigate, subtitle }) => (
  <div 
    onClick={() => navigate(path)}
    className="group bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-100 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full active:scale-[0.98]"
  >
    <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-${color === 'brand' ? 'brand' : color}-50/50 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl`} />
    
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-xl bg-${color === 'brand' ? 'brand' : color}-50 text-${color === 'brand' ? 'brand' : color}-600 shadow-inner group-hover:scale-110 transition-all duration-500 border border-${color === 'brand' ? 'brand' : color}-100/20`}>
        {icon}
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 mb-1">{title}</span>
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-100/50">
          <TrendingUp size={9} />
          <span className="text-[8px] font-black uppercase tracking-tight">Sync</span>
        </div>
      </div>
    </div>
    
    <div className="relative z-10">
      <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">{count}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
    </div>
    
    <div className="mt-auto pt-4 flex items-center justify-between relative z-10">
      <span className="text-[9px] font-black text-brand-600 uppercase tracking-[0.1em] group-hover:tracking-[0.15em] transition-all">Go to Module</span>
      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enquiries: 0,
    newEnquiries: 0,
    contacts: 0,
    registrations: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enquiries, contacts, registrations] = await Promise.all([
        GetRequest(ADMIN_GET_ENQUIRIES),
        GetRequest(ADMIN_GET_ALL_CONTACTS),
        GetRequest(ADMIN_GET_REGISTER)
      ]);

      const enquiryList = Array.isArray(enquiries) ? enquiries : enquiries?.data || [];
      const contactList = Array.isArray(contacts) ? contacts : contacts?.data || [];
      const registrationList = Array.isArray(registrations) ? registrations : registrations?.data || [];

      setStats({
        enquiries: enquiryList.length,
        newEnquiries: enquiryList.filter(e => !e.isRead).length,
        contacts: contactList.length,
        newContacts: contactList.filter(c => !c.isRead).length,
        registrations: registrationList.length,
        newRegistrations: registrationList.filter(r => !r.isRead).length,
      });
    } catch (err) {
      console.error("Dashboard Aggregation Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto p-1 md:p-3 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xl">
               <LayoutDashboard size={16} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Operational Overview</h1>
          </div>
          <p className="text-slate-500 font-medium text-xs ml-0.5">System is online. Real-time metrics are synced.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm">
           <div className="px-3 py-1 text-right border-r border-slate-100">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none mb-0.5">Last Update</p>
              <p className="text-[10px] font-bold text-slate-700">Just Now</p>
           </div>
           <button onClick={fetchData} className="p-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-600 hover:text-white transition-all active:scale-95">
              <TrendingUp size={16} />
           </button>
        </div>
      </div>

      {loading ? (
        <div className="h-[250px] flex flex-col items-center justify-center bg-white rounded-[32px] border border-slate-100 shadow-sm text-slate-300">
           <Loader2 size={40} className="animate-spin mb-3 text-brand-500" />
           <span className="text-[9px] font-black uppercase tracking-[0.2em]">Syncing...</span>
        </div>
      ) : (
        <>
          {/* Main Analytical Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard 
              title="Course Inquiries" 
              count={stats.enquiries} 
              subtitle={`${stats.newEnquiries} New Leads`}
              icon={<Mail size={22} />}
              color="brand"
              path="/enquiries"
              navigate={navigate}
            />
            <StatCard 
              title="Network Contacts" 
              count={stats.contacts} 
              subtitle={`${stats.newContacts} Pending Messages`}
              icon={<Users size={22} />}
              color="blue"
              path="/contacts"
              navigate={navigate}
            />
            <StatCard 
              title="Student Registry" 
              count={stats.registrations} 
              subtitle={`${stats.newRegistrations} New Admissions`}
              icon={<GraduationCap size={22} />}
              color="indigo"
              path="/register"
              navigate={navigate}
            />
          </div>

          {/* Quick Command Center */}
          <div className="bg-slate-900 rounded-[24px] p-6 shadow-2xl relative overflow-hidden">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[80px] -mr-40 -mt-40" />
             <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-500/10 rounded-full blur-[80px] -ml-28 -mb-28" />

             <div className="relative z-10">
               <div className="flex items-center justify-between mb-6">
                 <div>
                   <h2 className="text-lg font-black text-white italic tracking-tight mb-0.5">Quick Actions</h2>
                   <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">Administrative protocols</p>
                 </div>
                 <div className="hidden md:flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Priority Systems Engaged</span>
                 </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                 {[
                   { label: "Add Category", description: "New segment", path: "/categories", icon: <Layers size={18} />, color: "text-brand-400" },
                   { label: "Deploy Banner", description: "Hero visuals", path: "/banners", icon: <ImageIcon size={18} />, color: "text-indigo-400" },
                   { label: "New Live Session", description: "Live classroom", path: "/liveclass", icon: <Calendar size={18} />, color: "text-blue-400" },
                   { label: "Modify FAQs", description: "Knowledge base", path: "/faq", icon: <MessageSquare size={18} />, color: "text-emerald-400" },
                 ].map((action, index) => (
                   <button
                     key={index}
                     onClick={() => navigate(action.path)}
                     className="group flex flex-col items-start p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-left backdrop-blur-sm"
                   >
                     <div className={`p-2.5 rounded-lg bg-white/5 ${action.color} mb-3 group-hover:scale-110 transition-transform duration-500`}>
                       {action.icon}
                     </div>
                     <span className="text-white font-black text-xs mb-0.5 tracking-tight">{action.label}</span>
                     <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest">{action.description}</span>
                   </button>
                 ))}
               </div>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
