import { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight,
  AlertCircle,
  Loader2
} from "lucide-react";
import { PostRequest } from "../../apis/config";
import { ADMIN_LOGIN } from "../../apis/endpoints";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await PostRequest(ADMIN_LOGIN, form);
      localStorage.setItem("admin", JSON.stringify(data.admin));
      navigate("/");
    } catch (err) {
      setError(err?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans selection:bg-brand-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in">
        {/* Brand/Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-brand-500/20 flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
             <ShieldCheck size={40} className="text-brand-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">DLK Admin</h1>
          <p className="text-slate-500 font-medium">Control center authentication</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-slate-200 border border-white/40 overflow-hidden">
          <div className="p-8 md:p-10">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome Back</h2>
            <p className="text-slate-500 text-sm mb-8">Please enter your details to sign in</p>

            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={18} className="text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                  </div>
                  <input
                    required
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Enter admin username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                  </div>
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-2xl border border-red-100 animate-shake">
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="text-sm font-bold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-500/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-slate-50/80 px-8 py-6 border-t border-slate-100 flex items-center justify-center gap-2 text-sm">
             <span className="text-slate-400 font-medium">Restricted Access</span>
             <span className="w-1 h-1 rounded-full bg-slate-300"></span>
             <span className="text-slate-500 font-bold uppercase tracking-tighter text-[10px]">Portal v2.0</span>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-400 text-xs font-medium tracking-tight">
          &copy; {new Date().getFullYear()} DLK Software Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
}