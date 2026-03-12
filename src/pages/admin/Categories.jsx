import { useEffect, useState, useRef } from "react";
import {
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import {
  GetRequest,
  PostRequest,
  DeleteRequest,
  PutRequest,
} from "../../apis/config";
import {
  ADMIN_GET_CATEGORIES,
  ADMIN_CREATE_CATEGORY,
  ADMIN_DELETE_CATEGORY,
  ADMIN_UPDATE_CATEGORY,
} from "../../apis/endpoints";
import { BASE_URL } from "../../apis/api";

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

  const fetchCategories = async () => {
    try {
      const data = await GetRequest(ADMIN_GET_CATEGORIES);
      setList(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!val.trim()) return;
    const formData = new FormData();
    formData.append("category", val.trim());
    formData.append("description", description.trim());

    if (file) formData.append("image", file);

    try {
      await PostRequest(ADMIN_CREATE_CATEGORY, formData, true);
      setVal("");
      setDescription("");

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchCategories();
    } catch (err) {
      console.error("Failed to add category:", err);
      alert("Failed to add category.");
    }
  };

  const removeCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_CATEGORY(id));
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert("Failed to delete category.");
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
    formData.append("category", editVal.trim());
    formData.append("description", editDescription.trim());

    if (editFile) formData.append("image", editFile);

    try {
      await PutRequest(ADMIN_UPDATE_CATEGORY(id), formData, true);
      setEditingId(null);
      setEditVal("");
      setEditDescription("");

      setEditFile(null);
      if (editFileInputRef.current) editFileInputRef.current.value = "";
      fetchCategories();
    } catch (err) {
      console.error("Failed to update category:", err);
      alert("Failed to update category.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditVal("");
    setEditDescription("");

    setEditFile(null);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in py-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Navbar Categories</h1>
        <p className="text-slate-500">Manage your website categories and their images</p>
      </div>

      {/* Add New Category */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Add New Category</h2>
          <div className="grid grid-cols-1 gap-5">
            <input
              type="text"
              placeholder="Category Name"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-y"
            />

            <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-6 text-center hover:bg-slate-100 transition-colors">
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
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                Choose Image
              </label>
              
              {file && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100">
                  <Check className="w-4 h-4" />
                  Selected: {file.name}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-3">PNG, JPG, WEBP up to 5MB</p>
            </div>
            
            <button
              onClick={addCategory}
              disabled={!val.trim()}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm"
            >
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            Categories <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-sm font-medium">{list.length}</span>
          </h2>
          
          {list.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center">
              <FolderTree className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-slate-700 font-medium text-lg mb-1">No categories found</h3>
              <p className="text-slate-500 text-sm">Add your first category using the form above to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {list.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group relative"
                >
                  {editingId === c.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        className="w-full rounded-md border-slate-300 border px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        className="w-full rounded-md border-slate-300 border px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                      />

                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          ref={editFileInputRef}
                          onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                          accept="image/*"
                          className="hidden"
                          id={`edit-upload-${c.id}`}
                        />
                        <label 
                          htmlFor={`edit-upload-${c.id}`}
                          className="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-md text-sm font-medium transition-colors w-full"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Change Image
                        </label>
                        
                        {editFile && (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs truncate border border-emerald-100">
                            <Check className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{editFile.name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => saveEdit(c.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-brand-100 text-brand-700 hover:bg-brand-200 rounded-md text-sm font-medium transition-colors"
                        >
                          <Check className="w-4 h-4" /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-sm font-medium transition-colors"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-4 mb-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {c.image ? (
                            <img
                              src={`${BASE_URL}/${c.image}`}
                              alt={c.category}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <h3 className="font-semibold text-slate-900 text-base truncate pr-8" title={c.category}>
                            {c.category}
                          </h3>
                        </div>
                      </div>
                      
                      {/* Action buttons appear on hover in top right corner */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] border border-slate-100">
                        <button
                          onClick={() => startEdit(c.id, c.category, c.description)}
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeCategory(c.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
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
  );
}
