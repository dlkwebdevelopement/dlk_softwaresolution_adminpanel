import { useEffect, useState } from "react";
import { 
  Briefcase, 
  Trash2, 
  CheckCircle2, 
  X,
  Edit,
  Plus,
  ArrowLeft,
  Upload
} from "lucide-react";
import { GetRequest, PostRequest, DeleteRequest, PutRequest } from "../../apis/config";
import { 
  ADMIN_GET_SKILLS, 
  ADMIN_POST_SKILLS, 
  ADMIN_UPDATE_SKILLS, 
  ADMIN_DELETE_SKILLS 
} from "../../apis/endpoints";


export default function Skills() {
  const [list, setList] = useState([]);
  const [view, setView] = useState("list"); // "list" or "form"
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await GetRequest(ADMIN_GET_SKILLS);
      // Backend returns directly [] or { success: true, data: [] } 
      const skillsArray = Array.isArray(res) ? res : res?.data || [];
      setList(skillsArray);
    } catch (err) {
      console.error("Failed to fetch skills:", err);
      alert("Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const resetForm = () => {
    setName("");
    setIconFile(null);
    setIconPreview("");
    setEditingId(null);
    setView("list");
  };

  const handleEdit = (skill) => {
    setName(skill.name || "");
    setIconPreview(skill.icon || "");
    setEditingId(skill._id || skill.id);
    setView("form");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!name) return alert("Skill name is required");

    setSubmitLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    if (iconFile) {
      formData.append("icon", iconFile);
    }

    try {
      if (editingId) {
        const res = await PutRequest(ADMIN_UPDATE_SKILLS(editingId), formData);
        if (res.success) alert("Skill updated successfully!");
      } else {
        const res = await PostRequest(ADMIN_POST_SKILLS, formData);
        if (res.success) alert("Skill created successfully!");
      }
      resetForm();
      fetchSkills();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save skill.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this skill?")) return;
    try {
      const res = await DeleteRequest(ADMIN_DELETE_SKILLS(id));
      if (res.success) {
        alert("Deleted successfully!");
        fetchSkills();
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete.");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in py-6 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Skills Management</h1>
          <p className="text-slate-500 mt-1">Manage course tech stack icons and tool labels displayed on frontend profile grids.</p>
        </div>
        {view === "list" ? (
          <button 
            onClick={() => setView("form")}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Skill
          </button>
        ) : (
          <button 
            onClick={resetForm}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to List
          </button>
        )}
      </div>

      {view === "list" ? (
        /* List View (Table) */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Icon</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Skill Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400">Loading skills...</td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
                      <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No skills found</p>
                      <button onClick={() => setView("form")} className="text-emerald-600 hover:underline text-sm mt-2 font-semibold">Upload your first one</button>
                    </td>
                  </tr>
                ) : (
                  list.map((skill) => (
                    <tr key={skill._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center justify-center relative">
                          {skill.icon ? (
                            <img 
                              src={skill.icon} 
                              alt={skill.name} 
                              className="w-full h-full object-contain transition-transform group-hover:scale-110" 
                            />
                          ) : (
                            <Briefcase className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">{skill.name}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(skill)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => remove(skill._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
      ) : (
        /* Form View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Edit className="w-5 h-5 text-emerald-600" />
                {editingId ? "Edit Skill Details" : "New Skill"}
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Skill Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. React.js, Python, AWS"
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Upload Icon</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors relative cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-slate-400" />
                      <p className="text-slate-600 font-medium">Click to upload or drag & drop</p>
                      <p className="text-slate-400 text-xs">SVG, PNG, JPG (Ideally 1:1 ratio)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                Preview Icon
              </h2>
              
              <div className="space-y-4">
                <div className="relative aspect-square rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center p-6 mx-auto max-w-[200px]">
                   {iconPreview ? (
                     <img src={iconPreview} alt="Skill Preview" className="w-full h-full object-contain" />
                   ) : (
                     <Briefcase className="w-16 h-16 text-slate-300" />
                   )}
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={submitLoading}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-75"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {submitLoading ? "Saving..." : editingId ? "Update Skill" : "Save Skill"}
                  </button>
                  <button
                    onClick={resetForm}
                    className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
