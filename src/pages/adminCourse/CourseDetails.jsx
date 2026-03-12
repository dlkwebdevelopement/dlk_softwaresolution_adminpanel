import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  BookOpen,
  GraduationCap,
  Upload,
  FileText,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  FileUp,
  ExternalLink
} from "lucide-react";

import {
  GetRequest,
  PostRequest,
  DeleteRequest,
  PutRequest,
} from "../../apis/config";

import {
  ADMIN_GET_COURSE_SLUG,
  ADMIN_DELETE_COURSE,
  ADMIN_UPDATE_COURSE,
  ADMIN_POST_COURSES,
  ADMIN_GET_CATEGORIES,
  ADMIN_GET_ALL_COURSES,
} from "../../apis/endpoints";

import { BASE_URL } from "../../apis/api";

const initialState = {
  category_id: "",
  title: "",
  short_description: "",
  full_description: "",
  mode: "",
  duration_months: "",
  level: "",
  price: "",
  original_price: "",
  discount_percentage: "",
  whoShouldEnroll: [{ content: "", order_index: 0 }],
  learningPoints: [{ content: "", order_index: 0 }],
  curriculum: [{ title: "", order_index: 0 }],
};

export default function CourseDetails() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [courseId, setCourseId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [courses, setCourses] = useState([]);
  const [syllabusPdf, setSyllabusPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialState);

  // ================= FETCH =================
  const fetchCategories = async () => {
    try {
      const res = await GetRequest(ADMIN_GET_CATEGORIES);
      setCategories(res || []);
    } catch (err) {
      setCategories([]);
    }
  };

  const fetchAllCourses = async (pageNumber = 1) => {
    try {
      const res = await GetRequest(
        `${ADMIN_GET_ALL_COURSES}?page=${pageNumber}`,
      );

      if (res?.success) {
        setCourses(res.data || []);
        setTotalPages(res.totalPages || 0);
        setTotalCourses(res.total || 0);
        setPage(res.page || 1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchAllCourses(page);
  }, [page]);

  // ================= FORM HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...(formData[field] || [])];
    if (field === "curriculum") {
      updated[index].title = value;
    } else {
      updated[index].content = value;
    }
    setFormData({ ...formData, [field]: updated });
  };

  const addArrayItem = (field) => {
    if (field === "curriculum") {
      setFormData({
        ...formData,
        curriculum: [...formData.curriculum, { title: "", order_index: 0 }],
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...formData[field], { content: "", order_index: 0 }],
      });
    }
  };

  const removeArrayItem = (field, index) => {
    const updated = [...(formData[field] || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, [field]: updated });
  };

  // ================= EDIT =================
  const handleEditCourse = async (slugValue) => {
    try {
      setLoading(true);
      const res = await GetRequest(ADMIN_GET_COURSE_SLUG(slugValue));
      if (!res?.success) return alert("Course not found");

      const data = res.data;
      setCourseId(data.id);

      setFormData({
        category_id: data.category_id || "",
        title: data.title || "",
        short_description: data.short_description || "",
        full_description: data.full_description || "",
        mode: data.mode || "",
        duration_months: data.duration_months || "",
        level: data.level || "",
        price: data.price || "",
        original_price: data.original_price || "",
        discount_percentage: data.discount_percentage || "",
        thumbnail_url: data.thumbnail ? `${BASE_URL}/uploads/${data.thumbnail}` : null,
        syllabus_pdf_url: data.syllabus_pdf ? `${BASE_URL}/uploads/${data.syllabus_pdf}` : null,
       
        whoShouldEnroll: data.whoShouldEnroll || [{ content: "", order_index: 0 }],
        learningPoints: data.learningPoints || [{ content: "", order_index: 0 }],
        curriculum: data.curriculum || [{ title: "", order_index: 0 }],
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      alert("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE =================
  const handleCreate = async () => {
    try {
      const sendData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (
          key === "whoShouldEnroll" ||
          key === "learningPoints" ||
          key === "curriculum"
        ) {
          const cleanedArray = (formData[key] || [])
            .filter((item) =>
              key === "curriculum"
                ? item.title && item.title.trim() !== ""
                : item.content && item.content.trim() !== "",
            )
            .map((item) => {
              const newItem = { ...item };
              if (!newItem.id) delete newItem.id;
              return newItem;
            });

          if (cleanedArray.length === 0) {
            sendData.append(key, "[]");
          } else {
            sendData.append(key, JSON.stringify(cleanedArray));
          }
        } else if (key !== "thumbnail_url" && key !== "syllabus_pdf_url") {
          sendData.append(key, formData[key] || "");
        }
      });

      if (thumbnail) sendData.append("thumbnail", thumbnail);
      if (syllabusPdf) sendData.append("syllabus_pdf", syllabusPdf);

      await PostRequest(ADMIN_POST_COURSES, sendData, true);
      await fetchAllCourses();

      alert("Course Created Successfully");
      setFormData(initialState);
      setThumbnail(null);
      setCourseId(null);
      setSyllabusPdf(null);
    } catch (error) {
      alert("Create Failed");
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (!courseId) return alert("Load course first");

    try {
      const sendData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (
          key === "whoShouldEnroll" ||
          key === "learningPoints" ||
          key === "curriculum"
        ) {
          const cleanedArray = (formData[key] || [])
            .filter((item) =>
              key === "curriculum"
                ? item.title && item.title.trim() !== ""
                : item.content && item.content.trim() !== "",
            )
            .map((item) => {
              const newItem = { ...item };
              if (!newItem.id) delete newItem.id;
              return newItem;
            });

          if (cleanedArray.length === 0) {
            sendData.append(key, "[]");
          } else {
            sendData.append(key, JSON.stringify(cleanedArray));
          }
        } else if (key !== "thumbnail_url" && key !== "syllabus_pdf_url") {
          sendData.append(key, formData[key] || "");
        }
      });

      if (thumbnail) sendData.append("thumbnail", thumbnail);
      if (syllabusPdf) sendData.append("syllabus_pdf", syllabusPdf);

      await PutRequest(ADMIN_UPDATE_COURSE(courseId), sendData, true);
      setSyllabusPdf(null);
      setThumbnail(null);
      alert("Course Updated Successfully");
      fetchAllCourses(page);
    } catch (error) {
      alert("Update Failed" + error.message);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await DeleteRequest(ADMIN_DELETE_COURSE(id));
      await fetchAllCourses();
      alert("Deleted Successfully");

      if (courseId === id) {
        setFormData(initialState);
        setCourseId(null);
        setThumbnail(null);
      }
    } catch (error) {
      alert("Delete Failed");
    }
  };

  // ================= PAGINATION HANDLERS =================
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in py-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Course Management</h1>
        <p className="text-slate-500">Create, edit and manage your study programs and courses.</p>
      </div>

      {/* FORM SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-10 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
            <div className="p-2 bg-brand-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-brand-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {courseId ? "Edit Course Details" : "Create New Course"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Course Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Course Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Full Stack Web Development"
                className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Learning Mode</label>
              <input
                type="text"
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                placeholder="e.g. Online / Offline"
                className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Duration (Months)</label>
              <input
                type="text"
                name="duration_months"
                value={formData.duration_months}
                onChange={handleChange}
                placeholder="e.g. 6"
                className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Difficulty Level</label>
              <input
                type="text"
                name="level"
                value={formData.level}
                onChange={handleChange}
                placeholder="e.g. Beginner"
                className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Current Price (₹)</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 4999"
                className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Original Price (₹)</label>
              <input
                type="text"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                placeholder="e.g. 9999"
                className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Discount Percentage (%)</label>
              <input
                type="text"
                name="discount_percentage"
                value={formData.discount_percentage}
                onChange={handleChange}
                placeholder="e.g. 50"
                className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Short Description</label>
              <textarea
                name="short_description"
                value={formData.short_description}
                onChange={handleChange}
                rows={2}
                placeholder="Briefly describe the course in 1-2 sentences..."
                className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white resize-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Full Course Description</label>
              <textarea
                name="full_description"
                value={formData.full_description}
                onChange={handleChange}
                rows={4}
                placeholder="Detailed information about the course content, outcomes, etc."
                className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white resize-y"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Thumbnail Upload */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 block">Course Thumbnail</label>
              <div className={`p-6 rounded-2xl border-2 border-dashed transition-all ${thumbnail || formData.thumbnail_url ? 'border-brand-300 bg-brand-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/50'}`}>
                <div className="flex flex-col items-center">
                  {(thumbnail || formData.thumbnail_url) ? (
                    <div className="relative mb-4 group">
                      <img
                        src={thumbnail ? URL.createObjectURL(thumbnail) : formData.thumbnail_url}
                        alt="Thumbnail"
                        className="w-32 h-32 object-cover rounded-xl shadow-md border-2 border-white"
                      />
                      <button 
                        onClick={() => { setThumbnail(null); setFormData({...formData, thumbnail_url: null})}}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 border border-slate-100">
                      <Upload className="w-8 h-8 text-brand-500" />
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files[0])}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label 
                    htmlFor="thumbnail-upload" 
                    className="cursor-pointer inline-flex items-center gap-2 px-5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:text-brand-600 hover:border-brand-300 transition-all shadow-sm"
                  >
                    <Upload size={16} />
                    {thumbnail || formData.thumbnail_url ? 'Change Image' : 'Browse Image'}
                  </label>
                </div>
              </div>
            </div>

            {/* Syllabus Upload */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 block">Syllabus PDF</label>
              <div className={`p-6 rounded-2xl border-2 border-dashed transition-all ${syllabusPdf || formData.syllabus_pdf_url ? 'border-brand-300 bg-brand-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/50'}`}>
                <div className="flex flex-col items-center justify-center h-full">
                  {(syllabusPdf || formData.syllabus_pdf_url) ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 border border-emerald-100">
                        <FileText className="w-8 h-8 text-emerald-500" />
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-4 max-w-[200px] truncate">
                        {syllabusPdf ? syllabusPdf.name : 'Current Syllabus PDF'}
                      </p>
                      <div className="flex gap-2">
                        {formData.syllabus_pdf_url && !syllabusPdf && (
                          <a 
                            href={formData.syllabus_pdf_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                            title="View current PDF"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button 
                          onClick={() => { setSyllabusPdf(null); setFormData({...formData, syllabus_pdf_url: null})}}
                          className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                          title="Remove PDF"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 border border-slate-100">
                      <FileUp className="w-8 h-8 text-brand-500" />
                    </div>
                  )}

                  {!syllabusPdf && !formData.syllabus_pdf_url && (
                    <>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setSyllabusPdf(e.target.files[0])}
                        className="hidden"
                        id="syllabus-upload"
                      />
                      <label 
                        htmlFor="syllabus-upload" 
                        className="cursor-pointer inline-flex items-center gap-2 px-5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:text-brand-600 hover:border-brand-300 transition-all shadow-sm"
                      >
                        <Upload size={16} />
                        Browse PDF
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC LISTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 pb-6">
            {/* Who Should Enroll */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-bold text-slate-800 uppercase tracking-wider text-xs">Who Should Enroll</h3>
                <button
                  onClick={() => addArrayItem("whoShouldEnroll")}
                  className="p-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-md transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {formData.whoShouldEnroll.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      fullWidth
                      value={item.content}
                      onChange={(e) => handleArrayChange("whoShouldEnroll", index, e.target.value)}
                      placeholder="Enter target audience..."
                      className="flex-1 rounded-lg border-slate-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                    />
                    <button 
                      onClick={() => removeArrayItem("whoShouldEnroll", index)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Points */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-bold text-slate-800 uppercase tracking-wider text-xs">Learning Points</h3>
                <button
                  onClick={() => addArrayItem("learningPoints")}
                  className="p-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-md transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {formData.learningPoints.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      value={item.content}
                      onChange={(e) => handleArrayChange("learningPoints", index, e.target.value)}
                      placeholder="What will they learn?"
                      className="flex-1 rounded-lg border-slate-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                    />
                    <button 
                      onClick={() => removeArrayItem("learningPoints", index)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-bold text-slate-800 uppercase tracking-wider text-xs">Curriculum Modules</h3>
                <button
                  onClick={() => addArrayItem("curriculum")}
                  className="p-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-md transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {formData.curriculum.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      value={item.title}
                      onChange={(e) => handleArrayChange("curriculum", index, e.target.value)}
                      placeholder="Module title..."
                      className="flex-1 rounded-lg border-slate-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                    />
                    <button 
                      onClick={() => removeArrayItem("curriculum", index)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100">
            <button
              onClick={courseId ? handleUpdate : handleCreate}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-brand-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Save size={20} />
              {courseId ? "Update Course Data" : "Publish Course Now"}
            </button>

            {courseId && (
              <button
                onClick={() => {
                  setFormData(initialState);
                  setCourseId(null);
                  setThumbnail(null);
                  setSyllabusPdf(null);
                }}
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-4 px-8 rounded-xl transition-all"
              >
                <X size={20} />
                Discard Changes
              </button>
            )}
          </div>
        </div>
      </div>

      {/* COURSE LIST SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <GraduationCap className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Available Courses</h2>
                <p className="text-sm text-slate-500">Total of {totalCourses} courses across all categories</p>
              </div>
            </div>
            
            <div className="inline-flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
              <span className="px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">Active Database</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`group relative bg-white border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl ${courseId === course.id ? 'ring-2 ring-brand-500 border-transparent shadow-lg shadow-brand-100' : 'border-slate-200 hover:border-brand-200'}`}
              >
                {/* Course Image */}
                <div className="aspect-[16/10] w-full bg-slate-100 overflow-hidden relative">
                  {course.thumbnail ? (
                    <img
                      src={`${BASE_URL}/uploads/${course.thumbnail}`}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  
                  {/* Action Overlays */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleEditCourse(course.slug)}
                      className="p-3 bg-white text-slate-900 rounded-full hover:bg-brand-500 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                      title="Edit Course"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-3 bg-white text-slate-900 rounded-full hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                      title="Delete Course"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold text-slate-900 uppercase tracking-widest shadow-sm">
                      {course.level || "Regular"}
                    </span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{course.mode || "Online"}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1" title={course.title}>{course.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{course.short_description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Price</span>
                      <span className="text-xl font-black text-brand-600 tracking-tight">₹{course.price}</span>
                    </div>
                    
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Duration</span>
                      <span className="text-sm font-bold text-slate-700">{course.duration_months} Months</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-6">
            <p className="text-sm text-slate-500 font-medium tracking-tight">
              Showing <span className="text-slate-900 font-bold">{(page - 1) * 10 + 1}–{Math.min(page * 10, totalCourses)}</span> of <span className="text-slate-900 font-bold">{totalCourses}</span> courses
            </p>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-inner">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2.5 text-slate-600 hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center">
                  {[...Array(totalPages)].map((_, i) => {
                     const p = i + 1;
                     // Only show current page, first, last, and one around current
                     if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                        return (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                              page === p 
                                ? 'bg-brand-600 text-white shadow-md shadow-brand-100' 
                                : 'text-slate-600 hover:bg-white'
                            }`}
                          >
                            {p}
                          </button>
                        );
                     } else if (p === page - 2 || p === page + 2) {
                        return <span key={p} className="px-1 text-slate-400">...</span>;
                     }
                     return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2.5 text-slate-600 hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

