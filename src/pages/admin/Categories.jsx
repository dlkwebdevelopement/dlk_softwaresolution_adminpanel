import { useEffect, useState, useRef } from "react";
import {
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  FolderTree,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  GetRequest,
  PostRequest,
  DeleteRequest,
  PutRequest,
} from "../../apis/api";
import {
  ADMIN_GET_CATEGORIES,
  ADMIN_CREATE_CATEGORY,
  ADMIN_DELETE_CATEGORY,
  ADMIN_UPDATE_CATEGORY,
} from "../../apis/endpoints";

export default function Categories() {
  const [list, setList] = useState([]);
  const [val, setVal] = useState("");
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [editFile, setEditFile] = useState(null);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const [description, setDescription] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await GetRequest(ADMIN_GET_CATEGORIES);
      setList(data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!val.trim()) return;
    const formData = new FormData();
    formData.append("categoryName", val.trim());
    formData.append("description", description.trim());

    if (file) formData.append("image", file);

    try {
      setIsProcessing(true);
      await PostRequest(ADMIN_CREATE_CATEGORY, formData, true);
      setVal("");
      setDescription("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      showToast("Category registered successfully");
      fetchCategories();
    } catch (err) {
      showToast("Registration failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeCategory = async (id) => {
    if (!window.confirm("Purge this category record?")) return;
    try {
      setIsProcessing(true);
      await DeleteRequest(ADMIN_DELETE_CATEGORY(id));
      showToast("Category purged successfully");
      fetchCategories();
    } catch (err) {
      showToast("Purge failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const startEdit = (id, current, desc) => {
    setEditingId(id);
    setEditVal(current);
    setEditDescription(desc || "");
    setEditFile(null);
  };

  const saveEdit = async (id) => {
    if (!editVal.trim()) return;
    const formData = new FormData();
    formData.append("categoryName", editVal.trim());
    formData.append("description", editDescription.trim());

    if (editFile) formData.append("image", editFile);

    try {
      setIsProcessing(true);
      await PutRequest(ADMIN_UPDATE_CATEGORY(id), formData, true);
      setEditingId(null);
      setEditVal("");
      setEditDescription("");
      setEditFile(null);
      if (editFileInputRef.current) editFileInputRef.current.value = "";
      showToast("Category updated successfully");
      fetchCategories();
    } catch (err) {
      showToast("Update failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-0.5">Navbar Segments</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-none">Category Management Terminal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Registration Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Plus className="w-4 h-4 text-brand-500" /> New Category
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Identify</label>
                <input
                  type="text"
                  placeholder="Segment Title"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Scope</label>
                <textarea
                  placeholder="Operational scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm font-medium resize-none shadow-inner"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Iconic Representation</label>
                <div className="relative group/upload">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept="image/*"
                    className="hidden"
                    id="category-upload"
                  />
                  <label 
                    htmlFor="category-upload"
                    className={`cursor-pointer flex items-center justify-center gap-3 w-full border-2 border-dashed rounded-xl p-6 transition-all ${file ? 'border-brand-300 bg-brand-50/50' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'}`}
                  >
                    {!file ? (
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-slate-300 mx-auto mb-2 group-hover/upload:text-brand-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initialize Upload</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-brand-200 flex items-center justify-center shadow-sm">
                          <Check className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tight text-brand-600 truncate max-w-[120px]">{file.name}</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button
                onClick={addCategory}
                disabled={!val.trim() || isProcessing}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white font-black uppercase text-[11px] tracking-widest py-4 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Initiate Protocol <Plus className="w-4 h-4"/></>}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Category Table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                Network Registry <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-lg text-[10px]">{list.length} Records</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 font-black text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Status & Identity</th>
                    <th className="px-6 py-4">Scope / Brief</th>
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
                      <td colSpan={3} className="px-6 py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-[0.2em] italic">No Protocol Segments Detected</td>
                    </tr>
                  ) : (
                    list.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-6 py-4">
                          {editingId === c.id ? (
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden">
                                <input
                                  type="file"
                                  ref={editFileInputRef}
                                  onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                                  accept="image/*"
                                  className="hidden"
                                  id={`edit-file-${c.id}`}
                                />
                                <label htmlFor={`edit-file-${c.id}`} className="absolute inset-0 cursor-pointer flex items-center justify-center bg-slate-900/40 opacity-0 hover:opacity-100 text-white transition-opacity">
                                  <Upload size={12}/>
                                </label>
                                {c.image && <img src={c.image} className="w-full h-full object-cover" />}
                              </div>
                              <input
                                type="text"
                                value={editVal}
                                onChange={(e) => setEditVal(e.target.value)}
                                className="rounded-lg border-slate-200 border px-3 py-1.5 text-xs text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none w-40 font-bold"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                {c.image ? (
                                  <img src={c.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-slate-300" />
                                )}
                              </div>
                              <div>
                                <div className="font-black text-slate-800 text-sm">{c.categoryName || c.category}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active Node</div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingId === c.id ? (
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full rounded-lg border-slate-200 border px-3 py-1.5 text-xs text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none resize-none font-medium h-12"
                            />
                          ) : (
                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm line-clamp-2" title={c.description}>
                              {c.description || <span className="text-slate-200 italic font-black text-[9px] uppercase tracking-widest">No Descriptive Metadata</span>}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editingId === c.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => saveEdit(c.id)} disabled={isProcessing} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100"><Check size={16}/></button>
                              <button onClick={() => setEditingId(null)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all shadow-sm border border-red-100"><X size={16}/></button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEdit(c.id, c.categoryName, c.description)} className="p-2 bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-white rounded-lg transition-all border border-slate-100 shadow-xs"><Edit2 size={16}/></button>
                              <button onClick={() => removeCategory(c.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all border border-slate-100 shadow-xs"><Trash2 size={16}/></button>
                            </div>
                          )}
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
