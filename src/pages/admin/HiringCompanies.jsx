import { useState, useEffect } from "react";
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Building, 
  Briefcase,
  Loader2,
  PlusCircle
} from "lucide-react";
import {
  GetRequest,
  PostRequest,
  PutRequest,
  DeleteRequest,
} from "../../apis/config";
import {
  ADMIN_GET_HIRING,
  ADMIN_CREATE_HIRING,
  ADMIN_UPDATE_HIRING,
  ADMIN_DELETE_HIRING,
} from "../../apis/endpoints";

export default function HiringCompanies() {
  const [companies, setCompanies] = useState([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // ✅ Fetch all companies
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await GetRequest(ADMIN_GET_HIRING);
      const data = Array.isArray(res) ? res : res?.data || [];
      setCompanies(data);
    } catch (err) {
      console.error("Error fetching companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ✅ Add new company
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return alert("Please enter a company name");

    try {
      setIsAdding(true);
      await PostRequest(ADMIN_CREATE_HIRING, { companies: newCompanyName });
      setNewCompanyName("");
      fetchCompanies();
    } catch (err) {
      console.error("Error saving company:", err);
      alert("Failed to add company");
    } finally {
      setIsAdding(false);
    }
  };

  // ✅ Start inline editing
  const handleEdit = (company) => {
    setEditingId(company.id);
    setEditValue(company.companies);
  };

  // ✅ Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // ✅ Save inline edited company
  const handleSaveEdit = async (id) => {
    if (!editValue.trim()) return alert("Please enter a company name");
    try {
      await PutRequest(ADMIN_UPDATE_HIRING(id), { companies: editValue });
      setEditingId(null);
      setEditValue("");
      fetchCompanies();
    } catch (err) {
      console.error("Error updating company:", err);
      alert("Failed to update company");
    }
  };

  // ✅ Delete company
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_HIRING(id));
      fetchCompanies();
    } catch (err) {
      console.error("Error deleting company:", err);
      alert("Failed to delete company");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Hiring Companies</h1>
        <p className="text-slate-500">Manage corporate partners and organizations currently recruiting from our programs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ✅ Add Company Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                <PlusCircle size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Register Partner</h2>
            </div>
            
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Official Company Name</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Building size={16} className="text-slate-400" />
                   </div>
                   <input
                      required
                      placeholder="e.g. Google India"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      className="w-full rounded-xl border-slate-200 border px-4 py-3.5 pl-11 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                   />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isAdding ? <Loader2 size={18} className="animate-spin" /> : (
                  <>
                    <Plus size={18} />
                    <span>Add to Network</span>
                  </>
                )}
              </button>
            </form>

            <div className="px-6 pb-6 pt-2">
               <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <div className="flex gap-3">
                     <Briefcase className="text-indigo-500 mt-0.5 shrink-0" size={18} />
                     <p className="text-xs text-indigo-700 leading-relaxed">Adding companies here displays their logos on the hiring section of the main portal.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* ✅ Company List Section */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                  <Building2 size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Network Directory</h2>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full uppercase tracking-tighter">
                {companies.length} Partners
              </span>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-500" />
                  <p className="font-medium">Syncing with server...</p>
                </div>
              ) : companies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Building2 size={40} className="opacity-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-600">Directory is empty</h3>
                  <p className="text-sm">Start by adding your first hiring partner on the left.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-500 hover:bg-white hover:shadow-xl hover:shadow-brand-500/5 transition-all"
                    >
                      {editingId === company.id ? (
                        <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-left-2">
                           <input
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 bg-white rounded-xl border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all font-bold"
                           />
                           <div className="flex gap-1">
                              <button 
                                 onClick={() => handleSaveEdit(company.id)}
                                 className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
                              >
                                 <Check size={16} />
                              </button>
                              <button 
                                 onClick={handleCancelEdit}
                                 className="p-2 bg-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                              >
                                 <X size={16} />
                              </button>
                           </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-brand-500 group-hover:border-brand-200 transition-colors">
                               <Building size={16} />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors uppercase tracking-tight">
                              {company.companies}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                               onClick={() => handleEdit(company)}
                               className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                            >
                               <Edit2 size={16} />
                            </button>
                            <button 
                               onClick={() => handleDelete(company.id)}
                               className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                               <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}