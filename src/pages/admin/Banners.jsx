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
  Scissors,
  Eye,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Cropper from "react-easy-crop";
import {
  GetRequest,
  PostRequest,
  DeleteRequest,
  PutRequest,
  PatchRequest,
} from "../../apis/api";
import {
  ADMIN_UPLOAD_BANNER,
  ADMIN_DELETE_BANNER,
  ADMIN_GET_BANNERS,
  ADMIN_UPDATE_BANNER,
  ADMIN_TOGGLE_BANNER,
  ADMIN_TOGGLE_BANNER_CONTENT,
} from "../../apis/endpoints";

export default function Banners() {
  const [list, setList] = useState([]);
  const [view, setView] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [togglingContentId, setTogglingContentId] = useState(null);
  const [showFullView, setShowFullView] = useState(false);
  const [fullViewData, setFullViewData] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [highlight, setHighlight] = useState("");
  const [isContentActive, setIsContentActive] = useState(true);
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
  const [cropperLoading, setCropperLoading] = useState(false);

  const fileInputRef = useRef(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await GetRequest(
        `${ADMIN_GET_BANNERS}?admin=true&_t=${Date.now()}`
      );
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

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Image size should be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageToCrop(event.target.result);
      setShowCropper(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    };
    reader.onerror = () => alert("Failed to read the image file");
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const createCroppedImage = async () => {
    if (!imageToCrop) {
      alert("No image to crop");
      return;
    }

    if (!croppedAreaPixels) {
      alert("Please adjust the crop area first");
      return;
    }

    setCropperLoading(true);

    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);

      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }

      setFile(croppedImage);
      setPreview(URL.createObjectURL(croppedImage));
      setShowCropper(false);
      setImageToCrop(null);
      setCroppedAreaPixels(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (e) {
      console.error("Cropping error:", e);
      alert(`Failed to crop image: ${e.message}`);
    } finally {
      setCropperLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setHighlight("");
    setSubtitle("");
    setTagline("");
    setDescription("");
    setButtonText("");
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setEditingId(null);
    setIsContentActive(true);
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
    setIsContentActive(banner.isContentActive !== false);
    setView("form");
  };

  const handleToggle = async (banner) => {
    if (togglingId === banner.id) return;
    try {
      setTogglingId(banner.id);
      await PatchRequest(ADMIN_TOGGLE_BANNER(banner.id));
      setList((prev) =>
        prev.map((b) =>
          b.id === banner.id ? { ...b, isActive: !b.isActive } : b
        )
      );
    } catch (err) {
      console.error("Toggle failed:", err);
      alert("Failed to toggle banner status.");
      fetchBanners();
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleContent = async (banner) => {
    if (togglingContentId === banner.id) return;
    try {
      setTogglingContentId(banner.id);
      await PatchRequest(ADMIN_TOGGLE_BANNER_CONTENT(banner.id));
      setList((prev) =>
        prev.map((b) =>
          b.id === banner.id ? { ...b, isContentActive: !b.isContentActive } : b
        )
      );
    } catch (err) {
      console.error("Content toggle failed:", err);
      alert("Failed to toggle banner content.");
      fetchBanners();
    } finally {
      setTogglingContentId(null);
    }
  };

  const handleSubmit = async () => {
    if (!editingId && !file) return alert("Please select and crop a banner image!");
    if (!title || !highlight || !subtitle) return alert("Please fill in all required fields!");

    const fd = new FormData();
    if (file) fd.append("photo", file);
    fd.append("title", title);
    fd.append("highlight", highlight);
    fd.append("subtitle", subtitle);
    fd.append("tagline", tagline);
    fd.append("description", description);
    fd.append("button", buttonText);
    fd.append("isContentActive", isContentActive);

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
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_BANNER(id));
      setList((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete banner.");
      fetchBanners();
    }
  };

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
            <p className="text-gray-500 mt-1">Manage your website banners and promotional content</p>
          </div>
          {view === "list" ? (
            <button
              onClick={() => setView("form")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add New Banner
            </button>
          ) : (
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to List
            </button>
          )}
        </div>

        {view === "list" ? (
          /* List View */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : list.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No banners found</p>
                        <button
                          onClick={() => setView("form")}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Create your first banner
                        </button>
                      </td>
                    </tr>
                  ) : (
                    list.map((banner) => (
                      <tr key={banner.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-100">
                            <img src={banner.photoUrl} alt={banner.title} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{banner.title}</p>
                            <p className="text-sm text-blue-600 font-medium">{banner.highlight}</p>
                            <p className="text-xs text-gray-500">{banner.subtitle}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggle(banner)}
                            disabled={togglingId === banner.id}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${banner.isActive ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${banner.isActive ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleContent(banner)}
                            disabled={togglingContentId === banner.id}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${banner.isContentActive !== false ? 'bg-blue-500' : 'bg-gray-300'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${banner.isContentActive !== false ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">{formatDate(banner.updatedAt || banner.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => { setFullViewData(banner); setShowFullView(true); }}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(banner)}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => remove(banner.id)}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {editingId ? "Edit Banner" : "Create New Banner"}
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Master Web Development"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Highlight Text <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => setHighlight(e.target.value)}
                      placeholder="e.g., 10x Faster"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g., with Industry Experts"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g., ★ 4.9/5 Rating"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="e.g., Enroll Now"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="4"
                      placeholder="Brief description of the banner..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Banner Image</h3>

                {/* Content Visibility Toggle */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Content Visibility</p>
                      <p className="text-xs text-gray-500">Show/Hide text overlay</p>
                    </div>
                    <button
                      onClick={() => setIsContentActive(!isContentActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isContentActive ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isContentActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Image Upload Area */}
                <div className={`relative rounded-xl border-2 border-dashed transition-all overflow-hidden ${preview ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50'
                  }`}>
                  {preview ? (
                    <div className="relative group">
                      <img src={preview} alt="Preview" className="w-full h-auto max-h-64 object-contain" />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <label
                          htmlFor="banner-upload"
                          className="cursor-pointer bg-white text-gray-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg"
                        >
                          <Scissors className="w-4 h-4" />
                          Change Image
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="banner-upload"
                      className="flex flex-col items-center justify-center p-8 cursor-pointer"
                    >
                      <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                        <UploadCloud className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Click to upload</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
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

                {/* Form Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {editingId ? "Update Banner" : "Create Banner"}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cropper Modal - Fixed with proper visibility */}
        {showCropper && imageToCrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Crop Banner Image</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Drag to adjust crop area | Use slider to zoom | Recommended ratio: 4:3
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCropper(false);
                    setImageToCrop(null);
                    setCroppedAreaPixels(null);
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Cropper Container with fixed height */}
              <div className="relative w-full h-[400px] sm:h-[500px] bg-black">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 3}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  showGrid={true}
                  zoomWithScroll={true}
                  cropShape="rect"
                  style={{
                    containerStyle: {
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#000',
                    },
                    mediaStyle: {
                      maxWidth: '100%',
                      maxHeight: '100%',
                    },
                  }}
                />
              </div>

              {/* Zoom Controls */}
              <div className="p-6 bg-white border-t border-gray-200">
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <ZoomOut className="w-4 h-4" />
                      <span>Zoom</span>
                      <ZoomIn className="w-4 h-4" />
                    </div>
                    <span className="text-blue-600 font-semibold">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.01}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Tip: Use mouse wheel to zoom, drag to reposition
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCropper(false);
                      setImageToCrop(null);
                      setCroppedAreaPixels(null);
                      setCrop({ x: 0, y: 0 });
                      setZoom(1);
                    }}
                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createCroppedImage}
                    disabled={cropperLoading}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cropperLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Apply Crop</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showFullView && fullViewData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Banner Preview</h3>
                <button
                  onClick={() => setShowFullView(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="relative w-full aspect-[21/9] bg-gray-100">
                  <img
                    src={fullViewData.photoUrl}
                    alt={fullViewData.title}
                    className="w-full h-full object-cover"
                  />
                  {fullViewData.isContentActive !== false && (
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center px-12">
                      <div className="max-w-md text-white space-y-3">
                        <div className="inline-flex bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {fullViewData.tagline || "FEATURED"}
                        </div>
                        <h2 className="text-4xl font-bold leading-tight">
                          {fullViewData.title}
                          <br />
                          <span className="text-blue-400">{fullViewData.highlight}</span>
                        </h2>
                        <p className="text-sm text-gray-200">{fullViewData.subtitle}</p>
                        <button className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2">
                          Learn More →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6 grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Banner Status</p>
                    <p className={`font-semibold ${fullViewData.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      {fullViewData.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Content Status</p>
                    <p className={`font-semibold ${fullViewData.isContentActive !== false ? 'text-blue-600' : 'text-gray-400'}`}>
                      {fullViewData.isContentActive !== false ? 'Visible' : 'Hidden'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Last Updated</p>
                    <p className="font-semibold text-gray-700 text-sm">
                      {formatDate(fullViewData.updatedAt || fullViewData.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Improved crop utility function
async function getCroppedImg(imageSrc, pixelCrop) {
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = url;
    });

  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Set canvas dimensions to the cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image
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

    // Return as a File object
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob"));
            return;
          }
          const file = new File([blob], "cropped-banner.jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(file);
        },
        "image/jpeg",
        0.95
      );
    });
  } catch (error) {
    console.error("Error in getCroppedImg:", error);
    throw error;
  }
}