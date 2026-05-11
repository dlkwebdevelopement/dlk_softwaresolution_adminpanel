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
  AlertCircle,
  Calendar,
  Layers
} from "lucide-react";
import Cropper from 'react-easy-crop';
import {
  GetRequest,
  PostRequest,
  PutRequest,
  DeleteRequest,
  PatchRequest,
} from "../../apis/api";
import {
  ADMIN_GET_OFFICE_GALLERY,
  ADMIN_CREATE_OFFICE_GALLERY_BATCH,
  ADMIN_UPDATE_OFFICE_GALLERY_BATCH,
  ADMIN_DELETE_OFFICE_GALLERY_BATCH,
  ADMIN_ADD_OFFICE_GALLERY_CATEGORY,
  ADMIN_UPDATE_OFFICE_GALLERY_CATEGORY,
  ADMIN_DELETE_OFFICE_GALLERY_CATEGORY,
  ADMIN_ADD_OFFICE_CATEGORY_IMAGES,
  ADMIN_DELETE_OFFICE_CATEGORY_IMAGE,
  ADMIN_UPDATE_OFFICE_CATEGORY_IMAGE_HIGHLIGHTS,
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

export default function OfficeGalleryManagement() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // --- Modals State ---
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- Form State ---
  const [batchForm, setBatchForm] = useState({ id: null, batchName: "", date: "" });
  const [categoryForm, setCategoryForm] = useState({ id: null, categoryName: "" });

  // --- Multi-Upload State ---
  const [selectionItems, setSelectionItems] = useState([]); // { file, url, crop, zoom, aspect, pixels, previewUrl, highlights }
  const [currentCropIndex, setCurrentCropIndex] = useState(-1);
  const [tempCrop, setTempCrop] = useState({ x: 0, y: 0 });
  const [tempZoom, setTempZoom] = useState(1);
  const [tempAspect, setTempAspect] = useState(4 / 3);
  const [tempPixels, setTempPixels] = useState(null);

  // --- Highlights State ---
  const [editingImageIdx, setEditingImageIdx] = useState(-1);
  const [highlightInput, setHighlightInput] = useState("");

  const aspectRatios = [
    { label: '4:3', value: 4 / 3 },
    { label: '1:1', value: 1 / 1 },
    { label: '16:9', value: 16 / 9 },
    { label: '3:2', value: 3 / 2 },
  ];

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await GetRequest(ADMIN_GET_OFFICE_GALLERY);
      const data = res.success ? res.data : res;
      setBatches(data || []);
      
      // Update selected objects if they exist
      if (selectedBatch) {
        const updatedBatch = (data || []).find(b => b._id === selectedBatch._id);
        if (updatedBatch) {
          setSelectedBatch(updatedBatch);
          if (selectedCategoryId) {
            const updatedCat = updatedBatch.categories?.find(c => c._id === selectedCategoryId);
            if (!updatedCat && updatedBatch.categories?.length > 0) {
              setSelectedCategoryId(updatedBatch.categories[0]._id);
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // --- Batch Handlers ---
  const handleOpenBatchModal = (batch = null) => {
    if (batch) {
      setBatchForm({
        id: batch._id,
        batchName: batch.batchName,
        date: batch.date ? new Date(batch.date).toISOString().split('T')[0] : ""
      });
    } else {
      setBatchForm({ id: null, batchName: "", date: "" });
    }
    setIsBatchModalOpen(true);
  };

  const handleSaveBatch = async () => {
    if (!batchForm.batchName.trim()) return alert("Batch name is required");
    setIsUploading(true);
    try {
      if (batchForm.id) {
        await PutRequest(ADMIN_UPDATE_OFFICE_GALLERY_BATCH(batchForm.id), {
          batchName: batchForm.batchName,
          date: batchForm.date
        });
      } else {
        await PostRequest(ADMIN_CREATE_OFFICE_GALLERY_BATCH, {
          batchName: batchForm.batchName,
          date: batchForm.date
        });
      }
      setIsBatchModalOpen(false);
      fetchBatches();
    } catch (err) {
      alert("Failed to save batch");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm("Are you sure? This will delete the batch and all its categories and images.")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_OFFICE_GALLERY_BATCH(batchId));
      fetchBatches();
    } catch (err) {
      alert("Failed to delete batch");
    }
  };

  // --- Category Handlers ---
  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setCategoryForm({ id: category._id, categoryName: category.categoryName });
    } else {
      setCategoryForm({ id: null, categoryName: "" });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.categoryName.trim()) return alert("Category name is required");
    if (!selectedBatch) return;

    setIsUploading(true);
    try {
      if (categoryForm.id) {
        await PutRequest(ADMIN_UPDATE_OFFICE_GALLERY_CATEGORY(selectedBatch._id, categoryForm.id), {
          categoryName: categoryForm.categoryName
        });
      } else {
        await PostRequest(ADMIN_ADD_OFFICE_GALLERY_CATEGORY(selectedBatch._id), {
          categoryName: categoryForm.categoryName
        });
      }
      setIsCategoryModalOpen(false);
      fetchBatches();
    } catch (err) {
      alert("Failed to save category");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm("Are you sure? This will delete the category and all its images.")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_OFFICE_GALLERY_CATEGORY(selectedBatch._id, catId));
      fetchBatches();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  // --- Image Handlers ---
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
        previewUrl: null,
        highlights: []
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
    if (!selectedBatch || !selectedCategoryId || selectionItems.length === 0) {
      return alert("Please select a category first");
    }
    setIsUploading(true);
    const formData = new FormData();

    try {
      for (let i = 0; i < selectionItems.length; i++) {
        const item = selectionItems[i];
        const blob = await getCroppedImgBlob(item.url, item.pixels);
        formData.append("images", blob, `cropped_${Date.now()}_${i}.jpg`);
      }

      const highlights = selectionItems.map(item => item.highlights || []);
      formData.append("highlights", JSON.stringify(highlights));

      await PostRequest(ADMIN_ADD_OFFICE_CATEGORY_IMAGES(selectedBatch._id, selectedCategoryId), formData);
      setSelectionItems([]);
      setIsPreviewModalOpen(false);
      fetchBatches();
    } catch (err) {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_OFFICE_CATEGORY_IMAGE(selectedBatch._id, selectedCategoryId), { data: { imageUrl } });
      fetchBatches();
    } catch (err) {
      alert("Failed to delete image");
    }
  };

  const handleUpdateHighlights = async (imageUrl, newHighlights) => {
    try {
      await PatchRequest(ADMIN_UPDATE_OFFICE_CATEGORY_IMAGE_HIGHLIGHTS(selectedBatch._id, selectedCategoryId), {
        imageUrl,
        highlights: newHighlights
      });
      setEditingImageIdx(-1);
      fetchBatches();
    } catch (err) {
      alert("Failed to update highlights");
    }
  };

  const currentCategory = selectedBatch?.categories?.find(c => c._id === selectedCategoryId);

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in py-2">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Office Gallery Management</h1>
          <p className="text-slate-500">Organize and manage gallery by batches and categories</p>
        </div>
        <button
          onClick={() => handleOpenBatchModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
        >
          <Plus size={20} /> Create New Batch
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
          <p className="text-slate-500">Loading gallery...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <div key={batch._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                    <Calendar size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenBatchModal(batch)}
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteBatch(batch._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{batch.batchName}</h3>
                <p className="text-sm text-slate-500 mb-4">
                  {batch.date ? new Date(batch.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No date set'}
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Layers size={14} />
                    {batch.categories?.length || 0} Categories
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ImageIcon size={14} />
                    {batch.categories?.reduce((acc, cat) => acc + (cat.images?.length || 0), 0)} Images
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedBatch(batch);
                  if (batch.categories?.length > 0) setSelectedCategoryId(batch.categories[0]._id);
                  else setSelectedCategoryId(null);
                  setIsViewModalOpen(true);
                }}
                className="w-full py-3 bg-slate-50 border-t border-slate-100 text-sm font-bold text-slate-600 hover:bg-brand-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Eye size={16} /> Manage Categories
              </button>
            </div>
          ))}

          {batches.length === 0 && (
            <div className="col-span-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No batches found</h3>
              <p className="text-slate-500 mb-6">Start by creating your first gallery batch</p>
              <button
                onClick={() => handleOpenBatchModal()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700"
              >
                <Plus size={20} /> Create First Batch
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- Batch Modal --- */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{batchForm.id ? "Edit Batch" : "Create New Batch"}</h2>
              <button onClick={() => setIsBatchModalOpen(false)} className="p-1 hover:bg-white rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batch Name</label>
                <input
                  type="text"
                  value={batchForm.batchName}
                  onChange={(e) => setBatchForm({ ...batchForm, batchName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="e.g. Batch 2024 - Office Life"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batch Date</label>
                <input
                  type="date"
                  value={batchForm.date}
                  onChange={(e) => setBatchForm({ ...batchForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsBatchModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
              <button
                onClick={handleSaveBatch}
                className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/20"
              >
                {batchForm.id ? "Update Batch" : "Create Batch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Category Modal --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{categoryForm.id ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 hover:bg-white rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
              <input
                type="text"
                value={categoryForm.categoryName}
                onChange={(e) => setCategoryForm({ ...categoryForm, categoryName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="e.g. Office Opening, Team Lunch..."
              />
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
              <button
                onClick={handleSaveCategory}
                className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/20"
              >
                {categoryForm.id ? "Update Category" : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- View Modal (Manage Categories & Images) --- */}
      {isViewModalOpen && selectedBatch && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedBatch.batchName}</h2>
                <p className="text-xs text-slate-500">Manage categories and upload gallery images</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Category Sidebar */}
              <div className="w-64 border-r border-slate-100 bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Categories</span>
                  <button
                    onClick={() => handleOpenCategoryModal()}
                    className="p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {selectedBatch.categories?.map((cat) => (
                    <div
                      key={cat._id}
                      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedCategoryId === cat._id
                          ? "bg-brand-600 text-white shadow-md"
                          : "text-slate-600 hover:bg-white hover:shadow-sm"
                        }`}
                      onClick={() => setSelectedCategoryId(cat._id)}
                    >
                      <span className="text-sm font-semibold truncate flex-1">{cat.categoryName}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenCategoryModal(cat); }}
                          className={`p-1 rounded ${selectedCategoryId === cat._id ? "hover:bg-brand-500" : "hover:bg-slate-100"}`}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat._id); }}
                          className={`p-1 rounded ${selectedCategoryId === cat._id ? "hover:bg-brand-500 text-brand-100" : "hover:bg-red-50 text-red-500"}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!selectedBatch.categories || selectedBatch.categories.length === 0) && (
                    <div className="p-4 text-center">
                      <p className="text-xs text-slate-400 italic">No categories yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Grid */}
              <div className="flex-1 overflow-y-auto bg-white p-6">
                {!selectedCategoryId ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <Layers size={48} className="mb-4" />
                    <p className="font-bold">Select or create a category to manage images</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-8 bg-brand-600 rounded-full"></span>
                        {currentCategory?.categoryName}
                      </h3>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-xl font-bold cursor-pointer hover:bg-brand-100 transition-all">
                        <Upload size={18} />
                        Upload Images
                        <input type="file" multiple accept="image/*" className="hidden" onChange={onFileChange} />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {currentCategory?.images?.map((img, idx) => (
                        <div key={idx} className="flex flex-col gap-2 group animate-scale-up">
                          <div className="aspect-square relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm transition-all group-hover:shadow-md">
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={() => { setEditingImageIdx(idx); setHighlightInput(""); }}
                                className="p-2 bg-white text-brand-600 rounded-full hover:bg-brand-50 shadow-lg"
                                title="Add Highlights"
                              >
                                <Plus size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteImage(img.url)}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          {/* Highlights */}
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 min-h-[40px]">
                            {editingImageIdx === idx ? (
                              <div className="flex gap-1">
                                <input
                                  autoFocus
                                  className="flex-1 text-[10px] px-2 py-1 border rounded bg-white outline-none focus:ring-1 focus:ring-brand-500"
                                  placeholder="Type and enter..."
                                  value={highlightInput}
                                  onChange={(e) => setHighlightInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && highlightInput.trim()) {
                                      handleUpdateHighlights(img.url, [...(img.highlights || []), highlightInput.trim()]);
                                      setHighlightInput("");
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    if (highlightInput.trim()) {
                                      handleUpdateHighlights(img.url, [...(img.highlights || []), highlightInput.trim()]);
                                      setHighlightInput("");
                                    } else setEditingImageIdx(-1);
                                  }}
                                  className="p-1 bg-brand-600 text-white rounded shadow-sm"
                                >
                                  <Check size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {(img.highlights || []).map((h, hIdx) => (
                                  <span key={hIdx} className="text-[9px] bg-white text-slate-600 px-1.5 py-0.5 rounded-md border border-slate-200 flex items-center gap-1 group/tag">
                                    {h}
                                    <X
                                      size={8}
                                      className="cursor-pointer hover:text-red-500"
                                      onClick={() => handleUpdateHighlights(img.url, img.highlights.filter((_, i) => i !== hIdx))}
                                    />
                                  </span>
                                ))}
                                <button
                                  onClick={() => setEditingImageIdx(idx)}
                                  className="text-[10px] text-brand-600 font-bold hover:underline px-1"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {currentCategory?.images?.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Upload size={32} />
                          </div>
                          <p className="text-slate-400 font-medium">No images in this category</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Batch Crop Modal --- */}
      {isCropModalOpen && selectionItems[currentCropIndex] && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
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
                        className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${tempAspect === ratio.value
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
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
                    <div className="px-1">
                      <p className="text-[10px] font-medium text-slate-400 truncate mb-1">{item.file.name}</p>
                      <input 
                        type="text"
                        placeholder="Add highlights (comma separated)"
                        className="w-full text-[10px] px-2 py-1 bg-white border border-slate-200 rounded focus:border-brand-500 outline-none"
                        value={item.highlights.join(", ")}
                        onChange={(e) => {
                          const updated = [...selectionItems];
                          updated[idx].highlights = e.target.value.split(",").map(h => h.trim()).filter(h => h);
                          setSelectionItems(updated);
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* Quick Add More */}
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
                        previewUrl: null,
                        highlights: []
                      }));
                      const updated = [...selectionItems, ...newItems];
                      setSelectionItems(updated);
                      openCropper(selectionItems.length, updated);
                    }}
                  />
                  <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
                    <Plus size={24} />
                  </div>
                </label>
              </div>
            </div>

            <div className="px-6 py-6 border-t border-slate-100 bg-white flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <AlertCircle size={18} className="text-brand-500" />
                <span className="text-sm font-medium">{selectionItems.length} images ready</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setSelectionItems([]); setIsPreviewModalOpen(false); }}
                  className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={handleFinalUpload}
                  className="px-10 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/30 flex items-center gap-2"
                >
                  Confirm & Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Uploading Loader --- */}
      {isUploading && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center">
            <Loader2 className="w-14 h-14 text-brand-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-1">Processing Request</h3>
            <p className="text-sm text-slate-500 text-center">Please wait while we sync your changes...</p>
          </div>
        </div>
      )}
    </div>
  );
}
