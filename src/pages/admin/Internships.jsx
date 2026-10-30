import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  FileText,
  Upload,
  Download,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Laptop,
  Layers,
  X,
  Loader2,
  Check,
  Eye,
} from "lucide-react";
import {
  ADMIN_GET_INTERNSHIPS,
  ADMIN_POST_INTERNSHIP,
  ADMIN_UPDATE_INTERNSHIP,
  ADMIN_DELETE_INTERNSHIP,
} from "../../apis/endpoints";
import {
  GetRequest,
  PostRequest,
  PutRequest,
  DeleteRequest,
  getImgUrl,
} from "../../apis/api";

const DOMAIN_OPTIONS = [
  "Web Development",
  "AI & Machine Learning",
  "Data Analytics",
  "Cloud & DevOps",
  "Cyber Security",
  "Mobile App Development",
  "Embedded & IoT",
  "Software Testing",
];

const DURATION_OPTIONS = [
  "1 Month",
  "2 Months",
  "3 Months",
  "6 Months",
];

const MODE_OPTIONS = [
  "Online / Offline Classroom",
  "Online Only",
  "Classroom Offline Only",
  "Hybrid",
];

export default function Internships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [duration, setDuration] = useState("3 Months");
  const [mode, setMode] = useState("Online / Offline Classroom");
  const [skillsText, setSkillsText] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [orderIndex, setOrderIndex] = useState(0);

  // Files
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [currentSyllabusUrl, setCurrentSyllabusUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await GetRequest(ADMIN_GET_INTERNSHIPS);
      if (res && res.data) {
        setInternships(res.data);
      } else if (Array.isArray(res)) {
        setInternships(res);
      }
    } catch (err) {
      console.error("Failed to fetch internships:", err);
      showToast("Failed to load internships", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const resetForm = () => {
    setTitle("");
    setCategory("Web Development");
    setDuration("3 Months");
    setMode("Online / Offline Classroom");
    setSkillsText("");
    setDescription("");
    setIsActive(true);
    setOrderIndex(0);
    setSyllabusFile(null);
    setCurrentSyllabusUrl("");
    setImageFile(null);
    setCurrentImageUrl("");
    setIsEditing(false);
    setCurrentId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setCurrentId(item._id || item.id);
    setIsEditing(true);
    setTitle(item.title || "");
    setCategory(item.category || "Web Development");
    setDuration(item.duration || "3 Months");
    setMode(item.mode || "Online / Offline Classroom");
    setSkillsText(Array.isArray(item.skills) ? item.skills.join(", ") : "");
    setDescription(item.description || "");
    setIsActive(item.isActive !== undefined ? item.isActive : true);
    setOrderIndex(item.order_index || 0);
    setCurrentSyllabusUrl(item.syllabus_pdf_url || item.syllabus_pdf || "");
    setCurrentImageUrl(item.image_url || item.image || "");
    setSyllabusFile(null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !category.trim()) {
      showToast("Please provide Title and Category", "error");
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category.trim());
      formData.append("duration", duration);
      formData.append("mode", mode);
      formData.append("description", description.trim());
      formData.append("isActive", isActive);
      formData.append("order_index", orderIndex);

      const parsedSkills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      formData.append("skills", JSON.stringify(parsedSkills));

      if (syllabusFile) {
        formData.append("syllabus_pdf", syllabusFile);
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (isEditing) {
        await PutRequest(ADMIN_UPDATE_INTERNSHIP(currentId), formData);
        showToast("Internship course updated successfully");
      } else {
        await PostRequest(ADMIN_POST_INTERNSHIP, formData);
        showToast("Internship course added successfully");
      }

      setIsModalOpen(false);
      resetForm();
      fetchInternships();
    } catch (err) {
      console.error("Save Internship error:", err);
      showToast("Failed to save internship course", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      const id = itemToDelete._id || itemToDelete.id;
      await DeleteRequest(ADMIN_DELETE_INTERNSHIP(id));
      showToast("Internship course deleted successfully");
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetchInternships();
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete internship course", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered internships
  const filteredList = internships.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !search.trim() ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(item.skills) &&
        item.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const totalCount = internships.length;
  const activeCount = internships.filter((i) => i.isActive).length;
  const syllabusCount = internships.filter(
    (i) => i.syllabus_pdf || i.syllabus_pdf_url
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white font-medium transition-all duration-300 animate-slide-in ${
            toast.type === "error" ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          {toast.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <GraduationCap size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Internship Management
            </h1>
            <p className="text-sm text-slate-500">
              Manage student internship tracks, upload syllabus PDFs, and review program details
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} />
          <span>Add Internship Course</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Internship Programs</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Active Programs</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Syllabus PDFs Attached</p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">{syllabusCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText size={22} />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by title, domain, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {["All", ...DOMAIN_OPTIONS].map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedCategory(dom)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === dom
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Internships List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
            <p className="text-sm font-medium">Loading internship courses...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <GraduationCap className="mx-auto mb-3 text-slate-300" size={44} />
            <p className="text-base font-semibold text-slate-700">No internship courses found</p>
            <p className="text-xs text-slate-500 mt-1">
              {search || selectedCategory !== "All"
                ? "Try adjusting your search query or filters"
                : "Click 'Add Internship Course' to create your first program"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Program & Domain</th>
                  <th className="py-4 px-4">Duration / Mode</th>
                  <th className="py-4 px-4">Skills Covered</th>
                  <th className="py-4 px-4">Syllabus PDF</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredList.map((item) => {
                  const pdfUrl = item.syllabus_pdf_url || item.syllabus_pdf;
                  return (
                    <tr key={item._id || item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Title & Domain */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {item.image_url || item.image ? (
                            <img
                              src={getImgUrl(item.image_url || item.image)}
                              alt={item.title}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                              <Laptop size={22} />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-800 line-clamp-1">{item.title}</p>
                            <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Duration / Mode */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 text-xs text-slate-600">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock size={13} className="text-slate-400" />
                            {item.duration || "3 Months"}
                          </span>
                          <span className="text-slate-500 line-clamp-1">{item.mode || "Online/Offline"}</span>
                        </div>
                      </td>

                      {/* Skills */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(item.skills) && item.skills.length > 0 ? (
                            item.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">General</span>
                          )}
                          {item.skills?.length > 3 && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                              +{item.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Syllabus PDF */}
                      <td className="py-4 px-4">
                        {pdfUrl ? (
                          <a
                            href={getImgUrl(pdfUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
                          >
                            <FileText size={14} />
                            <span>Download PDF</span>
                            <ExternalLink size={12} className="opacity-70" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md font-medium">
                            <AlertCircle size={13} />
                            No PDF attached
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {item.isActive ? "Active" : "Draft"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Edit Internship"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete(item);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Internship"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {isEditing ? "Edit Internship Course" : "Add New Internship Course"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fill in course details and attach the syllabus document
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Course Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Internship Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Web Development Internship (MERN)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Category & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Domain / Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    {DOMAIN_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    {DURATION_OPTIONS.map((dur) => (
                      <option key={dur} value={dur}>
                        {dur}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mode & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Delivery Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    {MODE_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Display Priority (Order)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Skills (Comma Separated) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Key Skills (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. React.js, Node.js, Express, MongoDB, Redux, REST APIs"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Course Overview / Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Explain what the student will learn and capstones they will build..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Syllabus PDF Upload */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                  Upload Syllabus PDF
                </label>
                <p className="text-xs text-slate-500 mb-2.5">
                  Upload the official course syllabus document (.pdf format)
                </p>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-300 hover:border-emerald-500 rounded-xl text-xs font-semibold text-emerald-700 shadow-sm transition-all hover:bg-emerald-50">
                    <Upload size={14} />
                    <span>Choose PDF</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setSyllabusFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>

                  {syllabusFile ? (
                    <span className="text-xs text-emerald-700 font-medium truncate max-w-xs flex items-center gap-1">
                      <Check size={14} /> {syllabusFile.name}
                    </span>
                  ) : currentSyllabusUrl ? (
                    <span className="text-xs text-slate-600 truncate max-w-xs flex items-center gap-1">
                      <FileText size={14} className="text-emerald-600" /> Existing PDF attached
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">No PDF file chosen</span>
                  )}
                </div>
              </div>

              {/* Thumbnail Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cover Image (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-medium text-slate-700 transition-colors">
                    <Upload size={14} />
                    <span>Choose Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {imageFile ? (
                    <span className="text-xs text-slate-600 truncate max-w-xs">{imageFile.name}</span>
                  ) : currentImageUrl ? (
                    <span className="text-xs text-slate-500 truncate max-w-xs">Existing image attached</span>
                  ) : (
                    <span className="text-xs text-slate-400">Default course image will be used</span>
                  )}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Publish to Student Portal (Active)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
                >
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>{isEditing ? "Update Internship" : "Create Internship"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center">Delete Internship Course?</h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Are you sure you want to delete <span className="font-semibold text-slate-700">"{itemToDelete.title}"</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md shadow-red-600/20 disabled:opacity-50 transition-all"
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                <span>Delete Program</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

