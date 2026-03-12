import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  User, 
  Quote, 
  X, 
  Upload,
  MessageSquare,
  Loader2
} from "lucide-react";

import {
  GetRequest,
  PostRequest,
  DeleteRequest,
  PutRequest,
} from "../../apis/config";

import {
  ADMIN_GET_ALL_TESIMONIALS,
  ADMIN_POST_TESTIMONIALS,
  ADMIN_DELETE_TESTIMONIALS,
  ADMIN_UPDATE_TESTIMONIALS,
} from "../../apis/endpoints";
import { BASE_URL } from "../../apis/api";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "",
    text: "",
    image: null,
    imagePreview: null
  });

  /* =========================
     FETCH ALL
  ========================== */
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await GetRequest(ADMIN_GET_ALL_TESIMONIALS);
      if (res?.data) {
        setTestimonials(res?.data);
      }
    } catch (error) {
      console.error("Fetch Testimonials Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  /* =========================
     FORM HANDLING
  ========================== */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      name: "",
      role: "",
      text: "",
      image: null,
      imagePreview: null
    });
    setOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      role: item.role,
      text: item.text,
      image: null,
      imagePreview: item.image || null
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({
        ...form,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  /* =========================
     CREATE / UPDATE
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.name || !form.role || !form.text) {
        alert("Please fill all required fields");
        return;
      }

      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("role", form.role);
      formData.append("text", form.text);

      if (form.image) {
        formData.append("image", form.image);
      }

      if (editingId) {
        await PutRequest(ADMIN_UPDATE_TESTIMONIALS(editingId), formData);
        alert("Testimonial updated successfully");
      } else {
        await PostRequest(ADMIN_POST_TESTIMONIALS, formData);
        alert("Testimonial created successfully");
      }

      fetchTestimonials();
      handleClose();
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     DELETE
  ========================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?"))
      return;

    try {
      await DeleteRequest(ADMIN_DELETE_TESTIMONIALS(id));
      fetchTestimonials();
      alert("Testimonial deleted successfully");
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Manage Testimonials</h1>
          <p className="text-slate-500">View and edit reviews from your clients and students.</p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-brand-200 active:scale-95"
        >
          <Plus size={20} />
          Add Testimonial
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-500" />
            <p className="font-medium">Loading testimonials...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Profile</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Testimonial</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testimonials.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      {item.image ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 group-hover:border-brand-200 transition-colors">
                          <img 
                            src={item.image}
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                          <User size={20} />
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.name}</div>
                      <div className="text-xs text-brand-600 font-medium">{item.role}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2 text-slate-500">
                        <Quote size={16} className="text-slate-300 shrink-0 mt-1" />
                        <p className="text-sm line-clamp-2 italic">{item.text}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {testimonials.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center text-slate-400">
                        <MessageSquare size={40} className="mb-4 opacity-20" />
                        <p className="font-medium text-slate-500">No testimonials found yet.</p>
                        <p className="text-sm">Click 'Add Testimonial' to get started!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================
          CREATE / EDIT MODAL
      ========================== */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? "Update Testimonial" : "Create New Testimonial"}
              </h3>
              <button 
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Client Name</label>
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Role / Position</label>
                  <input
                    required
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    placeholder="e.g. Senior Developer"
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 mb-6">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Testimonial Text</label>
                <textarea
                  required
                  name="text"
                  rows={4}
                  value={form.text}
                  onChange={handleChange}
                  placeholder="Paste the testimonial here..."
                  className="w-full rounded-xl border-slate-200 border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-8">
                <div className="shrink-0">
                  {form.imagePreview ? (
                    <div className="relative group">
                      <img src={form.imagePreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                      <button 
                         type="button"
                         onClick={() => setForm({...form, image: null, imagePreview: null})}
                         className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400">
                      <User size={30} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <p className="text-sm font-bold text-slate-700 mb-1">Upload Client Photo</p>
                  <p className="text-xs text-slate-500 mb-3">Square images work best. Max 2MB.</p>
                  
                  <input
                    type="file"
                    id="client-photo"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <label 
                    htmlFor="client-photo"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:text-brand-600 hover:border-brand-200 cursor-pointer transition-all shadow-sm"
                  >
                    <Upload size={14} />
                    Browse Files
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 px-6 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-lg shadow-brand-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingId ? "Save Changes" : "Publish Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

