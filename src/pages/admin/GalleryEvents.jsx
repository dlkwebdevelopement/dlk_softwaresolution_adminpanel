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
  GetRequest,
  PostRequest,
  PutRequest,
  DeleteRequest,
  PatchRequest,
} from "../../apis/api";
import {
  ADMIN_GET_GALLERY,
  ADMIN_GET_ALL_GALLERY_EVENTS,
  ADMIN_POST_GALLERY_EVENT,
  ADMIN_PUT_GALLERY_EVENT,
  ADMIN_DELETE_GALLERY_EVENT,
  ADMIN_UPDATE_GALLERY_EVENT_IMAGE_HIGHLIGHTS
} from "../../apis/endpoints";

export default function GalleryEvents() {
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
  const [collegeName, setCollegeName] = useState("");
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

  // Per-image highlights state
  const [editingImageIdx, setEditingImageIdx] = useState(-1);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [highlightInput, setHighlightInput] = useState("");

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await GetRequest(ADMIN_GET_GALLERY);
      setCategories(res || []);
    } catch (err) {
      console.error("Fetch Categories Error:", err);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await GetRequest(ADMIN_GET_ALL_GALLERY_EVENTS);
      if (res.success) {
        setEvents(res.data || []);
      }
    } catch (err) {
      console.error("Fetch Events Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCategoryId("");
    setTitle("");
    setEventDate("");
    setEventTime("");
    setCollegeName("");
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
    setCollegeName(event.collegeName || "");
    setMainImagePreview(event.mainImage);
    // Load existing gallery images as objects
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
    formData.append("collegeName", collegeName);

    if (mainImage) {
      formData.append("mainImage", mainImage);
    }

    // Send which existing images to keep
    const keep = existingGalleryImages.map(img => typeof img === 'string' ? img : img.url);
    formData.append("keepImages", JSON.stringify(keep));

    galleryImages.forEach((imgObj) => {
      formData.append("galleryImages", imgObj.file);
    });

    const newHighlights = galleryImages.map(img => img.highlights || []);
    formData.append("highlights", JSON.stringify(newHighlights));

    try {
      let res;
      if (editingEventId) {
        res = await PutRequest(ADMIN_PUT_GALLERY_EVENT(editingEventId), formData);
      } else {
        res = await PostRequest(ADMIN_POST_GALLERY_EVENT, formData);
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
      const res = await DeleteRequest(ADMIN_DELETE_GALLERY_EVENT(id));
      if (res.success) {
        fetchEvents();
      }
    } catch (err) {
      console.error("Delete Event Error:", err);
    }
  };

  const handleUpdateImageHighlights = async (eventId, imageUrl, currentHighlights) => {
    try {
      await PatchRequest(ADMIN_UPDATE_GALLERY_EVENT_IMAGE_HIGHLIGHTS(eventId), {
        imageUrl,
        highlights: currentHighlights
      });
      fetchEvents();
      setEditingImageIdx(-1);
    } catch (err) {
      alert("Failed to update highlights");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">College Gallery</h1>
          <p className="text-slate-500">Create and manage event-based gallery posts</p>
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

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">College Name</label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. ABC Engineering College"
                  className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 block">Logo image</label>
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
                  {existingGalleryImages.map((img, idx) => {
                    const url = typeof img === 'string' ? img : img.url;
                    const highlights = img.highlights || [];
                    return (
                      <div key={`existing-${idx}`} className="flex flex-col gap-1">
                        <div className="aspect-square relative rounded-lg overflow-hidden group border-2 border-brand-200 bg-white">
                          <img src={url} className="w-full h-full object-cover" alt="" />
                          <div className="absolute top-1 left-1 bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">Saved</div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button 
                              onClick={() => {
                                setIsEditingExisting(true);
                                setEditingImageIdx(idx);
                                setHighlightInput("");
                              }}
                              className="p-1.5 bg-white text-brand-600 rounded-lg hover:bg-brand-50"
                            >
                              <Plus size={14} />
                            </button>
                            <button
                              onClick={() => setExistingGalleryImages(prev => prev.filter((_, i) => i !== idx))}
                              className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Highlights Display */}
                        <div className="min-h-[20px] flex flex-wrap gap-1 px-1">
                          {editingImageIdx === idx && isEditingExisting ? (
                            <div className="flex gap-1 w-full">
                              <input 
                                autoFocus
                                className="flex-1 text-[8px] px-1 py-0.5 border rounded"
                                value={highlightInput}
                                onChange={(e) => setHighlightInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const newH = [...highlights, highlightInput.trim()];
                                    handleUpdateImageHighlights(editingEventId, url, newH);
                                    setHighlightInput("");
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <>
                              {highlights.map((h, i) => (
                                <span key={i} className="text-[8px] bg-brand-50 text-brand-700 px-1 rounded flex items-center gap-0.5">
                                  {h}
                                  <X size={6} className="cursor-pointer" onClick={() => {
                                    const newH = highlights.filter((_, hIdx) => hIdx !== i);
                                    handleUpdateImageHighlights(editingEventId, url, newH);
                                  }}/>
                                </span>
                              ))}
                              <button onClick={() => { setIsEditingExisting(true); setEditingImageIdx(idx); }} className="text-[8px] text-brand-600 font-bold">+ Add</button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* New images to upload */}
                  {galleryImages.map((imgObj, idx) => (
                    <div key={`new-${idx}`} className="flex flex-col gap-1">
                      <div className="aspect-square relative rounded-lg overflow-hidden group border-2 border-dashed border-slate-300 bg-white">
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
                      <input 
                        type="text"
                        placeholder="Highlights (comma separated)"
                        className="w-full text-[8px] px-1 py-0.5 border rounded"
                        value={imgObj.highlights?.join(", ") || ""}
                        onChange={(e) => {
                          const updated = [...galleryImages];
                          updated[idx].highlights = e.target.value.split(",").map(h => h.trim()).filter(h => h);
                          setGalleryImages(updated);
                        }}
                      />
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
                          preview: URL.createObjectURL(file),
                          highlights: []
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

      {/* Events Grid (Modern Small Size Cards) */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => {
            const categoryName = event.categoryId?.albumName || 
                               categories.find(c => (c.id === event.categoryId || c._id === event.categoryId))?.albumName || 
                               "Unknown Album";
            
            return (
              <div 
                key={event.id} 
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Card Thumbnail */}
                <div className="aspect-[16/9] relative bg-slate-100 overflow-hidden">
                  <img 
                    src={event.mainImage} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-brand-600 rounded-lg text-xs font-bold shadow-sm">
                      <Layers size={10} />
                      {categoryName}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">ID: {event.id.substring(0, 8)}</p>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(event.eventDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    {event.collegeName && (
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium italic">
                        <Clock size={14} className="text-slate-300" />
                        {event.collegeName}
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button 
                      onClick={() => handleEdit(event)}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-all border border-slate-100"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
