import React, { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import {
  Edit2,
  Trash2,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Upload,
  Layers
} from "lucide-react";

import {
  ADMIN_GET_OFFICE_GALLERY,
  ADMIN_GET_ALL_OFFICE_GALLERY_EVENTS,
  ADMIN_POST_OFFICE_GALLERY_EVENT,
  ADMIN_PUT_OFFICE_GALLERY_EVENT,
  ADMIN_DELETE_OFFICE_GALLERY_EVENT
} from "../../apis/endpoints";

import {
  GetRequest,
  PostRequest,
  PutRequest,
  DeleteRequest,
} from "../../apis/api";

export default function OfficeGalleryEvents() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  // Form states
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]); // already-saved URLs
  const [isUploading, setIsUploading] = useState(false);

  // Cropper states for Main Image
  const [cropImage, setCropImage] = useState(null);
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await GetRequest(ADMIN_GET_OFFICE_GALLERY);
      setCategories(res || []);
    } catch (err) {
      console.error("Fetch Office Categories Error:", err);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await GetRequest(ADMIN_GET_ALL_OFFICE_GALLERY_EVENTS);
      if (res.success) {
        setEvents(res.data || []);
      }
    } catch (err) {
      console.error("Fetch Office Events Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCategoryId("");
    setTitle("");
    setEventDate("");
    setEventTime("");
    setMainImage(null);
    setMainImagePreview(null);
    galleryImages.forEach(img => URL.revokeObjectURL(img.preview));
    setGalleryImages([]);
    setExistingGalleryImages([]);
    setEditingEventId(null);
    setIsFormVisible(false);
  };

  const handleEdit = (event) => {
    setEditingEventId(event.id);
    setCategoryId(event.categoryId?._id || event.categoryId || "");
    setTitle(event.title);

    const d = new Date(event.eventDate);
    setEventDate(d.toISOString().split('T')[0]);

    setEventTime(event.eventTime || "");
    setMainImagePreview(event.mainImage);
    // Load existing gallery images as URL strings
    setExistingGalleryImages(event.galleryImages || []);
    setGalleryImages([]); // new uploads start empty

    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Main Image Crop Logic
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
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
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          const file = new File([blob], "main_image.jpg", { type: "image/jpeg" });
          resolve(file);
        }, "image/jpeg");
      };
      image.onerror = (e) => reject(e);
      image.src = imageSrc;
    });
  };

  const handleApplyCrop = async () => {
    try {
      if (croppedAreaPixels) {
        const croppedFile = await getCroppedImg(cropImage, croppedAreaPixels);

        // Revoke old preview if exists
        if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);

        const previewUrl = URL.createObjectURL(croppedFile);
        console.log("Setting main image preview:", previewUrl);

        setMainImage(croppedFile);
        setMainImagePreview(previewUrl);
        setCropModalVisible(false);
        setCropImage(null);
      }
    } catch (err) {
      console.error("Crop Error:", err);
      alert("Error cropping image: " + err.message);
    }
  };

  const handleSubmit = async () => {
    if (!categoryId || !title || !eventDate) {
      return alert("Please fill category, title, and date");
    }
    if (!editingEventId && !mainImage) {
      return alert("Main image is required for new events");
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("categoryId", categoryId);
    formData.append("title", title);
    formData.append("eventDate", eventDate);
    formData.append("eventTime", eventTime);

    if (mainImage) {
      formData.append("mainImage", mainImage);
    }

    // Send which existing images to keep (so backend can delete removed ones)
    formData.append("keepImages", JSON.stringify(existingGalleryImages));

    galleryImages.forEach((imgObj) => {
      formData.append("galleryImages", imgObj.file);
    });

    try {
      let res;
      if (editingEventId) {
        res = await PutRequest(ADMIN_PUT_OFFICE_GALLERY_EVENT(editingEventId), formData);
      } else {
        res = await PostRequest(ADMIN_POST_OFFICE_GALLERY_EVENT, formData);
      }

      if (res.success) {
        alert(editingEventId ? "Gallery event updated successfully!" : "Gallery event created successfully!");
        resetForm();
        fetchEvents();
      }
    } catch (err) {
      console.error("Submit Event Error:", err);
      alert("Failed to subit event");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this gallery event?")) return;
    try {
      const res = await DeleteRequest(ADMIN_DELETE_OFFICE_GALLERY_EVENT(id));
      if (res.success) {
        fetchEvents();
      }
    } catch (err) {
      console.error("Delete Office Event Error:", err);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Office Gallery </h1>
          <p className="text-slate-500">Create and manage office-specific event galleries</p>
        </div>
        {!isFormVisible && (
          <button
            onClick={() => setIsFormVisible(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Event
          </button>
        )}
      </div>

      {isFormVisible && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-12 animate-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">{editingEventId ? "Edit Gallery Event" : "New Gallery Event"}</h2>
            <button onClick={resetForm} className="p-2 hover:bg-white text-slate-400 hover:text-slate-600 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Gallery Category (Album)</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="">Select Album</option>
                  {categories.map((cat) => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.albumName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Event Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Graduation Day 2024"
                  className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

            </div>

            {/* Featured Image */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 block">Main Image</label>
              <div className={`p-5 rounded-xl border-2 border-dashed ${mainImage ? 'border-brand-300 bg-brand-50/30' : 'border-slate-300 bg-slate-50'}`}>
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="w-48 h-32 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                    {mainImagePreview ? (
                      <img src={mainImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => { setCropImage(reader.result); setCropModalVisible(true); };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    />
                    <p className="text-xs text-slate-400">Recommended for banners. Crop it below.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Images */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 block">Gallery Images (Multiple)</label>
              <div className="p-5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-4">

                  {/* Existing saved images */}
                  {existingGalleryImages.map((url, idx) => (
                    <div key={`existing-${idx}`} className="aspect-square relative rounded-lg overflow-hidden group border-2 border-brand-200">
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <div className="absolute top-1 left-1 bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Saved</div>
                      <button
                        onClick={() => setExistingGalleryImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {/* New images to upload */}
                  {galleryImages.map((imgObj, idx) => (
                    <div key={`new-${idx}`} className="aspect-square relative rounded-lg overflow-hidden group border-2 border-dashed border-slate-300">
                      <img src={imgObj.preview} className="w-full h-full object-cover" alt="" />
                      <div className="absolute top-1 left-1 bg-slate-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">New</div>
                      <button
                        onClick={() => {
                          URL.revokeObjectURL(imgObj.preview);
                          setGalleryImages(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Add more button */}
                  <label className="aspect-square border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-white transition-all text-slate-400 hover:text-brand-500">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        const newImages = files.map(file => ({
                          file,
                          preview: URL.createObjectURL(file)
                        }));
                        setGalleryImages(prev => [...prev, ...newImages]);
                      }}
                    />
                    <Plus size={20} />
                    <span className="text-[10px] font-bold">Add Images</span>
                  </label>
                </div>
                {editingEventId && (
                  <p className="text-xs text-slate-400">
                    <span className="font-semibold text-brand-600">{existingGalleryImages.length} saved</span> · <span className="font-semibold text-slate-600">{galleryImages.length} new</span> · Hover over any image and click ✕ to remove it.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4 flex gap-3 items-start mt-2">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-600">
                <span className="font-bold text-amber-700">Disclaimer:</span> Please ensure you have the necessary rights to use and publish these images. For optimal performance, use high-quality JPG or PNG images under 2MB. Uploads are processed immediately.
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> : editingEventId ? "Update Gallery" : "Save Gallery"}
              </button>
              <button onClick={resetForm} className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
              <th className="px-6 py-4">Event Info</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Event Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-10 rounded overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={event.mainImage} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{event.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {event.id.substring(0, 8)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 text-brand-600 rounded-lg text-xs font-bold ring-1 ring-brand-100">
                    <Layers size={12} />
                    {event.categoryId?.albumName || categories.find(c => (c.id === event.categoryId || c._id === event.categoryId))?.albumName || "Unknown"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <Calendar size={12} /> {new Date(event.eventDate).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(event)} className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(event.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="flex justify-center p-20">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        </div>
      )}

      {/* Cropper Modal */}
      {cropModalVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Crop Main Image</h3>
              <button onClick={() => setCropModalVisible(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="relative" style={{ height: '400px', backgroundColor: '#0f172a' }}>
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-6 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setCropModalVisible(false)} className="px-6 py-2 text-slate-600 font-bold">Cancel</button>
              <button onClick={handleApplyCrop} className="px-8 py-2 bg-brand-600 text-white rounded-lg font-bold shadow-lg">Apply Crop</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
