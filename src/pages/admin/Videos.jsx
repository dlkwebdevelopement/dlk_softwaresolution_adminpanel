import { useEffect, useState } from "react";
import { 
  Video as VideoIcon, 
  Trash2, 
  CheckCircle2, 
  X,
  Edit,
  Plus,
  ArrowLeft,
  Link as LinkIcon
} from "lucide-react";
import axios from "axios";
import { GetRequest, PostRequest, DeleteRequest, PutRequest } from "../../apis/api";
import { 
  ADMIN_GET_VIDEOS, 
  ADMIN_POST_VIDEOS, 
  ADMIN_UPDATE_VIDEOS, 
  ADMIN_DELETE_VIDEOS 
} from "../../apis/endpoints";

const categories = ['Tutorials', 'Roadmaps', 'Workshops', 'Placements', 'Design'];

export default function Videos() {
  const [list, setList] = useState([]);
  const [view, setView] = useState("list"); // "list" or "form"
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [preview, setPreview] = useState("");

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await GetRequest(ADMIN_GET_VIDEOS);
      if (res && res.success) {
         // Unwrap paginated response: { data: { data: [...] } }
         const videoArray = res.data?.data || res.data || [];
         setList(Array.isArray(videoArray) ? videoArray : []);
      }
    } catch (err) {
      console.error("Failed to fetch videos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleUrlChange = async (e) => {
    const url = e.target.value;
    setLink(url);
    
    // Auto-fetch Title configuration if YouTube URL
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      try {
        const response = await axios.get(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
        if (response.data && response.data.title) {
          setTitle((prev) => prev || response.data.title); // Set only if empty or override
          if (response.data.thumbnail_url) {
             setPreview(response.data.thumbnail_url);
          }
        }
      } catch (err) {
        console.error("Auto-fetch metadata failed:", err);
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setLink("");
    setCategory("");
    setDuration("");
    setPreview("");
    setEditingId(null);
    setView("list");
  };

  const handleEdit = (video) => {
    setTitle(video.title || "");
    setLink(video.link || "");
    setCategory(video.category || "");
    setDuration(video.duration || "");
    setPreview(video.thumbnail || "");
    setEditingId(video.id || video._id);
    setView("form");
  };

  const handleSubmit = async () => {
    if (!title || !link || !category) return alert("Fill in absolute required fields (Title, Link, Category)!");

    const payload = {
      title,
      link,
      category,
      duration,
      thumbnail: preview
    };

    try {
      if (editingId) {
        await PutRequest(ADMIN_UPDATE_VIDEOS(editingId), payload);
        alert("Video updated successfully!");
      } else {
        await PostRequest(ADMIN_POST_VIDEOS, payload);
        alert("Video created successfully!");
      }
      resetForm();
      fetchVideos();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save video.");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this video?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_VIDEOS(id));
      fetchVideos();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete video.");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in py-6 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Videos Management</h1>
          <p className="text-slate-500 mt-1">Manage YouTube tutorials, workshops, and roadmaps.</p>
        </div>
        {view === "list" ? (
          <button 
            onClick={() => setView("form")}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Video
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
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Preview</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">Loading videos...</td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <VideoIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No videos found</p>
                      <button onClick={() => setView("form")} className="text-emerald-600 hover:underline text-sm mt-2 font-semibold">Upload your first one</button>
                    </td>
                  </tr>
                ) : (
                  list.map((video) => (
                    <tr key={video._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative">
                          <img 
                            src={video.thumbnail || "https://images.unsplash.com/photo-1611162607248-cb5f87b32216?auto=format&fit=crop&w=150&q=80"} 
                            alt={video.title} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 max-w-sm">
                          <span className="text-sm font-bold text-slate-900 line-clamp-2">{video.title}</span>
                          <span className="text-xs text-slate-400 truncate flex items-center gap-1">
                             <LinkIcon className="w-3" />
                             {video.link}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
                          {video.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(video)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => remove(video._id)}
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
                {editingId ? "Edit Video Details" : "New Video"}
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">YouTube Video Link <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={link} 
                    onChange={handleUrlChange}
                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                  />
                  <p className="text-[11px] text-slate-400">Pasting a valid link automatically fetches the video Title & Thumbnail!</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Main Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Auto-fetched or Type here"
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Category <span className="text-red-500">*</span></label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Duration (optional)</label>
                    <input 
                      type="text" 
                      value={duration} 
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 12:45"
                      className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                Preview Thumbnail
              </h2>
              
              <div className="space-y-4">
                <div className="relative aspect-video rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                   {preview ? (
                     <img src={preview} alt="Video Preview" className="w-full h-full object-cover" />
                   ) : (
                     <VideoIcon className="w-12 h-12 text-slate-300" />
                   )}
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {editingId ? "Update Video" : "Save Video"}
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
