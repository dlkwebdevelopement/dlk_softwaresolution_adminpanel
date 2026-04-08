import { useEffect, useState, useRef, useCallback } from "react";
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2, 
  X,
  Edit,
  Plus,
  ArrowLeft,
  Scissors
} from "lucide-react";
import Cropper from 'react-easy-crop';
import { GetRequest, PostRequest, DeleteRequest, PutRequest } from "../../apis/api";
import { 
  ADMIN_UPLOAD_OFFER, 
  ADMIN_DELETE_OFFER, 
  ADMIN_GET_OFFERS, 
  ADMIN_UPDATE_OFFER 
} from "../../apis/endpoints";

export default function Offers() {
  const [list, setList] = useState([]);
  const [view, setView] = useState("list"); // "list" or "form"
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  const fileInputRef = useRef(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await GetRequest(ADMIN_GET_OFFERS);
      setList(data);
    } catch (err) {
      console.error("Failed to fetch offers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('Image size should be less than 10MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageToCrop(event.target.result);
      setShowCropper(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const createCroppedImage = async () => {
    try {
      if (!imageToCrop || !croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (preview && !preview.startsWith('http')) {
        URL.revokeObjectURL(preview);
      }
      setFile(croppedImage);
      setPreview(URL.createObjectURL(croppedImage));
      setShowCropper(false);
      setImageToCrop(null);
    } catch (e) {
      console.error('Cropping error:', e);
      alert(`Failed to crop image`);
    }
  };

  const resetForm = () => {
    setTitle("");
    setFile(null);
    if (preview && !preview.startsWith('http')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setEditingId(null);
    setView("list");
  };

  const handleEdit = (offer) => {
    setTitle(offer.title || "");
    setEditingId(offer.id);
    setPreview(offer.photoUrl);
    setView("form");
  };

  const handleSubmit = async () => {
    if (!editingId && !file) return alert("Select and crop an offer image!");
    if (!title) return alert("Title is required!");

    const fd = new FormData();
    if (file) fd.append("photo", file);
    fd.append("title", title);

    try {
      if (editingId) {
        await PutRequest(ADMIN_UPDATE_OFFER(editingId), fd);
        alert("Offer updated successfully!");
      } else {
        await PostRequest(ADMIN_UPLOAD_OFFER, fd);
        alert("Offer created successfully!");
      }
      resetForm();
      fetchOffers();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save offer.");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this offer?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_OFFER(id));
      fetchOffers();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete offer.");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in py-6 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Offer Management</h1>
          <p className="text-slate-500 mt-1">Manage promotional offers and seasonal deals.</p>
        </div>
        {view === "list" ? (
          <button 
            onClick={() => setView("form")}
            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Offer
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Preview</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Created</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">Loading offers...</td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No offers found</p>
                    </td>
                  </tr>
                ) : (
                  list.map((offer) => (
                    <tr key={offer.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                          <img src={offer.photoUrl} alt={offer.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{offer.title}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(offer.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(offer)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => remove(offer.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Edit className="w-5 h-5 text-brand-600" />
                {editingId ? "Edit Offer Details" : "New Offer Details"}
              </h2>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Offer Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Sale 20% Off"
                  className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-brand-600" />
              Offer Media
            </h2>
            <div 
              className={`relative aspect-[9/16] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${
                preview ? 'border-brand-200 bg-brand-50/10' : 'border-slate-300 bg-slate-50'
              }`}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label htmlFor="offer-upload" className="cursor-pointer bg-white text-slate-700 px-4 py-2 rounded-lg font-bold text-sm shadow-xl flex items-center gap-2">
                      <Scissors className="w-4 h-4" />
                      Change & Crop
                    </label>
                  </div>
                </>
              ) : (
                <label htmlFor="offer-upload" className="cursor-pointer flex flex-col items-center text-center p-4">
                  <UploadCloud className="w-8 h-8 text-brand-600 mb-2" />
                  <span className="text-sm font-bold text-slate-700">Select & Crop Image</span>
                </label>
              )}
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" id="offer-upload" />
            </div>
            <div className="flex flex-col gap-3 pt-6">
              <button 
                onClick={handleSubmit}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                {editingId ? "Update Offer" : "Create Offer"}
              </button>
              <button onClick={resetForm} className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCropper && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col animate-zoom-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Crop Offer Image</h3>
                <p className="text-sm text-slate-500">Adjust selection (9:16)</p>
              </div>
              <button onClick={() => setShowCropper(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="relative h-[450px] bg-slate-950">
              <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={9 / 16} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            </div>
            <div className="p-6 space-y-4">
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="w-full accent-brand-600" />
              <div className="flex gap-4">
                <button onClick={() => setShowCropper(false)} className="flex-1 py-3 text-slate-600 font-bold">Cancel</button>
                <button onClick={createCroppedImage} className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"><Scissors className="w-5 h-5" />Apply Crop</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(new File([blob], "offer.jpg", { type: 'image/jpeg' })), 'image/jpeg', 0.95);
  });
}
