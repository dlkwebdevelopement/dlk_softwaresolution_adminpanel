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
import { GetRequest, PostRequest, DeleteRequest, PutRequest } from "../../apis/config";
import { 
  ADMIN_UPLOAD_BANNER, 
  ADMIN_DELETE_BANNER, 
  ADMIN_GET_BANNERS, 
  ADMIN_UPDATE_BANNER 
} from "../../apis/endpoints";

export default function Banners() {
  const [list, setList] = useState([]);
  const [view, setView] = useState("list"); // "list" or "form"
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [highlight, setHighlight] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  const fileInputRef = useRef(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await GetRequest(ADMIN_GET_BANNERS);
      setList(data);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('Image size should be less than 10MB');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      setImageToCrop(event.target.result);
      setShowCropper(true);
      // Reset zoom and crop position for new image
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    };
    
    reader.onerror = () => {
      alert('Failed to read the image file');
    };
    
    reader.readAsDataURL(file);
    
    // Clear the input value to allow selecting the same file again
    e.target.value = '';
  };

  const createCroppedImage = async () => {
    try {
      if (!imageToCrop) throw new Error('No image to crop');
      if (!croppedAreaPixels) throw new Error('No crop area selected');
      
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // Clean up previous preview URL to avoid memory leaks
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      
      setFile(croppedImage);
      setPreview(URL.createObjectURL(croppedImage));
      setShowCropper(false);
      setImageToCrop(null);
    } catch (e) {
      console.error('Cropping error:', e);
      alert(`Failed to crop image: ${e.message}`);
    }
  };

  const resetForm = () => {
    setTitle("");
    setHighlight("");
    setSubtitle("");
    setTagline("");
    setDescription("");
    setButtonText("");
    setFile(null);
    // Clean up preview URL
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setEditingId(null);
    setView("list");
  };

  const handleEdit = (banner) => {
    setTitle(banner.title || "");
    setHighlight(banner.highlight || "");
    setSubtitle(banner.subtitle || "");
    setTagline(banner.tagline || "");
    setDescription(banner.description || "");
    setButtonText(banner.button || "");
    setEditingId(banner.id);
    setPreview(banner.photoUrl);
    setView("form");
  };

  const handleSubmit = async () => {
    if (!editingId && !file) return alert("Select and crop a banner image!");
    if (!title || !highlight || !subtitle) return alert("Fill in required fields!");

    const fd = new FormData();
    if (file) fd.append("photo", file);
    fd.append("title", title);
    fd.append("highlight", highlight);
    fd.append("subtitle", subtitle);
    fd.append("tagline", tagline);
    fd.append("description", description);
    fd.append("button", buttonText);

    try {
      if (editingId) {
        await PutRequest(ADMIN_UPDATE_BANNER(editingId), fd);
        alert("Banner updated successfully!");
      } else {
        await PostRequest(ADMIN_UPLOAD_BANNER, fd);
        alert("Banner uploaded successfully!");
      }
      resetForm();
      fetchBanners();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save banner.");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_BANNER(id));
      fetchBanners();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete banner.");
    }
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in py-6 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Banner Management</h1>
          <p className="text-slate-500 mt-1">Manage hero sections, promotional banners, and call-to-actions.</p>
        </div>
        {view === "list" ? (
          <button 
            onClick={() => setView("form")}
            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Banner
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
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Content Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">Loading banners...</td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No banners found</p>
                      <button onClick={() => setView("form")} className="text-brand-600 hover:underline text-sm mt-2 font-semibold">Upload your first one</button>
                    </td>
                  </tr>
                ) : (
                  list.map((banner) => (
                    <tr key={banner.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                          <img 
                            src={banner.photoUrl} 
                            alt={banner.title} 
                            className="w-full h-full object-contain transition-transform group-hover:scale-110" 
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-900 line-clamp-1">{banner.title}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-bold">{banner.highlight}</span>
                            <span className="text-xs text-slate-500 line-clamp-1 italic">{banner.subtitle}</span>
                          </div>
                          {banner.tagline && <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Tag: {banner.tagline}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(banner.updatedAt || banner.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(banner)}
                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                            title="Edit Banner"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => remove(banner.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Banner"
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
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Edit className="w-5 h-5 text-brand-600" />
                {editingId ? "Edit Banner Details" : "New Banner Details"}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Main Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Master Advanced Skills"
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Highlight Text <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={highlight} 
                    onChange={(e) => setHighlight(e.target.value)}
                    placeholder="e.g. 10x Faster"
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Subtitle <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={subtitle} 
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. with Industry Experts"
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tagline (Top Label)</label>
                  <input 
                    type="text" 
                    value={tagline} 
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. ★ 4.9/5 Rating"
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Button Text</label>
                  <input 
                    type="text" 
                    value={buttonText} 
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g. Start Learning Now"
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Description</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Summary of the banner/promotion..."
                    rows={4}
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand-600" />
                Banner Media
              </h2>
              
              <div className="space-y-4">
                <div 
                  className={`relative aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${
                    preview ? 'border-brand-200 bg-brand-50/10' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/50'
                  }`}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label htmlFor="banner-upload" className="cursor-pointer bg-white text-slate-700 px-4 py-2 rounded-lg font-bold text-sm shadow-xl flex items-center gap-2 hover:bg-brand-50">
                          <Scissors className="w-4 h-4" />
                          Change & Crop
                        </label>
                      </div>
                    </>
                  ) : (
                    <label htmlFor="banner-upload" className="cursor-pointer flex flex-col items-center text-center p-4">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                        <UploadCloud className="w-6 h-6 text-brand-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Select & Crop Image</span>
                      <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Aspect Ratio 4:3 Recommended</span>
                    </label>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    className="hidden"
                    id="banner-upload"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-200 shadow-brand-100 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {editingId ? "Update Banner" : "Create Banner"}
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

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-zoom-in">
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900">Crop Banner Image</h3>
                <p className="text-xs md:text-sm text-slate-500">Adjust the selection for optimal banner display (4:3)</p>
              </div>
              <button 
                onClick={() => {
                  setShowCropper(false);
                  setImageToCrop(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="relative flex-1 bg-slate-950 min-h-[350px] md:min-h-[450px]">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-5 bg-white border-t border-slate-100 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-bold text-slate-700">
                  <span>Zoom Level</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={0.5}
                  max={4}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setShowCropper(false);
                    setImageToCrop(null);
                  }}
                  className="flex-1 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={createCroppedImage}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <Scissors className="w-5 h-5" />
                  Save & Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility function for cropping
async function getCroppedImg(imageSrc, pixelCrop) {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Set canvas dimensions to the cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image onto the canvas
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

    // Convert canvas to blob with better error handling
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "cropped-banner.jpg", { 
              type: 'image/jpeg' 
            });
            resolve(file);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        'image/jpeg',
        0.95
      );
    });
  } catch (error) {
    console.error('Error in getCroppedImg:', error);
    throw error;
  }
}

const createImage = (url) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    
    // Important: Set crossOrigin before setting src
    image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      // Validate that the image loaded properly
      if (image.width === 0 || image.height === 0) {
        reject(new Error('Image has zero dimensions'));
      } else {
        resolve(image);
      }
    };
    
    image.onerror = (error) => {
      console.error('Image loading error:', error);
      reject(new Error(`Failed to load image: ${error.message || 'Unknown error'}`));
    };
    
    image.src = url;
  });
};