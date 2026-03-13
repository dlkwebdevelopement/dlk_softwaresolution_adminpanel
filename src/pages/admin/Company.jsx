import { useEffect, useState, useRef } from "react";
import { 
  Building2, 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2, 
  X,
  Loader2,
  AlertCircle,
  Plus,
  ArrowUpRight
} from "lucide-react";
import { GetRequest, PostRequest, DeleteRequest } from "../../apis/config";
import { ADMIN_UPLOAD_COMPANY, ADMIN_DELETE_COMPANY, ADMIN_GET_COMPANIES } from "../../apis/endpoints";

export default function Company() {
  const [list, setList] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  const fetch = async () => {
    try {
      setLoading(true);
      const data = await GetRequest(ADMIN_GET_COMPANIES);
      setList(data || []);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const upload = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("photo", file);

    try {
      setIsProcessing(true);
      await PostRequest(ADMIN_UPLOAD_COMPANY, fd);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      showToast("Media internalized successfully");
      fetch();
    } catch (err) {
      showToast("Transmission failure", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Terminate this media record?")) return;
    try {
      setIsProcessing(true);
      await DeleteRequest(ADMIN_DELETE_COMPANY(id));
      showToast("Record purged");
      fetch();
    } catch (err) {
      showToast("Purge failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = (e) => {
    if (e) e.preventDefault();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-0.5">Corporate Identities</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-none">Global Partner Management Terminal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Upload Interface */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 mb-6 flex items-center gap-2">
              <UploadCloud size={14}/> Initiate Media Transmission
            </h3>

            <div 
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all min-h-[220px] flex flex-col items-center justify-center ${file ? 'border-brand-500 bg-brand-50/20' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setFile(e.dataTransfer.files[0]);
              }}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="company-upload"
              />
              
              {!file ? (
                <label htmlFor="company-upload" className="cursor-pointer group">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 mx-auto border border-slate-100 group-hover:scale-110 group-hover:border-brand-200 transition-all">
                    <Building2 className="w-6 h-6 text-slate-300 group-hover:text-brand-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Select Media Source</span>
                  <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">DRAG & DROP SUPPORTED</span>
                </label>
              ) : (
                <div className="animate-fade-in text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-brand-200 flex items-center justify-center mb-4 mx-auto relative group">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <button 
                      onClick={clearFile}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <p className="text-[10px] font-black text-brand-600 uppercase tracking-tight mb-2 truncate max-w-[120px]">{file.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Awaiting Synchronization</p>
                </div>
              )}
            </div>

            <button
              onClick={upload}
              disabled={!file || isProcessing}
              className="w-full mt-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white font-black uppercase text-[11px] tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Upload Identity Media <Plus size={14}/></>}
            </button>
          </div>
        </div>

        {/* Right: Registry Table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                Partner Registry <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-lg text-[10px]">{list.length} Records</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 font-black text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Status & Identity</th>
                    <th className="px-6 py-4">Internal Reference ID</th>
                    <th className="px-6 py-4 text-right">Manipulation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
                      </td>
                    </tr>
                  ) : list.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-[0.2em] italic">No Identity Records Detected</td>
                    </tr>
                  ) : (
                    list.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-2 group-hover:bg-white group-hover:shadow-inner transition-all">
                              <img src={c.photoUrl} alt="" className="w-full h-full object-contain drop-shadow-sm" />
                            </div>
                            <div>
                               <div className="font-black text-slate-800 text-[12px] uppercase">Corporate Media</div>
                               <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-tighter">
                                 <CheckCircle2 size={10}/> Verified Asset
                               </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                           <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-slate-400 select-all">{c.id}</span>
                              <ArrowUpRight size={12} className="text-slate-200" />
                           </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => remove(c.id)}
                              disabled={isProcessing}
                              className="p-2.5 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-all border border-slate-100 shadow-xs"
                              title="Delete Photo"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`fixed bottom-6 right-6 z-[250] transition-all transform ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${toast.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-red-500/90 text-white border-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="font-black text-[10px] uppercase tracking-widest leading-none">{toast.message}</span>
          <button onClick={() => setToast({ ...toast, show: false })} className="hover:bg-white/10 rounded-full p-1 transition-all"><X size={12} /></button>
        </div>
      </div>
    </div>
  );
}
