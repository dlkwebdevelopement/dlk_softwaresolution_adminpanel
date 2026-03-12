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
  Loader2
} from "lucide-react";

import {
  GetRequest,
  PostRequest,
  DeleteRequest,
  PutRequest,
} from "../../apis/config";

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

  // 🔹 Form fields
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

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
    setEditingId(null);
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

    const payload = {
      courseId,
      title,
      startDate,
      durationDays: Number(durationDays),
      startTime,
      endTime,
    };

    try {
      setIsSubmitting(true);
      if (editingId) {
        await PutRequest(ADMIN_UPDATE_LIVE_CLASSES(editingId), payload);
        alert("Live class updated successfully");
      } else {
        await PostRequest(ADMIN_POST_LIVE_CLASSES, payload);
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

  const editLiveClass = (c) => {
    setEditingId(c.id);
    setCourseId(c.courseId);
    setTitle(c.title);
    setStartDate(toInputDate(c.startDate));
    setDurationDays(c.durationDays);
    setStartTime(c.startTime);
    setEndTime(c.endTime);

    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Live Classes</h1>
          <p className="text-slate-500">Manage schedules and topics for real-time educational sessions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 🔹 FORM SECTION */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 sticky top-24 overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${editingId ? 'bg-amber-100 text-amber-600' : 'bg-brand-100 text-brand-600'}`}>
                   {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
                </div>
                <h2 className="font-bold text-slate-800">{editingId ? "Update Session" : "Schedule New"}</h2>
              </div>
              {editingId && (
                <button onClick={resetForm} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            <form onSubmit={submitLiveClass} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Class Category</label>
                <select
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full rounded-xl border-slate-200 border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all appearance-none cursor-pointer bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Class Title</label>
                <input
                  required
                  placeholder="e.g. Advanced React Patterns"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border-slate-200 border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Start Date</label>
                  <input
                    required
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Duration</label>
                  <div className="relative">
                    <input
                      required
                      type="number"
                      placeholder="7"
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      className="w-full rounded-xl border-slate-200 border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">DAYS</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Start Time</label>
                  <input
                    required
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">End Time</label>
                  <input
                    required
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] mt-4 disabled:opacity-50
                  ${editingId 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200' 
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-200'}`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Video size={18} />
                    {editingId ? "Update session info" : "Schedule Live Class"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* 🔹 LIST SECTION */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Layers className="text-brand-500" size={20} />
              Scheduled Classes ({list.length})
            </h2>
          </div>

          {loading ? (
             <div className="bg-white rounded-[32px] p-20 flex flex-col items-center justify-center text-slate-400 border border-slate-100">
                <Loader2 className="w-12 h-12 animate-spin mb-4 text-brand-500" />
                <p className="font-medium italic">Refreshing class list...</p>
             </div>
          ) : list.length === 0 ? (
            <div className="bg-white rounded-[32px] p-20 flex flex-col items-center justify-center text-slate-400 border border-slate-100">
               <Video size={64} className="mb-4 opacity-10" />
               <p className="font-bold text-slate-500">No live classes scheduled</p>
               <p className="text-sm">Add your first session using the form on the left.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {list.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-6 rounded-[28px] border border-slate-200 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/5 transition-all group relative overflow-hidden"
                >
                  {/* Category Badge & Actions */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-200 transition-colors">
                      {c.category?.category || "Category"}
                    </span>
                    <div className="flex gap-2">
                       <button
                         onClick={() => editLiveClass(c)}
                         className="p-2 bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                       >
                         <Edit2 size={14} />
                       </button>
                       <button
                         onClick={() => removeLiveClass(c.id)}
                         className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                       >
                         <Trash2 size={14} />
                       </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 leading-tight mb-4 group-hover:text-brand-600 transition-colors">
                    {c.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                       <Calendar size={14} className="text-brand-500" />
                       <span className="text-xs font-bold text-slate-700">{formatDate(c.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                       <Clock size={14} className="text-brand-500" />
                       <span className="text-xs font-bold text-slate-700">{c.durationDays} Days</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-brand-50/50 p-3 rounded-2xl border border-brand-100/30">
                     <div className="flex items-center gap-2 text-xs font-black text-brand-700 uppercase tracking-tighter">
                        <Video size={14} />
                        Session Time:
                     </div>
                     <span className="text-xs font-bold text-slate-600">
                        {formatTime12(c.startTime)} – {formatTime12(c.endTime)}
                     </span>
                  </div>

                  {/* Visual Accent */}
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-slate-50 rounded-full group-hover:bg-brand-50 transition-colors pointer-events-none opacity-50"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

