import { useEffect, useState, useRef } from "react";
import { 
  Building2, 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2, 
  X
} from "lucide-react";
import { GetRequest, PostRequest, DeleteRequest } from "../../apis/config";
import { ADMIN_UPLOAD_COMPANY, ADMIN_DELETE_COMPANY, ADMIN_GET_COMPANIES } from "../../apis/endpoints";
import { BASE_URL } from "../../apis/api";

export default function Company() {
  const [list, setList] = useState([]);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetch = async () => {
    try {
      const data = await GetRequest(ADMIN_GET_COMPANIES);
      setList(data);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const upload = async () => {
    if (!file) return alert("Select a file first!");
    const fd = new FormData();
    fd.append("photo", file);

    try {
      await PostRequest(ADMIN_UPLOAD_COMPANY, fd);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetch();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload company photo.");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this company photo?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_COMPANY(id));
      fetch();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete company photo.");
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Company Photos</h1>
        <p className="text-slate-500">Manage your company gallery and partner logos</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-brand-600" />
            Upload New Photo
          </h2>

          <div className="mb-6">
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${file ? 'border-brand-300 bg-brand-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/50'}`}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="company-upload"
              />
              
              {!file ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 border border-slate-100">
                    <Building2 className="w-8 h-8 text-brand-500" />
                  </div>
                  <label htmlFor="company-upload" className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 transition-all shadow-sm">
                      <UploadCloud className="w-4 h-4" />
                      Browse Files
                    </span>
                  </label>
                  <p className="text-xs text-slate-500 mt-4">
                    PNG, JPG, WEBP up to 10MB
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
                  <label htmlFor="company-upload" className="cursor-pointer">
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
            Upload Photo
          </button>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-brand-600" />
            Company Gallery 
            <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-sm font-medium ml-1">
              {list.length}
            </span>
          </h2>

          {list.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <Building2 className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-slate-700 font-medium text-lg mb-1">No company images uploaded yet</h3>
              <p className="text-slate-500 text-sm">Upload your first company photo using the form above</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {list.map((c) => (
                <div
                  key={c.id}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square flex items-center justify-center hover:shadow-md transition-all duration-300"
                >
                  <img
                    src={c.photoUrl}
                    alt="company logo"
                    className="w-[80%] h-[80%] object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-sm"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                    <button
                      onClick={() => remove(c.id)}
                      className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-lg hover:scale-110 active:scale-95"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Always visible delete button on top right for mobile/quick access */}
                  <button
                    onClick={() => remove(c.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg shadow-sm backdrop-blur-sm transition-colors md:opacity-0 group-hover:opacity-100"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
