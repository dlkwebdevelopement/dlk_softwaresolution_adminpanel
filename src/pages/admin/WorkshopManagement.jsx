import React, { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { 
  Edit2, 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Clock,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Upload,
  Layers,
  Search,
  Timer,
  User,
  ArrowLeft
} from "lucide-react";

import {
  ADMIN_GET_WORKSHOPS,
  ADMIN_POST_WORKSHOP,
  ADMIN_UPDATE_WORKSHOP,
  ADMIN_DELETE_WORKSHOP
} from "../../apis/endpoints";

import {
  GetRequest,
  PostRequest,
  PutRequest,
  DeleteRequest,
} from "../../apis/api";

export default function WorkshopManagement() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [expertName, setExpertName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cropper states
  const [cropImage, setCropImage] = useState(null);
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const res = await GetRequest(ADMIN_GET_WORKSHOPS);
      if (res.success) {
        setWorkshops(res.data || []);
      }
    } catch (err) {
      console.error("Fetch Workshops Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDuration("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setCategoryName("");
    setExpertName("");
    setImage(null);
    setImagePreview(null);
    setEditingId(null);
    setIsFormVisible(false);
  };

  const handleEdit = (w) => {
    setEditingId(w.id);
    setTitle(w.title);
    setDuration(w.duration);
    const d = new Date(w.date);
    setDate(d.toISOString().split('T')[0]);
    setStartTime(w.startTime);
    setEndTime(w.endTime);
    setCategoryName(w.categoryName);
    setExpertName(w.expertName);
    setImagePreview(w.image);
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          const file = new File([blob], "workshop_image.jpg", { type: "image/jpeg" });
          resolve(file);
        }, "image/jpeg");
      };
      image.onerror = (e) => reject(e);
      image.src = imageSrc;
    });
  };

  const handleApplyCrop = async () => {
    try {
      if (croppedAreaPixels) {
        const croppedFile = await getCroppedImg(cropImage, croppedAreaPixels);
        if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
        const previewUrl = URL.createObjectURL(croppedFile);
        setImage(croppedFile);
        setImagePreview(previewUrl);
        setCropModalVisible(false);
        setCropImage(null);
      }
    } catch (err) {
      console.error("Crop Error:", err);
      alert("Error cropping image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !duration || !date || !startTime || !endTime || !categoryName || !expertName) {
      return alert("Please fill all required fields");
    }
    if (!editingId && !image) {
      return alert("Image is required for new workshops");
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("duration", duration);
    formData.append("date", date);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);
    formData.append("categoryName", categoryName);
    formData.append("expertName", expertName);
    if (image) formData.append("image", image);

    try {
      if (editingId) {
        await PutRequest(ADMIN_UPDATE_WORKSHOP(editingId), formData);
        alert("Workshop updated successfully");
      } else {
        await PostRequest(ADMIN_POST_WORKSHOP, formData);
        alert("Workshop created successfully");
      }
      resetForm();
      fetchWorkshops();
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Failed to save workshop");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this workshop?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_WORKSHOP(id));
      alert("Workshop deleted successfully");
      fetchWorkshops();
    } catch (err) {
      alert("Failed to delete workshop");
    }
  };

  const filteredWorkshops = workshops.filter(w => 
    w.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.expertName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime12 = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 animate-fade-in text-slate-900">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Workshop Management</h1>
          <p className="text-slate-500 font-medium">Create and manage upcoming workshops and expert sessions.</p>
        </div>
        {!isFormVisible ? (
          <button 
            onClick={() => setIsFormVisible(true)}
            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-brand-100 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Workshop
          </button>
        ) : (
          <button 
            onClick={resetForm}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to List
          </button>
        )}
      </div>

      {isFormVisible ? (
        /* FORM VIEW */
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/50 p-8 border-b border-slate-100 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${editingId ? 'bg-amber-100 text-amber-600' : 'bg-brand-100 text-brand-600'}`}>
                {editingId ? <Edit2 size={24} /> : <Plus size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">
                  {editingId ? "Update Workshop Details" : "Create New Workshop"}
                </h2>
                <p className="text-slate-500 text-sm font-medium">Provide the expert info and schedule details below.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Upload */}
                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Featured Header Image <span className="text-brand-500">*</span></label>
                  <div className={`p-6 rounded-3xl border-2 border-dashed transition-all ${imagePreview ? 'border-brand-200 bg-brand-50/20' : 'border-slate-200 bg-slate-50 hover:border-brand-300'}`}>
                    <div className="flex flex-col sm:flex-row gap-8 items-center">
                      <div className="w-48 h-32 rounded-2xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-200" />
                        )}
                      </div>
                      <div className="flex-1 space-y-4">
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                          Recommended size <span className="font-bold text-brand-600">1280x720 (16:9)</span>. This image will represent the workshop in cards and banners.
                        </p>
                        <label className="inline-flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-50 hover:border-brand-500 hover:text-brand-600 transition-all shadow-sm">
                          <Upload size={18} />
                          Select & Crop Image
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => { setCropImage(reader.result); setCropModalVisible(true); };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Left Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Workshop Title <span className="text-brand-500">*</span></label>
                    <div className="relative">
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        required
                        placeholder="e.g. Full Stack Mastery"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-2xl border-slate-200 border pl-12 pr-4 py-4 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all placeholder:text-slate-300 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category Name <span className="text-brand-500">*</span></label>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        required
                        placeholder="e.g. Web Development"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="w-full rounded-2xl border-slate-200 border pl-12 pr-4 py-4 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all placeholder:text-slate-300 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Expert/Speaker Name <span className="text-brand-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        required
                        placeholder="e.g. John Doe, Senior Architect"
                        value={expertName}
                        onChange={(e) => setExpertName(e.target.value)}
                        className="w-full rounded-2xl border-slate-200 border pl-12 pr-4 py-4 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all placeholder:text-slate-300 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Schedule Date <span className="text-brand-500">*</span></label>
                      <input
                        required
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-2xl border-slate-200 border px-4 py-4 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Total Duration <span className="text-brand-500">*</span></label>
                      <div className="relative">
                        <input
                          required
                          placeholder="e.g. 2 Hours"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="w-full rounded-2xl border-slate-200 border px-4 py-4 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Start Time <span className="text-brand-500">*</span></label>
                      <input
                        required
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full rounded-2xl border-slate-200 border px-4 py-4 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">End Time <span className="text-brand-500">*</span></label>
                      <input
                        required
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full rounded-2xl border-slate-200 border px-4 py-4 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-[2] py-4 px-8 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-50
                    ${editingId 
                      ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 shadow-lg' 
                      : 'bg-brand-600 hover:bg-brand-700 shadow-brand-200 shadow-lg'}`}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {editingId ? <CheckCircle2 size={22} /> : <Calendar size={22} />}
                      <span>{editingId ? "Update Workshop" : "Publish Workshop"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Search by title, expert, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-slate-200 border focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
               <Layers className="text-slate-400 w-4 h-4" />
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Saved: {filteredWorkshops.length}</span>
            </div>
          </div>

          <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Workshop</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Category & Expert</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Schedule</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-500 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">Loading workshops...</p>
                      </td>
                    </tr>
                  ) : filteredWorkshops.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ImageIcon className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-500 font-bold text-lg">No workshops found</p>
                        <p className="text-slate-400 text-sm mt-1">Add your first workshop to get started.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredWorkshops.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              <img src={item.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors uppercase tracking-tight text-sm">{item.title}</p>
                              <div className="flex gap-2 mt-1">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter bg-slate-100 px-1.5 py-0.5 rounded">Duration: {item.duration}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                             <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest border border-brand-100">
                                <Layers size={10} /> {item.categoryName}
                             </div>
                             <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5 ml-0.5">
                                <User size={12} className="text-slate-400" /> {item.expertName}
                             </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="w-3.5 h-3.5 text-brand-500" />
                              <span className="text-xs font-bold">{new Date(item.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <Timer className="w-3.5 h-3.5 text-slate-300" />
                              <span className="text-[11px] font-medium">{formatTime12(item.startTime)} – {formatTime12(item.endTime)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                            <button 
                              onClick={() => handleEdit(item)}
                              className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 rounded-xl transition-all shadow-sm"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                            >
                              <Trash2 size={16} />
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
      )}

      {/* CROP MODAL */}
      {cropModalVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">Crop Workshop Header</h3>
              <button onClick={() => setCropModalVisible(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="relative h-[400px] bg-slate-50">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Adjust Zoom</span>
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg">{Math.round(zoom * 100)}%</span>
                 </div>
                 <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setCropModalVisible(false)} className="flex-1 py-4 px-6 rounded-2xl font-bold bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
                <button onClick={handleApplyCrop} className="flex-[2] py-4 px-6 rounded-2xl font-black bg-brand-600 text-white shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all active:scale-95">Apply Crop</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
