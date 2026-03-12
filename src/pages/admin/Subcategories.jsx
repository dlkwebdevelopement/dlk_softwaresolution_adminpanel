import { useEffect, useState } from "react";
import {
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  CornerDownRight,
  FolderTree
} from "lucide-react";
import {
  GetRequest,
  PostRequest,
  DeleteRequest,
  PutRequest,
} from "../../apis/config";
import {
  ADMIN_GET_CATEGORIES,
  ADMIN_GET_SUBCATEGORIES,
  ADMIN_CREATE_SUBCATEGORY,
  ADMIN_DELETE_SUBCATEGORY,
  ADMIN_UPDATE_SUBCATEGORY,
} from "../../apis/endpoints";

export default function Subcategories() {
  const [categories, setCategories] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ category_id: "", subcategory: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    category_id: "",
    subcategory: "",
  });

  const fetch = async () => {
    setCategories(await GetRequest(ADMIN_GET_CATEGORIES));
    setList(await GetRequest(ADMIN_GET_SUBCATEGORIES));
  };

  useEffect(() => {
    fetch();
  }, []);

  const add = async () => {
    if (!form.category_id || !form.subcategory.trim()) return;
    await PostRequest(ADMIN_CREATE_SUBCATEGORY, form);
    setForm({ category_id: "", subcategory: "" });
    fetch();
  };

  const remove = async (id) => {
    if (!confirm("Delete?")) return;
    await DeleteRequest(ADMIN_DELETE_SUBCATEGORY(id));
    fetch();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      category_id: item.category_id,
      subcategory: item.subcategory,
    });
  };

  const saveEdit = async (id) => {
    if (!editForm.subcategory.trim()) return;
    await PutRequest(ADMIN_UPDATE_SUBCATEGORY(id), editForm);
    setEditingId(null);
    fetch();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ category_id: "", subcategory: "" });
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in py-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Navbar Subcategories</h1>
        <p className="text-slate-500">Manage specialized topics under your main categories</p>
      </div>

      {/* Add New Subcategory */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-5">Add New Subcategory</h2>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="w-full md:w-1/3 relative">
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full appearance-none rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white shadow-sm"
            >
              <option value="" disabled>Select Parent Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <FolderTree className="h-4 w-4" />
            </div>
          </div>

          <div className="w-full md:w-7/12">
            <input
              type="text"
              placeholder="e.g. Machine Learning, Cyber Security..."
              value={form.subcategory}
              onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
              className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          <button
            onClick={add}
            disabled={!form.category_id || !form.subcategory.trim()}
            className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Subcategories List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            All Subcategories 
            <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-sm font-medium">
              {list.length}
            </span>
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="font-semibold py-3 px-6 w-[40%]">Subcategory Name</th>
                <th className="font-semibold py-3 px-6 w-[40%]">Parent Category</th>
                <th className="font-semibold py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <CornerDownRight className="w-10 h-10 text-slate-300 mb-3" />
                      <p>No subcategories found. Add one above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                list.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                    {editingId === s.id ? (
                      // Inline Edit Mode
                      <td colSpan="3" className="py-3 px-6 bg-slate-50/50">
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <input
                            type="text"
                            value={editForm.subcategory}
                            onChange={(e) => setEditForm({ ...editForm, subcategory: e.target.value })}
                            className="w-full sm:w-[40%] rounded-md border-slate-300 border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="Subcategory name"
                          />
                          
                          <select
                            value={editForm.category_id}
                            onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                            className="w-full sm:w-[40%] rounded-md border-slate-300 border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                          >
                            <option value="" disabled>Select Parent</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.category}
                              </option>
                            ))}
                          </select>
                          
                          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto justify-end">
                            <button
                              onClick={() => saveEdit(s.id)}
                              disabled={!editForm.subcategory.trim() || !editForm.category_id}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-100 text-brand-700 hover:bg-brand-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" /> Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-md text-sm font-medium transition-colors"
                            >
                              <X className="w-4 h-4" /> Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      // Normal View Mode
                      <>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <CornerDownRight className="w-4 h-4 text-slate-300" />
                            <span className="font-medium text-slate-900">{s.subcategory}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            <FolderTree className="w-3.5 h-3.5" />
                            {s.category?.category || "No category"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(s)}
                              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => remove(s.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
