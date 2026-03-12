import { useEffect, useState, useRef } from "react";
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2, 
  X
} from "lucide-react";
import { GetRequest, PostRequest, DeleteRequest } from "../../apis/config";
import { ADMIN_UPLOAD_BANNER, ADMIN_DELETE_BANNER, ADMIN_GET_BANNERS } from "../../apis/endpoints";
import { BASE_URL } from "../../apis/api";

export default function Banners() {
  const [list, setList] = useState([]);
  const [file, setFile] = useState(null);

  // 🔹 Banner fields (matching backend columns)
  const [title, setTitle] = useState("");
  const [highlight, setHighlight] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");

  const fileInputRef = useRef(null);

  const fetch = async () => {
    try {
      const data = await GetRequest(ADMIN_GET_BANNERS);
      setList(data);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const upload = async () => {
    if (!file) return alert("Select a file first!");

    const fd = new FormData();
    fd.append("photo", file);
    fd.append("title", title);
    fd.append("highlight", highlight);
    fd.append("subtitle", subtitle);
    fd.append("tagline", tagline);
    fd.append("description", description);
    fd.append("button", buttonText);

    try {
      await PostRequest(ADMIN_UPLOAD_BANNER, fd);

      // reset
      setFile(null);
      setTitle("");
      setHighlight("");
      setSubtitle("");
      setTagline("");
      setDescription("");
      setButtonText("");

      if (fileInputRef.current) fileInputRef.current.value = "";
      fetch();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload banner.");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_BANNER(id));
      fetch();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete banner.");
    }
  };

  const clearFile = (e) => {
    e.preventDefault();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in py-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Banner Management</h1>
        <p className="text-slate-500">Manage your website banners and promotional hero sections</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-brand-600" />
            Upload New Banner
          </h2>

          {/* Banner Text Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Advanced Skills"
                className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Highlight Text (Colored)</label>
              <input 
                type="text" 
                value={highlight} 
                onChange={(e) => setHighlight(e.target.value)}
                placeholder="e.g. 10x Faster"
                className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Subtitle</label>
              <input 
                type="text" 
                value={subtitle} 
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. with Industry Experts"
                className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Tagline (Top small text)</label>
              <input 
                type="text" 
                value={tagline} 
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. ★ 4.9/5 Rating"
                className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Button Text</label>
              <input 
                type="text" 
                value={buttonText} 
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g. Start Learning Now"
                className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
              />
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a brief description to appear below the main heading..."
                rows={3}
                className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white resize-y"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-slate-700 block mb-1.5">Banner Image</label>
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${file ? 'border-brand-300 bg-brand-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/50'}`}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="banner-upload"
              />
              
              {!file ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 border border-slate-100">
                    <ImageIcon className="w-8 h-8 text-brand-500" />
                  </div>
                  <label htmlFor="banner-upload" className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 transition-all shadow-sm">
                      <UploadCloud className="w-4 h-4" />
                      Browse Files
                    </span>
                  </label>
                  <p className="text-xs text-slate-500 mt-4">
                    Recommended size: 1920x1080px (PNG, JPG, WEBP up to 10MB)
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-emerald-200 shadow-sm mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                      <p className="text-xs text-emerald-600 font-medium">Ready to upload</p>
                    </div>
                    <button 
                      onClick={clearFile}
                      className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <label htmlFor="banner-upload" className="cursor-pointer">
                    <span className="text-sm text-brand-600 font-medium hover:underline">Choose a different image</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={upload}
            disabled={!file}
            className="w-full sm:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <UploadCloud className="w-5 h-5" />
            Upload Banner
          </button>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-brand-600" />
            Banner Gallery 
            <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-sm font-medium ml-1">
              {list.length}
            </span>
          </h2>

          {list.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <ImageIcon className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-slate-700 font-medium text-lg mb-1">No banners uploaded yet</h3>
              <p className="text-slate-500 text-sm">Upload your first banner using the form above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {list.map((b) => (
                <div
                  key={b.id}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video flex items-center justify-center hover:shadow-md transition-all duration-300"
                >
                  <img
                    src={`${BASE_URL}/${b.photoUrl}`}
                    alt={b.title || "Banner"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                    {b.title && (
                      <p className="text-white font-medium text-center text-sm mb-3 line-clamp-2">
                        {b.title}
                      </p>
                    )}
                    <button
                      onClick={() => remove(b.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                  
                  {/* Always visible delete button on top right for mobile/quick access */}
                  <button
                    onClick={() => remove(b.id)}
                    className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-red-50 text-slate-600 hover:text-red-500 rounded-lg shadow-sm backdrop-blur-sm transition-colors md:opacity-0 group-hover:opacity-100"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
