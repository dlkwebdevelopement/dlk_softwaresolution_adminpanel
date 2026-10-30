import React, { useEffect, useState, useMemo } from "react";
import {
  GraduationCap,
  Plus,
  PlusCircle,
  Search,
  FileText,
  Upload,
  FileUp,
  ExternalLink,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  Filter,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  ADMIN_GET_CATEGORIES,
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

const DEFAULT_DOMAIN_OPTIONS = [
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
  const [internshipCategories, setInternshipCategories] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Form & View State
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [durationValue, setDurationValue] = useState("15");
  const [durationUnit, setDurationUnit] = useState("Days");

  const parseDuration = (raw) => {
    if (!raw) return { value: "15", unit: "Days" };
    const str = String(raw).trim();
    const match = str.match(/^(\d+)\s*(month|months|day|days)?/i);
    if (match) {
      const val = match[1];
      const unitRaw = (match[2] || "").toLowerCase();
      const unit = unitRaw.startsWith("month") ? "Months" : "Days";
      return { value: val, unit };
    }
    return { value: str.replace(/\D/g, "") || "15", unit: "Days" };
  };
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

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // Fetch internship categories from Category Management Terminal (scope === "internship")
  const fetchInternshipCats = async () => {
    try {
      const res = await GetRequest(`${ADMIN_GET_CATEGORIES}?scope=internship`);
      if (Array.isArray(res)) {
        setInternshipCategories(res);
      }
    } catch (err) {
      console.error("Failed to load internship categories:", err);
    }
  };

  // Fetch all internships
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
    fetchInternshipCats();
    fetchInternships();
  }, []);

  const domainOptions = useMemo(() => {
    const fromTerminal = internshipCategories.map((c) => c.categoryName);
    return Array.from(new Set([...fromTerminal, ...DEFAULT_DOMAIN_OPTIONS]));
  }, [internshipCategories]);

  const resetForm = () => {
    setTitle("");
    setCategory(domainOptions[0] || "Web Development");
    setDurationValue("15");
    setDurationUnit("Days");
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

  const handleEdit = (item) => {
    setCurrentId(item._id || item.id);
    setIsEditing(true);
    setTitle(item.title || "");
    setCategory(item.category || domainOptions[0] || "Web Development");
    const { value: parsedVal, unit: parsedUnit } = parseDuration(item.duration);
    setDurationValue(parsedVal);
    setDurationUnit(parsedUnit);
    setMode(item.mode || "Online / Offline Classroom");
    setSkillsText(Array.isArray(item.skills) ? item.skills.join(", ") : "");
    setDescription(item.description || "");
    setIsActive(item.isActive !== undefined ? item.isActive : true);
    setOrderIndex(item.order_index || 0);
    setCurrentSyllabusUrl(item.syllabus_pdf_url || item.syllabus_pdf || "");
    setCurrentImageUrl(item.image_url || item.image || "");
    setSyllabusFile(null);
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !category.trim()) {
      showToast("Please provide Title and Domain / Category", "error");
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category.trim());
      const finalDuration = durationValue.trim()
        ? `${durationValue.trim()} ${durationUnit}`
        : `15 ${durationUnit}`;
      formData.append("duration", finalDuration);
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
        showToast("Internship track updated successfully");
      } else {
        await PostRequest(ADMIN_POST_INTERNSHIP, formData);
        showToast("Internship track created successfully");
      }

      setShowForm(false);
      resetForm();
      fetchInternships();
    } catch (err) {
      console.error("Save Internship error:", err);
      showToast("Failed to save internship track", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this internship program?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_INTERNSHIP(id));
      showToast("Internship program deleted successfully");
      fetchInternships();
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete internship program", "error");
    }
  };

  // Filtered internships
  const filteredList = useMemo(() => {
    return internships.filter((item) => {
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
  }, [internships, selectedCategory, search]);

  const totalFiltered = filteredList.length;
  const totalPages = Math.ceil(totalFiltered / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, page]);

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in py-2">
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

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Internship Management</h1>
          <p className="text-slate-500">Create, edit and manage your internship programs, domains and tracks.</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
              setShowForm(false);
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
            showForm
              ? "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-slate-100"
              : "bg-brand-600 text-white hover:bg-brand-700 shadow-brand-100"
          }`}
        >
          {showForm ? <X size={20} /> : <PlusCircle size={20} />}
          {showForm ? "Cancel & Close" : "Add New Internship"}
        </button>
      </div>

      {/* FORM SECTION (Matches Course Management Form Card) */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-10 overflow-hidden animate-slide-up">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
              <div className="p-2 bg-brand-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-brand-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {isEditing ? "Edit Internship Track Details" : "Create New Internship Track"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Domain / Category */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Domain / Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                  >
                    {domainOptions.map((dom) => (
                      <option key={dom} value={dom}>
                        {dom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Internship Title */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Internship Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Full Stack Web Development Internship (MERN)"
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                  />
                </div>

                {/* Learning Mode */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Learning Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                  >
                    {MODE_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration (Number Input + Days / Months Select) */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Duration *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      required
                      value={durationValue}
                      onChange={(e) => setDurationValue(e.target.value)}
                      placeholder="e.g. 15"
                      className="flex-1 rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white text-sm font-medium"
                    />
                    <select
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value)}
                      className="w-32 rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white text-sm font-bold"
                    >
                      <option value="Days">Days</option>
                      <option value="Months">Months</option>
                    </select>
                  </div>
                </div>

                {/* Skills Covered */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Skills Covered <span className="text-xs font-normal text-slate-400">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    placeholder="e.g. React.js, Node.js, Express, MongoDB, Tailwind CSS, REST APIs"
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white"
                  />
                </div>

                {/* Program Description */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Program Overview / Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a comprehensive summary of real-time project work and deliverables..."
                    className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-slate-50/50 hover:bg-white resize-none"
                  />
                </div>

                {/* Syllabus PDF Upload */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Syllabus PDF Document</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-all text-sm font-medium text-slate-700 flex-1 truncate">
                      <FileUp className="w-5 h-5 text-brand-600 shrink-0" />
                      <span className="truncate">
                        {syllabusFile ? syllabusFile.name : (currentSyllabusUrl ? "Change PDF" : "Choose Syllabus PDF")}
                      </span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setSyllabusFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {currentSyllabusUrl && (
                      <a
                        href={getImgUrl(currentSyllabusUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-all"
                        title="View Current PDF"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Thumbnail / Track Image Upload */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Track Cover Image</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-all text-sm font-medium text-slate-700 flex-1 truncate">
                      <Upload className="w-5 h-5 text-brand-600 shrink-0" />
                      <span className="truncate">
                        {imageFile ? imageFile.name : (currentImageUrl ? "Change Image" : "Choose Image")}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    {currentImageUrl && (
                      <img
                        src={getImgUrl(currentImageUrl)}
                        alt="cover"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                      />
                    )}
                  </div>
                </div>

                {/* Status Toggle & Order Index */}
                <div className="flex items-center gap-6 md:col-span-2 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-5 h-5 rounded-lg border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-slate-800">Publish as Active Program</span>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-brand-100 transition-all disabled:opacity-50"
                >
                  <Save size={20} />
                  {isEditing ? "Update Internship Data" : "Publish Internship Now"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-4 px-8 rounded-xl transition-all"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIST SECTION (Matches Course Management Table) */}
      {!showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          {/* List Header Bar */}
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/30">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Available Internships</h2>
                  <p className="text-sm text-slate-500">Manage {internships.length} internship tracks efficiently</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Title or Skills..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all hover:bg-slate-50"
                  />
                </div>

                {/* Domain / Category Filter */}
                <div className="relative w-full sm:w-56">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all hover:bg-slate-50 appearance-none"
                  >
                    <option value="All">All Domains</option>
                    {domainOptions.map((dom) => (
                      <option key={dom} value={dom}>
                        {dom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Cover</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Internship Program</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Domain</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Duration / Mode</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Skills Covered</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Syllabus PDF</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <Loader2 className="animate-spin text-brand-600 mx-auto mb-3" size={32} />
                      <p className="text-sm font-medium">Loading internship tracks...</p>
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <GraduationCap className="mx-auto mb-3 text-slate-300" size={44} />
                      <p className="text-base font-semibold text-slate-700">No internship programs found</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {search || selectedCategory !== "All"
                          ? "Try adjusting your search query or domain filter"
                          : "Click 'Add New Internship' to create your first program"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item) => {
                    const pdfUrl = item.syllabus_pdf_url || item.syllabus_pdf;
                    const coverUrl = item.image_url || item.image;
                    const skills = Array.isArray(item.skills) ? item.skills : [];

                    return (
                      <tr key={item._id || item.id} className="hover:bg-slate-50/50 transition-colors group">
                        {/* Cover Image */}
                        <td className="px-6 py-4">
                          <div className="w-20 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
                            {coverUrl ? (
                              <img
                                src={getImgUrl(coverUrl)}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-slate-300" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Title & Status */}
                        <td className="px-6 py-4">
                          <div className="max-w-[280px]">
                            <p className="text-sm font-bold text-slate-800 line-clamp-1 mb-1">{item.title}</p>
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                                item.isActive
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {item.isActive ? "Active Track" : "Draft"}
                            </span>
                          </div>
                        </td>

                        {/* Domain / Category Badge */}
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-brand-50 text-brand-700 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-brand-100">
                            {item.category || "General"}
                          </span>
                        </td>

                        {/* Duration / Mode */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-brand-600 tracking-tight">{item.duration}</span>
                            <span className="text-[11px] font-bold text-slate-400">{item.mode}</span>
                          </div>
                        </td>

                        {/* Skills Chips */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[240px]">
                            {skills.length > 0 ? (
                              skills.slice(0, 3).map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md"
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">No skills specified</span>
                            )}
                            {skills.length > 3 && (
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md">
                                +{skills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Syllabus PDF Link */}
                        <td className="px-6 py-4">
                          {pdfUrl ? (
                            <a
                              href={getImgUrl(pdfUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg border border-brand-200 transition-all shadow-xs"
                            >
                              <FileText size={14} />
                              <span>View PDF</span>
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Not Uploaded</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                              title="Edit Internship"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id || item.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Internship"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer (Matches Course Management) */}
          <div className="p-6 md:p-8 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm text-slate-500 font-medium tracking-tight order-2 sm:order-1">
              Showing{" "}
              <span className="text-slate-900 font-bold">
                {totalFiltered === 0 ? 0 : (page - 1) * itemsPerPage + 1}–
                {Math.min(page * itemsPerPage, totalFiltered)}
              </span>{" "}
              of <span className="text-slate-900 font-bold">{totalFiltered}</span> internships
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm order-1 sm:order-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                            page === p
                              ? "bg-brand-600 text-white shadow-md shadow-brand-100"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    } else if (p === page - 2 || p === page + 2) {
                      return (
                        <span key={p} className="px-1 text-slate-300">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
