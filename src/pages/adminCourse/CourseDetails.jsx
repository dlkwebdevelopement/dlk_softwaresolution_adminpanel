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
  ChevronUp,
  ChevronDown,
  GripVertical,
  Save,
  X,
  FileUp,
  ExternalLink,
  Search,
  Filter,
  Eye,
  PlusCircle
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
  ADMIN_GET_SKILLS,
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
  curriculum: [{ title: "", lessons_info: "", description: "", link: "", order_index: 0 }],
  courseIncludes: [{ text: "", icon_name: "PlayCircleFilled", order_index: 0 }],
  skills: [],
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
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allSkills, setAllSkills] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

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

  const fetchSkills = async () => {
    try {
      const res = await GetRequest(ADMIN_GET_SKILLS);
      setAllSkills(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      console.error("Failed to fetch skills:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSkills();
  }, []);

  useEffect(() => {
    fetchAllCourses(page);
  }, [page]);

  // ================= FORM HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, value, subField = null) => {
    const updated = formData[field].map((item, i) => {
      if (i !== index) return item;
      
      if (field === "curriculum" || field === "courseIncludes") {
        if (subField) {
          return { ...item, [subField]: value };
        } else {
          return { ...item, title: value, text: value }; // Map default based on context
        }
      }
      return { ...item, content: value };
    });
    setFormData({ ...formData, [field]: updated });
  };

  const addArrayItem = (field) => {
    if (field === "curriculum") {
      setFormData({
        ...formData,
        curriculum: [...formData.curriculum, { title: "", lessons_info: "", description: "", link: "", order_index: 0 }],
      });
    } else if (field === "courseIncludes") {
      setFormData({
        ...formData,
        courseIncludes: [...formData.courseIncludes, { text: "", icon_name: "PlayCircleFilled", order_index: 0 }],
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

  const moveArrayItem = (field, index, direction) => {
    const updated = [...(formData[field] || [])];
    if (direction === "up" && index > 0) {
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    } else if (direction === "down" && index < updated.length - 1) {
      [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    }
    setFormData({ ...formData, [field]: updated });
  };

  const handleSkillToggle = (skillId) => {
    const currentSkills = [...(formData.skills || [])];
    if (currentSkills.includes(skillId)) {
      setFormData({ ...formData, skills: currentSkills.filter(id => id !== skillId) });
    } else {
      setFormData({ ...formData, skills: [...currentSkills, skillId] });
    }
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
        thumbnail_url: data.thumbnail || null,
        syllabus_pdf_url: data.syllabus_pdf || null,
       
        whoShouldEnroll: data.whoShouldEnroll || [{ content: "", order_index: 0 }],
        learningPoints: data.learningPoints || [{ content: "", order_index: 0 }],
        curriculum: data.curriculum ? data.curriculum.map(item => ({
          ...item,
          lessons_info: item.lessons_info || "",
          description: item.description || "",
          link: item.link || ""
        })) : [{ title: "", lessons_info: "", description: "", link: "", order_index: 0 }],
        courseIncludes: data.courseIncludes || [{ text: "", icon_name: "PlayCircleFilled", order_index: 0 }],
        skills: data.skills ? data.skills.map(s => s._id || s) : [],
      });

      setShowForm(true);
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
          key === "curriculum" ||
          key === "courseIncludes"
        ) {
          const cleanedArray = (formData[key] || [])
            .filter((item) => {
              if (key === "curriculum") return item.title && item.title.trim() !== "";
              if (key === "courseIncludes") return item.text && item.text.trim() !== "";
              return item.content && item.content.trim() !== "";
            })
            .map((item, idx) => {
              const newItem = { ...item };
              if (!newItem.id) delete newItem.id;
              newItem.order_index = idx + 1;
              return newItem;
            });

          if (cleanedArray.length === 0) {
            sendData.append(key, "[]");
          } else {
            sendData.append(key, JSON.stringify(cleanedArray));
          }
        } else if (key === "skills") {
          sendData.append(key, JSON.stringify(formData.skills || []));
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
      setLoading(false);
      setShowForm(false);
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
          key === "curriculum" ||
          key === "courseIncludes"
        ) {
          const cleanedArray = (formData[key] || [])
            .filter((item) => {
              if (key === "curriculum") return item.title && item.title.trim() !== "";
              if (key === "courseIncludes") return item.text && item.text.trim() !== "";
              return item.content && item.content.trim() !== "";
            })
            .map((item, idx) => {
              const newItem = { ...item };
              if (!newItem.id) delete newItem.id;
              newItem.order_index = idx + 1;
              return newItem;
            });

          if (cleanedArray.length === 0) {
            sendData.append(key, "[]");
          } else {
            sendData.append(key, JSON.stringify(cleanedArray));
          }
        } else if (key === "skills") {
          sendData.append(key, JSON.stringify(formData.skills || []));
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
      setShowForm(false);
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
    <div className="max-w-[1400px] mx-auto animate-fade-in py-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Course Management</h1>
          <p className="text-slate-500">Create, edit and manage your study programs and courses.</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              setFormData(initialState);
              setCourseId(null);
              setThumbnail(null);
              setSyllabusPdf(null);
              setShowForm(false);
            } else {
              setFormData(initialState);
              setCourseId(null);
              setThumbnail(null);
              setSyllabusPdf(null);
              setShowForm(true);
            }
          }}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
            showForm 
              ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-slate-100' 
              : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-100'
          }`}
        >
          {showForm ? <X size={20} /> : <PlusCircle size={20} />}
          {showForm ? "Cancel & Close" : "Add New Course"}
        </button>
      </div>

      {/* FORM SECTION */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-10 overflow-hidden animate-slide-up">
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
                    {cat.categoryName}
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

          {/* Skills Selection */}
          <div className="mt-8 space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">Course Tech Stack Skills</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              {allSkills.map((skill) => {
                const isSelected = formData.skills?.includes(skill._id);
                return (
                  <label 
                    key={skill._id} 
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm text-emerald-800' 
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => handleSkillToggle(skill._id)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                    />
                    {skill.icon && (
                      <img src={skill.icon} alt={skill.name} className="w-5 h-5 object-contain" />
                    )}
                    <span className="text-xs font-bold truncate">{skill.name}</span>
                  </label>
                );
              })}
            </div>
            {allSkills.length === 0 && (
              <p className="text-xs text-slate-400">No skills found. Manage them in the Skills section.</p>
            )}
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

            {/* Course Includes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-bold text-slate-800 uppercase tracking-wider text-xs">Course Includes</h3>
                <button
                  onClick={() => addArrayItem("courseIncludes")}
                  className="p-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-md transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {formData.courseIncludes.map((item, index) => (
                  <div key={index} className="space-y-2 p-2 border border-slate-100 rounded-lg bg-slate-50/50">
                    <div className="flex gap-2">
                      <select
                        value={item.icon_name}
                        onChange={(e) => handleArrayChange("courseIncludes", index, e.target.value, "icon_name")}
                        className="w-1/3 rounded-lg border-slate-200 border px-2 py-2 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                      >
                        <option value="PlayCircleFilled">Video</option>
                        <option value="Download">Download</option>
                        <option value="AllInclusive">Access</option>
                        <option value="PhoneIphone">Mobile</option>
                        <option value="WorkspacePremium">Certificate</option>
                        <option value="CheckCircle">Check</option>
                      </select>
                      <button 
                        onClick={() => removeArrayItem("courseIncludes", index)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      value={item.text}
                      onChange={(e) => handleArrayChange("courseIncludes", index, e.target.value, "text")}
                      placeholder="Include text... (e.g. 10 hours video)"
                      className="w-full rounded-lg border-slate-200 border px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                    />
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
                  <div 
                    key={index} 
                    className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${draggedIndex === index ? 'opacity-50 bg-slate-50 border-emerald-300' : 'border-slate-100 hover:border-slate-200 bg-white shadow-sm'}`}
                    draggable={true}
                    onDragStart={(e) => {
                      setDraggedIndex(index);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={() => {
                      if (draggedIndex === null || draggedIndex === index) return;
                      const list = [...formData.curriculum];
                      const itemToMove = list[draggedIndex];
                      list.splice(draggedIndex, 1);
                      list.splice(index, 0, itemToMove);
                      setFormData({ ...formData, curriculum: list });
                      setDraggedIndex(null);
                    }}
                    onDragEnd={() => setDraggedIndex(null)}
                  >
                    <div className="flex items-center gap-2">
                       <div className="cursor-move text-slate-400 hover:text-slate-600 p-1" title="Drag to reorder">
                         <GripVertical size={16} />
                       </div>
                       <input
                         value={item.title}
                         onChange={(e) => handleArrayChange("curriculum", index, e.target.value)}
                         placeholder="Module title..."
                         className="flex-1 rounded-lg border-slate-200 border px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                       />
                       <button 
                         type="button"
                         onClick={() => removeArrayItem("curriculum", index)}
                         className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pl-8">
                       <input
                        value={item.lessons_info}
                        onChange={(e) => handleArrayChange("curriculum", index, e.target.value, "lessons_info")}
                        placeholder="Info (e.g. 2 Lessons • 45 Min)"
                        className="w-full rounded-lg border-slate-200 border px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                      />
                      <textarea
                        value={item.description}
                        onChange={(e) => handleArrayChange("curriculum", index, e.target.value, "description")}
                        placeholder="Module description... (Use new lines for bullet points)"
                        rows={3}
                        className="w-full rounded-lg border-slate-200 border px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all resize-y"
                      />
                      <input
                        value={item.link}
                        onChange={(e) => handleArrayChange("curriculum", index, e.target.value, "link")}
                        placeholder="Resource Link (URL) e.g. https://..."
                        className="w-full rounded-lg border-slate-200 border px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                      />
                    </div>
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
      )}

      {/* COURSE LIST SECTION */}
      {!showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/30">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Available Courses</h2>
                  <p className="text-sm text-slate-500">Manage {totalCourses} courses efficiently</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all hover:bg-slate-50"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative w-full sm:w-56">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all hover:bg-slate-50 appearance-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Thumbnail</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest line-clamp-1">Course Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Price / Duration</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {courses
                  .filter(c => c.title?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .filter(c => !selectedCategory || c.category_id === selectedCategory)
                  .map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-20 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[250px]">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1 mb-1">{course.title}</p>
                        <p className="text-[11px] text-slate-400 font-medium line-clamp-1 italic">{course.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-brand-50 text-brand-700 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-brand-100">
                        {categories.find(c => c.id === course.category_id)?.categoryName || "No Category"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-brand-600 tracking-tight">₹{course.price}</span>
                        <span className="text-[11px] font-bold text-slate-400">{course.duration_months} Months</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                         <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase">{course.level || "Regular"}</span>
                         <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md uppercase">{course.mode || "Online"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditCourse(course.slug)}
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                          title="Edit Course"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Course"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 md:p-8 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm text-slate-500 font-medium tracking-tight order-2 sm:order-1">
              Showing <span className="text-slate-900 font-bold">{(page - 1) * 10 + 1}–{Math.min(page * 10, totalCourses)}</span> of <span className="text-slate-900 font-bold">{totalCourses}</span> courses
            </p>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm order-1 sm:order-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                     const p = i + 1;
                     if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                        return (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                              page === p 
                                ? 'bg-brand-600 text-white shadow-md shadow-brand-100' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {p}
                          </button>
                        );
                     } else if (p === page - 2 || p === page + 2) {
                        return <span key={p} className="px-1 text-slate-300">...</span>;
                     }
                     return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

