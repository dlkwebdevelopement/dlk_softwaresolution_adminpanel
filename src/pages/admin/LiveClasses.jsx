import { useEffect, useState } from "react";
import { 
  Video, 
  Calendar, 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  BookOpen, 
  X, 
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CalendarDays,
  Timer
} from "lucide-react";

import {
  GetRequest,
  PostRequest,
  DeleteRequest,
  PutRequest,
} from "../../apis/config";
import { BASE_URL } from "../../apis/api";

import {
  ADMIN_GET_LIVE_CLASSES,
  ADMIN_POST_LIVE_CLASSES,
  ADMIN_DELETE_LIVE_CLASSES,
  ADMIN_GET_CATEGORIES,
  ADMIN_UPDATE_LIVE_CLASSES,
} from "../../apis/endpoints";

export default function LiveClasses() {
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState("list"); // "list" or "form"
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Form fields
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [image, setImage] = useState(null);

  // 🔹 Edit state
  const [editingId, setEditingId] = useState(null);

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      const data = await GetRequest(ADMIN_GET_LIVE_CLASSES);
      setList(data || []);
    } catch (error) {
       console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const data = await GetRequest(ADMIN_GET_CATEGORIES);
    setCategories(data || []);
  };

  useEffect(() => {
    fetchLiveClasses();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setCourseId("");
    setTitle("");
    setStartDate("");
    setDurationDays("");
    setStartTime("");
    setEndTime("");
    setImage(null);
    setEditingId(null);
    setView("list");
  };

  const submitLiveClass = async (e) => {
    e.preventDefault();
    if (
      !courseId ||
      !title ||
      !startDate ||
      !durationDays ||
      !startTime ||
      !endTime
    ) {
      return alert("Please fill all required fields");
    }

    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("title", title);
    formData.append("startDate", startDate);
    formData.append("durationDays", Number(durationDays));
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);
    if (image instanceof File) {
      formData.append("image", image);
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        await PutRequest(ADMIN_UPDATE_LIVE_CLASSES(editingId), formData);
        alert("Live class updated successfully");
      } else {
        await PostRequest(ADMIN_POST_LIVE_CLASSES, formData);
        alert("Live class created successfully");
      }

      resetForm();
      fetchLiveClasses();
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Operation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toInputDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setCourseId(typeof c.courseId === 'object' ? (c.courseId?.id || c.courseId?._id) : c.courseId);
    setTitle(c.title);
    setStartDate(toInputDate(c.startDate));
    setDurationDays(c.durationDays);
    setStartTime(c.startTime);
    setEndTime(c.endTime);
    setImage(c.image || null);
    setView("form");
  };

  const removeLiveClass = async (id) => {
    if (!confirm("Are you sure you want to delete this live class?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_LIVE_CLASSES(id));
      alert("Live class deleted successfully");
      fetchLiveClasses();
    } catch (error) {
      alert("Failed to delete live class");
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime12 = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredList = list.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.courseId?.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Live Classes</h1>
          <p className="text-slate-500 font-medium">Manage schedules and topics for real-time educational sessions.</p>
        </div>
        {view === "list" ? (
          <button 
            onClick={() => setView("form")}
            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-brand-100 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Schedule New Session
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

      {view === "list" ? (
        /* LIST VIEW (Table) */
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Search by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-slate-200 border focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
               <Layers className="text-slate-400 w-4 h-4" />
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total: {filteredList.length}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Session Details</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Schedule</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-500 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium italic">Synchronizing classes...</p>
                      </td>
                    </tr>
                  ) : filteredList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Video className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-500 font-bold text-lg">No classes found</p>
                        <p className="text-slate-400 text-sm mt-1">Try adjusting your search or add a new session.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {item.image ? (
                              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                                <img src={`${BASE_URL}/${item.image}`} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
                                <Video className="w-6 h-6" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{item.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter bg-slate-100 px-1.5 py-0.5 rounded">Duration: {item.durationDays} Days</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-200 transition-colors">
                            {item.courseId?.categoryName || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-600">
                              <CalendarDays className="w-3.5 h-3.5 text-brand-500" />
                              <span className="text-xs font-bold">{formatDate(item.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                              <Timer className="w-3.5 h-3.5 text-brand-400" />
                              <span className="text-[11px] font-medium">{formatTime12(item.startTime)} – {formatTime12(item.endTime)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                            <button 
                              onClick={() => handleEdit(item)}
                              className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 rounded-xl transition-all shadow-sm"
                              title="Edit Session"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => removeLiveClass(item.id)}
                              className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                              title="Delete Session"
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
        </div>
      ) : (
        /* FORM VIEW */
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/50 p-8 border-b border-slate-100 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${editingId ? 'bg-amber-100 text-amber-600' : 'bg-brand-100 text-brand-600'}`}>
                {editingId ? <Edit2 size={24} /> : <Plus size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">
                  {editingId ? "Update Live Session" : "Schedule New Live Class"}
                </h2>
                <p className="text-slate-500 text-sm font-medium">Please provide accurate scheduling information for the students.</p>
              </div>
            </div>

            <form onSubmit={submitLiveClass} className="p-8 md:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Topic & Category */}
                <div className="space-y-6">
                   <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Session Title <span className="text-brand-500">*</span></label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-brand-500" />
                      <input
                        required
                        placeholder="e.g. Master React Hooks"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-2xl border-slate-200 border pl-12 pr-4 py-4 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all placeholder:text-slate-300 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Class Category <span className="text-brand-500">*</span></label>
                    <div className="relative">
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                      <select
                        required
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="w-full rounded-2xl border-slate-200 border pl-12 pr-4 py-4 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all appearance-none cursor-pointer bg-white font-medium"
                      >
                        <option value="">Select a Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.categoryName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Live Class Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files[0])}
                      className="w-full rounded-2xl border-slate-200 border px-4 py-3 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    />
                    {image && typeof image === "string" && (
                      <div className="mt-2 text-xs text-brand-600 font-medium">
                        Current image: {image.split('/').pop()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule & Duration */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Start Date <span className="text-brand-500">*</span></label>
                      <input
                        required
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-2xl border-slate-200 border px-4 py-4 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Duration <span className="text-brand-500">*</span></label>
                      <div className="relative">
                        <input
                          required
                          type="number"
                          placeholder="e.g. 7"
                          value={durationDays}
                          onChange={(e) => setDurationDays(e.target.value)}
                          className="w-full rounded-2xl border-slate-200 border px-4 py-4 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all pr-14 font-medium"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 tracking-wider">DAYS</span>
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
                      <span>{editingId ? "Update Live Session" : "Confirm Schedule"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
