import { useEffect, useState, useRef, useCallback } from "react";
import {
  Trash2,
  Edit2,
  Eye,
  Plus,
  X,
  Check,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Cropper from 'react-easy-crop';
import {
  GetRequest,
  PostRequest,
  PutRequest,
  DeleteRequest,
  PatchRequest,
} from "../../apis/config";
import {
  ADMIN_GET_GALLERY,
  ADMIN_CREATE_GALLERY,
  ADMIN_UPDATE_GALLERY,
  ADMIN_DELETE_GALLERY,
  ADMIN_ADD_GALLERY_IMAGES,
  ADMIN_DELETE_GALLERY_IMAGE,
} from "../../apis/endpoints";
import { BASE_URL } from "../../apis/api";

// --- Helper for Image Cropping ---
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImgBlob(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

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

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.9);
  });
}

export default function GalleryManagement() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // --- Refactored Multi-Upload State ---
  const [selectionItems, setSelectionItems] = useState([]); // Array of { file, url, crop, zoom, aspect, pixels, previewUrl }
  const [currentCropIndex, setCurrentCropIndex] = useState(-1);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Temporary cropper state
  const [tempCrop, setTempCrop] = useState({ x: 0, y: 0 });
  const [tempZoom, setTempZoom] = useState(1);
  const [tempAspect, setTempAspect] = useState(4 / 3);
  const [tempPixels, setTempPixels] = useState(null);
  const [isAddAlbumModalOpen, setIsAddAlbumModalOpen] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumFile, setNewAlbumFile] = useState(null);
  const [newAlbumUrl, setNewAlbumUrl] = useState(null);
  const [isAddAlbumCropping, setIsAddAlbumCropping] = useState(false);

  const aspectRatios = [
    { label: '4:3', value: 4 / 3 },
    { label: '1:1', value: 1 / 1 },
    { label: '16:9', value: 16 / 9 },
    { label: '3:2', value: 3 / 2 },
  ];

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const data = await GetRequest(ADMIN_GET_GALLERY);
      setAlbums(data);
      if (selectedAlbum) {
        const updated = data.find(a => a.id === selectedAlbum.id);
        if (updated) setSelectedAlbum(updated);
      }
    } catch (err) {
      console.error("Failed to fetch gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleEditAlbumInit = (album) => {
    setEditingAlbumId(album.id);
    setNewAlbumName(album.albumName);
    setNewAlbumUrl(album.thumbnail);
    setNewAlbumFile(null); // No new file selected yet
    setIsAddAlbumModalOpen(true);
    setIsAddAlbumCropping(false);
  };

  const handleDeleteImage = async (albumId, imageUrl) => {
    if (!window.confirm("Delete this image permanently?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_GALLERY_IMAGE(albumId), { data: { imageUrl } });
      fetchGallery();
    } catch (err) {
      alert("Failed to delete image");
    }
  };

  const handleDeleteAlbum = async (id) => {
    if (!window.confirm("Delete this entire album and ALL its images? This cannot be undone.")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_GALLERY(id));
      fetchGallery();
    } catch (err) {
      alert("Failed to delete album");
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return alert("Name is required");
    if (!editingAlbumId && !newAlbumFile) return alert("Thumbnail is required for new albums");
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("albumName", newAlbumName.trim());
    
    try {
      if (newAlbumFile) {
        const blob = await getCroppedImgBlob(newAlbumUrl, tempPixels);
        formData.append("thumbnail", blob, `thumb_${Date.now()}.jpg`);
      }

      if (editingAlbumId) {
        await PutRequest(ADMIN_UPDATE_GALLERY(editingAlbumId), formData);
      } else {
        await PostRequest(ADMIN_CREATE_GALLERY, formData);
      }
      
      setIsAddAlbumModalOpen(false);
      setEditingAlbumId(null);
      setNewAlbumName("");
      setNewAlbumFile(null);
      setNewAlbumUrl(null);
      fetchGallery();
    } catch (err) {
      alert("Failed to save album");
    } finally {
      setIsUploading(false);
    }
  };

  // --- Selection & Cropping Flow ---

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newItems = files.map(file => ({
        file,
        url: URL.createObjectURL(file),
        crop: { x: 0, y: 0 },
        zoom: 1,
        aspect: 4 / 3,
        pixels: null,
        previewUrl: null
      }));
      setSelectionItems(newItems);
      openCropper(0, newItems);
    }
  };

  const openCropper = (index, items = selectionItems) => {
    const item = items[index];
    if (!item) return;
    setCurrentCropIndex(index);
    setTempCrop(item.crop);
    setTempZoom(item.zoom);
    setTempAspect(item.aspect);
    setTempPixels(item.pixels);
    setIsCropModalOpen(true);
    setIsPreviewModalOpen(false);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setTempPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    try {
      const item = selectionItems[currentCropIndex];
      const previewBlob = await getCroppedImgBlob(item.url, tempPixels);
      const previewUrl = URL.createObjectURL(previewBlob);

      const updatedItems = [...selectionItems];
      updatedItems[currentCropIndex] = {
        ...item,
        crop: tempCrop,
        zoom: tempZoom,
        aspect: tempAspect,
        pixels: tempPixels,
        previewUrl
      };
      setSelectionItems(updatedItems);

      if (currentCropIndex < updatedItems.length - 1) {
        openCropper(currentCropIndex + 1, updatedItems);
      } else {
        setIsCropModalOpen(false);
        setIsPreviewModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeSelection = (index) => {
    const updated = selectionItems.filter((_, i) => i !== index);
    setSelectionItems(updated);
    if (updated.length === 0) {
      setIsPreviewModalOpen(false);
    }
  };

  const handleFinalUpload = async () => {
    if (!selectedAlbum || selectionItems.length === 0) return;
    setIsUploading(true);
    const formData = new FormData();
    
    try {
      for (let i = 0; i < selectionItems.length; i++) {
        const item = selectionItems[i];
        const blob = await getCroppedImgBlob(item.url, item.pixels);
        formData.append("images", blob, `cropped_${Date.now()}_${i}.jpg`);
      }

      await PostRequest(ADMIN_ADD_GALLERY_IMAGES(selectedAlbum.id), formData);
      setSelectionItems([]);
      setIsPreviewModalOpen(false);
      fetchGallery();
    } catch (err) {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in py-2">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Gallery Management</h1>
          <p className="text-slate-500">Manage your website albums and images</p>
        </div>
        <button
          onClick={() => { setEditingAlbumId(null); setIsAddAlbumModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
        >
          <Plus size={20} /> Add New Album
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
          <p className="text-slate-500">Loading gallery data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-sm uppercase tracking-wider">
                  <th className="px-6 py-4">Thumbnail</th>
                  <th className="px-6 py-4">Album Name</th>
                  <th className="px-6 py-4">Images Count</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {albums.map((album) => (
                  <tr key={album.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        <img 
                          src={album.thumbnail || "https://via.placeholder.com/100?text=No+Thumb"} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 group">
                          <span className="font-medium text-slate-700">{album.albumName}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                        {album.images?.length || 0} Images
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditAlbumInit(album)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button
                          onClick={() => { setSelectedAlbum(album); setIsViewModalOpen(true); }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Eye size={16} /> View
                        </button>
                        <button
                          onClick={() => handleDeleteAlbum(album.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- Add/Edit Album Modal --- */}
      {isAddAlbumModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-slide-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{editingAlbumId ? "Edit Album" : "Create New Album"}</h2>
              <button 
                onClick={() => { setIsAddAlbumModalOpen(false); setEditingAlbumId(null); setNewAlbumName(""); setNewAlbumFile(null); setNewAlbumUrl(null); }} 
                className="p-1 hover:bg-white rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Album Name</label>
                <input 
                  type="text" 
                  value={newAlbumName} 
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Enter album name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setNewAlbumFile(e.target.files[0]);
                      setNewAlbumUrl(URL.createObjectURL(e.target.files[0]));
                      setIsAddAlbumCropping(true);
                    }
                  }}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>
              {isAddAlbumCropping && newAlbumUrl && (
                <div className="h-48 bg-slate-100 rounded-xl overflow-hidden relative">
                  <Cropper
                    image={newAlbumUrl}
                    crop={tempCrop}
                    zoom={tempZoom}
                    aspect={1}
                    onCropChange={setTempCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setTempZoom}
                  />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsAddAlbumModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium">Cancel</button>
              <button 
                onClick={handleCreateAlbum}
                disabled={isUploading}
                className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-50"
              >
                {isUploading ? "Saving..." : "Save Album"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- View Gallery Modal --- */}
      {isViewModalOpen && selectedAlbum && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 capitalize">{selectedAlbum.albumName} Gallery</h2>
                <p className="text-xs text-slate-500">Manage images for this category</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {/* Add More Button */}
                <label className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all group">
                  <input type="file" multiple accept="image/*" className="hidden" onChange={onFileChange} />
                  <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
                    <Plus size={24} />
                  </div>
                  <span className="text-xs font-medium text-slate-500 group-hover:text-brand-600">Add Images</span>
                </label>

                {/* Existing Images */}
                {selectedAlbum.images?.map((img, idx) => (
                  <div key={idx} className="aspect-square relative rounded-xl overflow-hidden group shadow-sm border border-slate-200 bg-white">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => handleDeleteImage(selectedAlbum.id, img)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transform scale-75 group-hover:scale-100 transition-all shadow-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end">
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Batch Crop Modal --- */}
      {isCropModalOpen && selectionItems[currentCropIndex] && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold">
                  {currentCropIndex + 1}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Crop Image</h2>
                  <p className="text-xs text-slate-500 line-clamp-1">{selectionItems[currentCropIndex].file.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-400">Step {currentCropIndex + 1} of {selectionItems.length}</span>
                <button onClick={() => setIsCropModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 bg-slate-900">
              <Cropper
                image={selectionItems[currentCropIndex].url}
                crop={tempCrop}
                zoom={tempZoom}
                aspect={tempAspect}
                onCropChange={setTempCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setTempZoom}
                minZoom={0.5}
                restrictPosition={false}
              />
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-white space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Aspect Ratio:</span>
                  <div className="flex gap-1">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio.label}
                        onClick={() => setTempAspect(ratio.value)}
                        className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${
                          tempAspect === ratio.value
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-brand-500'
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 flex-1 max-w-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Zoom</span>
                  <input
                    type="range"
                    value={tempZoom}
                    min={0.5}
                    max={3}
                    step={0.1}
                    onChange={(e) => setTempZoom(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {currentCropIndex > 0 && (
                    <button
                      onClick={() => openCropper(currentCropIndex - 1)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all"
                    >
                      <ChevronLeft size={18} /> Previous
                    </button>
                  )}
                  <button
                    onClick={() => { setTempCrop({ x: 0, y: 0 }); setTempZoom(1); }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <RotateCcw size={16} /> Reset
                  </button>
                </div>
                
                <button
                  onClick={handleSaveCrop}
                  className="inline-flex items-center gap-2 px-8 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
                >
                  {currentCropIndex < selectionItems.length - 1 ? 'Save & Next' : 'Done Cropping'} <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Post-Crop Selection Preview Modal --- */}
      {isPreviewModalOpen && selectionItems.length > 0 && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Review Selection</h2>
                <p className="text-xs text-slate-500">Preview and adjust your cropped images before uploading</p>
              </div>
              <button onClick={() => { setIsPreviewModalOpen(false); setSelectionItems([]); }} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-slate-50">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {selectionItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-2 group animate-scale-up">
                    <div className="aspect-square relative rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white group-hover:border-brand-500 transition-all">
                      <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => openCropper(idx)}
                          className="p-2.5 bg-white text-brand-600 rounded-xl hover:bg-brand-50 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg font-bold text-xs flex items-center gap-1"
                        >
                          <Edit2 size={14} /> Re-edit
                        </button>
                        <button 
                          onClick={() => removeSelection(idx)}
                          className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg delay-75"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="absolute top-2 right-2 p-1 bg-white/90 backdrop-blur rounded-lg shadow-sm">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      </div>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 truncate px-1">{item.file.name}</p>
                  </div>
                ))}

                {/* Quick Add More while in preview */}
                <label className="aspect-square border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all group">
                  <input type="file" multiple accept="image/*" className="hidden" 
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      const newItems = files.map(file => ({
                        file,
                        url: URL.createObjectURL(file),
                        crop: { x: 0, y: 0 },
                        zoom: 1,
                        aspect: 4 / 3,
                        pixels: null,
                        previewUrl: null
                      }));
                      const updated = [...selectionItems, ...newItems];
                      setSelectionItems(updated);
                      openCropper(selectionItems.length, updated);
                    }} 
                  />
                  <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
                    <Plus size={24} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-brand-600">Add More</span>
                </label>
              </div>
            </div>

            <div className="px-6 py-6 border-t border-slate-100 bg-white flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <AlertCircle size={18} className="text-brand-500" />
                <span className="text-sm font-medium">{selectionItems.length} images ready to be saved</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setSelectionItems([]); setIsPreviewModalOpen(false); }}
                  className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
                >
                  Discard All
                </button>
                <button 
                  onClick={handleFinalUpload}
                  className="px-10 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/30 flex items-center gap-2"
                >
                  Confirm & Upload All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Add New Album Modal --- */}
      {isAddAlbumModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-slate-900">Add New Album</h2>
              <button 
                onClick={() => { setIsAddAlbumModalOpen(false); setNewAlbumUrl(null); }} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Album Name</label>
                <input
                  type="text"
                  placeholder="e.g. Workshop 2024"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Album Thumbnail</label>
                {!newAlbumUrl ? (
                  <label className="w-full aspect-video border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setNewAlbumFile(e.target.files[0]);
                          setNewAlbumUrl(URL.createObjectURL(e.target.files[0]));
                          setIsAddAlbumCropping(true);
                        }
                      }} 
                    />
                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
                      <Upload size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-brand-600">Click to Select Thumbnail</span>
                  </label>
                ) : (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200">
                    {isAddAlbumCropping ? (
                      <div className="relative h-full bg-slate-900">
                        <Cropper
                          image={newAlbumUrl}
                          crop={tempCrop}
                          zoom={tempZoom}
                          aspect={4 / 3}
                          onCropChange={setTempCrop}
                          onCropComplete={onCropComplete}
                          onZoomChange={setTempZoom}
                        />
                        <button 
                          onClick={() => setIsAddAlbumCropping(false)}
                          className="absolute bottom-4 right-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold shadow-lg"
                        >
                          Confirm Crop
                        </button>
                      </div>
                    ) : (
                      <>
                        <img 
                          src={newAlbumUrl} 
                          className="w-full h-full object-cover" 
                          alt="Preview" 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setIsAddAlbumCropping(true)}
                            className="p-2 bg-white text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => { setNewAlbumUrl(null); setNewAlbumFile(null); }}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => { setIsAddAlbumModalOpen(false); setEditingAlbumId(null); setNewAlbumName(""); setNewAlbumFile(null); setNewAlbumUrl(null); }} 
                className="flex-1 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateAlbum}
                disabled={isUploading || isAddAlbumCropping}
                className="flex-[2] py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/30 disabled:opacity-50"
              >
                {isUploading ? 'Saving...' : editingAlbumId ? 'Update Album' : 'Create Album'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Uploading Loader --- */}
      {isUploading && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center">
            <div className="relative mb-6">
              <Loader2 className="w-14 h-14 text-brand-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-brand-600">
                  {selectionItems.length}
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Uploading Assets</h3>
            <p className="text-sm text-slate-500 text-center max-w-[200px]">We're processing and securing your gallery images...</p>
          </div>
        </div>
      )}
    </div>
  );
}
