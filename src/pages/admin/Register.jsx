// Register.jsx
import { useEffect, useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Inbox,
  Loader2
} from "lucide-react";
import { GetRequest } from "../../apis/config";
import { ADMIN_GET_REGISTER } from "../../apis/endpoints";

export default function Register() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await GetRequest(ADMIN_GET_REGISTER);
        setList(data || []);
      } catch (err) {
        console.error("Failed to fetch registrations:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Course Registrations</h1>
        <p className="text-slate-500">View and manage all students who have signed up for courses.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
            <ShieldCheck size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Total Registrations ({list.length})
          </h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
               <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-500" />
               <p className="font-medium text-slate-500">Retrieving registration list...</p>
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Inbox size={64} className="mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-slate-600">No registrations yet</h3>
              <p className="text-sm">New registrations will appear here as soon as students sign up.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((r, index) => (
                <div
                  key={r.id || index}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 transition-all hover:border-brand-500 hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-100 transition-colors">
                      <User size={24} />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                      <CheckCircle2 size={12} />
                      Registered
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{r.fullName}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <Mail size={14} className="shrink-0" />
                        <span className="truncate">{r.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <Phone size={14} className="shrink-0" />
                        <span>{r.phone}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                       <div className="flex items-start gap-2 text-slate-700">
                          <BookOpen size={16} className="shrink-0 mt-0.5 text-brand-500" />
                          <div className="text-sm">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter block mb-0.5">Selected Course</span>
                            <span className="font-medium italic leading-snug">{r.courseName || "General Inquiry"}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
                       <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>Status: ACTIVE</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <Clock size={12} className="hidden" /> {/* Placeholder for Clock if needed */}
                          <span>Portal v2.0</span>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

