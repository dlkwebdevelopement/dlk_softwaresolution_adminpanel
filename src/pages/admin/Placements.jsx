import { useEffect, useState, useRef, useCallback } from "react";
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2, 
  X,
  Plus,
  ArrowLeft,
  Scissors,
  ArrowUp,
  ArrowDown,
  Save,
  Loader2,
  Power,
  GripVertical
} from "lucide-react";
import Cropper from 'react-easy-crop';
import { GetRequest, PostRequest, DeleteRequest, PutRequest, PatchRequest } from "../../apis/config";
import { 
  ADMIN_GET_PLACEMENTS,
  ADMIN_POST_PLACEMENTS,
  ADMIN_UPDATE_PLACEMENT,
  ADMIN_DELETE_PLACEMENT,
  ADMIN_TOGGLE_PLACEMENT,
  ADMIN_REORDER_PLACEMENTS
} from "../../apis/endpoints";

export default function Placements() {
  const [list, setList] = useState([]);
  const [view, setView] = useState("list"); // "list" or "form"
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Form states
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isActive, setIsActive] = useState(true);

  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  const fileInputRef = useRef(null);

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const data = await GetRequest(ADMIN_GET_PLACEMENTS);
      setList(data);
    } catch (err) {
      console.error("Failed to fetch placements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
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
    setFile(null);
    if (preview && !preview.startsWith('http')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setEditingId(null);
    setIsActive(true);
    setView("list");
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setPreview(item.photoUrl);
    setIsActive(item.isActive);
    setView("form");
  };

  const handleSubmit = async () => {
    if (!editingId && !file) return alert("Select and crop a placement image!");

    const fd = new FormData();
    if (file) fd.append("image", file);
    fd.append("isActive", isActive);

    try {
      if (editingId) {
        await PutRequest(ADMIN_UPDATE_PLACEMENT(editingId), fd);
        alert("Placement updated successfully!");
      } else {
        await PostRequest(ADMIN_POST_PLACEMENTS, fd);
        alert("Placement added successfully!");
      }
      resetForm();
      fetchPlacements();
    } catch (err) {
      console.error("Save failed:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to save placement.";
      alert(msg);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this placement image?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_PLACEMENT(id));
      fetchPlacements();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete placement.");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await PatchRequest(ADMIN_TOGGLE_PLACEMENT(id));
      setList(prev => prev.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item));
    } catch (err) {
      console.error("Toggle failed:", err);
      alert("Failed to toggle status.");
    }
  };

  const saveOrder = async () => {
    try {
      setSavingOrder(true);
      const orders = list.map((item, index) => ({ id: item.id, displayOrder: index }));
      await PutRequest(ADMIN_REORDER_PLACEMENTS, { orders });
      alert("Order saved successfully!");
    } catch (err) {
      console.error("Order save failed:", err);
      alert("Failed to save order.");
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in py-6 px-4 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Placement Management</h1>
          <p className="text-slate-500 mt-1">Manage placement records, reorder them, and toggle visibility.</p>
        </div>
        <div className="flex items-center gap-3">
          {view === "list" && list.length > 1 && (
            <button 
              onClick={saveOrder}
              disabled={savingOrder}
              className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {savingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Order
            </button>
          )}
          {view === "list" ? (
            <button 
              onClick={() => setView("form")}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add Placement
            </button>
          ) : (
            <button 
              onClick={resetForm}
              className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to List
            </button>
          )}
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-emerald-500" />
              <p className="text-slate-500 font-medium tracking-wide">Loading placements...</p>
            </div>
          ) : list.length === 0 ? (
            <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
              <ImageIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-xl font-bold text-slate-400">No placements uploaded yet</p>
              <button onClick={() => setView("form")} className="mt-4 text-emerald-600 font-bold hover:underline">Upload your first one</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {list.map((item, index) => (
                <div 
                  key={item.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedIndex(index);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedIndex === null || draggedIndex === index) return;
                    const newList = [...list];
                    const itemToMove = newList[draggedIndex];
                    newList.splice(draggedIndex, 1);
                    newList.splice(index, 0, itemToMove);
                    setList(newList);
                    setDraggedIndex(null);
                  }}
                  onDragEnd={() => setDraggedIndex(null)}
                  className={`group relative bg-white rounded-[2rem] border-2 transition-all duration-300 overflow-hidden cursor-move hover:shadow-2xl hover:shadow-emerald-100/50 ${
                    draggedIndex === index 
                      ? "opacity-40 scale-95 border-emerald-500 border-dashed bg-emerald-50" 
                      : "border-slate-100 active:scale-95 active:rotate-1"
                  }`}
                >
                  {/* Image Container */}
                  <div className="aspect-[4/3] w-full p-4 flex items-center justify-center bg-slate-50 group-hover:bg-white transition-colors duration-500">
                    <img 
                      src={item.photoUrl} 
                      alt="Placement" 
                      className="w-full h-full object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all"
                    />
                  </div>

                  {/* Overlay Controls */}
                  <div className="p-4 flex items-center justify-between border-t border-slate-50 bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                        {index + 1}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(item.id);
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest transition-all ${
                          item.isActive 
                            ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" 
                            : "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
                        }`}
                      >
                        {item.isActive ? "ACTIVE" : "HIDDEN"}
                      </button>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(item.id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Placement"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Drag Handle Indicator (Mobile Friendly) */}
                  <div className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical size={16} className="text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-emerald-600 p-8 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Plus className="w-7 h-7" />
                {editingId ? "Update Placement Image" : "Upload New Placement"}
              </h2>
              <p className="text-emerald-100 mt-2">Select a high-quality image of the placement achievement.</p>
            </div>
            
            <div className="p-8 space-y-8">
              <div>
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 block">Visual Media</label>
                <div 
                  className={`relative aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${
                    preview ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                        <label htmlFor="p-upload" className="cursor-pointer bg-white text-emerald-600 px-6 py-2.5 rounded-xl font-bold shadow-2xl flex items-center gap-2 transform translate-y-4 hover:translate-y-0 transition-transform">
                          <Scissors className="w-5 h-5" />
                          Change & Recrop
                        </label>
                        <button onClick={() => { setPreview(null); setFile(null); }} className="text-white/70 hover:text-white text-sm font-bold">Remove</button>
                      </div>
                    </>
                  ) : (
                    <label htmlFor="p-upload" className="cursor-pointer flex flex-col items-center text-center p-12 group">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-8 h-8 text-emerald-600" />
                      </div>
                      <span className="text-lg font-bold text-slate-900">Choose Image</span>
                      <span className="text-sm text-slate-400 mt-1">Square image recommended (370×370px), JPG or PNG, max 10MB</span>
                    </label>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" id="p-upload" />
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                    <Power className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Placement Status</span>
                    <span className="text-sm text-slate-500">Enable or disable this placement image</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsActive(!isActive)}
                  className={`w-14 h-8 rounded-full relative transition-colors duration-200 ease-in-out ${isActive ? 'bg-emerald-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform duration-200 ease-in-out ${isActive ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={handleSubmit}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  {editingId ? "Update Placement" : "Save Placement"}
                </button>
                <button onClick={resetForm} className="sm:w-1/3 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-2xl transition-all">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCropper && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col animate-zoom-in">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Image Cropper</h3>
                <p className="text-sm text-slate-400 font-medium">Perfect the visual presentation</p>
              </div>
              <button onClick={() => setShowCropper(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-7 h-7 text-slate-300" /></button>
            </div>
            <div className="relative h-[480px] bg-slate-950">
              <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            </div>
            <div className="p-8 bg-white space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-slate-400 uppercase">Zoom</span>
                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="flex-1 accent-emerald-600" />
                <span className="text-xs font-black text-emerald-600">{(Number(zoom)).toFixed(1)}x</span>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowCropper(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors">Discard</button>
                <button onClick={createCroppedImage} className="flex-2 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 uppercase tracking-widest px-12 transition-all active:scale-95"><Scissors className="w-5 h-5" />Apply & Use</button>
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
    canvas.toBlob((blob) => resolve(new File([blob], "placement.jpg", { type: 'image/jpeg' })), 'image/jpeg', 0.95);
  });
}
