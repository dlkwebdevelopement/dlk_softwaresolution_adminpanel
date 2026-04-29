import React, { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Cropper from "react-easy-crop";
import { 
  Edit2, 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  X,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Hash,
  Copy,
  Calendar,
} from "lucide-react";

import {
  ADMIN_GET_ALL_STUDENT_PROJECTS,
  ADMIN_POST_STUDENT_PROJECTS,
  ADMIN_UPDATE_STUDENT_PROJECTS,
  ADMIN_DELETE_STUDENT_PROJECTS,
  ADMIN_GET_STUDENT_PROJECTS_SLUG,
  ADMIN_GENERATE_PROJECT_CODE,
  ADMIN_GET_PROJECT_CODES,
  ADMIN_DELETE_PROJECT_CODE,
} from "../../apis/endpoints";

import {
  GetRequest,
  PostRequest,
  PutRequest,
  DeleteRequest,
} from "../../apis/api";

export default function StudentProjects() {
  const [studentProjects, setStudentProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProject, setFetchingProject] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 8; // Adjust threshold based on tall list layouts

  // Form states
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [studentProfilePic, setStudentProfilePic] = useState(null);
  const [authorType, setAuthorType] = useState("Admin");
  const [editId, setEditId] = useState(null);

  const [editorInstance, setEditorInstance] = useState(null);
  const [previewProject, setPreviewProject] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("projects"); // "projects", "studentProjects", or "codes"
  const [projectCodes, setProjectCodes] = useState([]);
  const [generatingCode, setGeneratingCode] = useState(false);

  // Access Codes logic (Reusing blog codes for now as per backend availability)
  const fetchProjectCodes = async () => {
    try {
      const res = await GetRequest(ADMIN_GET_PROJECT_CODES);
      if (res.success) setProjectCodes(res.data);
    } catch (err) {
      console.error("Fetch Codes Error:", err);
    }
  };

  const generateCode = async () => {
    setGeneratingCode(true);
    try {
      const res = await PostRequest(ADMIN_GENERATE_PROJECT_CODE, {});
      if (res.success) {
        fetchProjectCodes();
        alert("New 4-digit code generated: " + res.data.code);
      }
    } catch (err) {
      console.error("Generate Code Error:", err);
    } finally {
      setGeneratingCode(false);
    }
  };

  const deleteCode = async (id) => {
    if (!window.confirm("Delete this code?")) return;
    try {
      const res = await DeleteRequest(ADMIN_DELETE_PROJECT_CODE(id));
      if (res.success) fetchProjectCodes();
    } catch (err) {
      console.error("Delete Code Error:", err);
    }
  };

  // 🔹 Cropping States
  const [cropImage, setCropImage] = useState(null);
  const [cropModalVisible, setCropModalVisible] = useState(false);

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Project Preview Modal Component
  const ProjectPreviewModal = ({ project, onClose }) => {
    if (!project) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 line-clamp-1">Project Preview</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
            <div className="max-w-3xl mx-auto">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full">
                  <Calendar className="w-4 h-4" />
                  {formatDate(project.createdAt)}
                </span>
                <span className="font-mono text-brand-600">/{project.slug}</span>
                {project.authorType === "Student" && (
                  <>
                    <span className="text-slate-300">|</span>
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                      <img src={project.studentProfilePic} className="w-5 h-5 rounded-full object-cover" alt="" />
                      <span className="font-bold">{project.studentName}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                {project.title}
              </h1>

              {/* Featured Image */}
              {project.image && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden mb-8 border border-slate-200 shadow-sm">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Excerpt */}
              <div className="p-4 bg-slate-50 border-l-4 border-brand-500 rounded-r-xl mb-10 italic text-slate-700 text-lg leading-relaxed">
                {project.short_description}
              </div>

              {/* Content */}
              <div 
                className="prose prose-slate max-w-none 
                prose-headings:text-slate-900 prose-headings:font-bold
                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg
                prose-img:rounded-xl prose-img:shadow-md
                prose-a:text-brand-600 prose-a:font-semibold hover:prose-a:text-brand-700"
                dangerouslySetInnerHTML={{ __html: project.description }} 
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all active:scale-95"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  };


  // Fetch projects list
  const fetchStudentProjects = async () => {
    setLoading(true);
    try {
      const res = await GetRequest(`${ADMIN_GET_ALL_STUDENT_PROJECTS}?limit=1000`);
      if (res.success) {
        console.log("API Response:", res.data);
        const projectArray = res.data.data?.data || res.data.data || [];
        setStudentProjects(Array.isArray(projectArray) ? projectArray : []);
      }
    } catch (err) {
      console.error("Fetch Projects Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single project by slug
  const fetchStudentProjectBySlug = async (slug) => {
    setFetchingProject(true);
    try {
      let url;
      if (typeof ADMIN_GET_STUDENT_PROJECTS_SLUG === "function") {
        url = ADMIN_GET_STUDENT_PROJECTS_SLUG(slug);
      } else if (typeof ADMIN_GET_STUDENT_PROJECTS_SLUG === "string") {
        if (ADMIN_GET_STUDENT_PROJECTS_SLUG.endsWith("/")) {
          url = `${ADMIN_GET_STUDENT_PROJECTS_SLUG}${slug}`;
        } else {
          url = `${ADMIN_GET_STUDENT_PROJECTS_SLUG}/${slug}`;
        }
      } else {
        url = `/admin/student-projects/${slug}`; 
      }

      const res = await GetRequest(url);
      if (res.success) {
        const projectData = res.data;
        setTitle(projectData.title || "");
        setShortDescription(projectData.short_description || "");
        setDescription(projectData.description || "");
        setStudentName(projectData.studentName || "");
        setAuthorType(projectData.authorType || "Admin");

        if (editorInstance) {
          editorInstance.setData(projectData.description || "");
        }

        return projectData;
      }
    } catch (err) {
      console.error("Fetch Project by Slug Error:", err);
      alert("Failed to fetch project details.");
    } finally {
      setFetchingProject(false);
    }
  };

  useEffect(() => {
    fetchStudentProjects();
    fetchProjectCodes();
  }, []);

  // Reset form
  const resetForm = () => {
    setTitle("");
    setShortDescription("");
    setDescription("");
    setEditId(null);
    setStudentName("");
    setStudentProfilePic(null);
    setAuthorType("Admin");

    const fileInput = document.getElementById('project-image-upload');
    if (fileInput) fileInput.value = '';
    const studentPicInput = document.getElementById('student-pic-upload');
    if (studentPicInput) studentPicInput.value = '';

    if (editorInstance) {
      editorInstance.setData("");
    }
    
    setIsFormVisible(false);
  };

  // Submit project
  const handleSubmit = async () => {
    if (
      !title.trim() ||
      !shortDescription.trim() ||
      !description.trim() ||
      (!image && !editId)
    ) {
      return alert("All fields are required");
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("short_description", shortDescription.trim());
    formData.append("description", description.trim());

    if (image) {
      formData.append("image", image);
    } else if (editId) {
      const existingImg = studentProjects.find((b) => b.id === editId)?.image || "";
      formData.append("existingImage", existingImg);
    }

    if (studentName) formData.append("studentName", studentName.trim());
    if (studentProfilePic) {
      formData.append("studentProfilePic", studentProfilePic);
    } else if (editId) {
      const existingPic = studentProjects.find((b) => b.id === editId)?.studentProfilePic || "";
      formData.append("existingStudentProfilePic", existingPic);
    }

    formData.append("authorType", authorType);

    try {
      let res;
      if (editId) {
        res = await PutRequest(ADMIN_UPDATE_STUDENT_PROJECTS(editId), formData);
      } else {
        res = await PostRequest(ADMIN_POST_STUDENT_PROJECTS, formData);
      }

      if (res.success) {
        alert(res.message);
        resetForm();
        fetchStudentProjects();
      } else {
        alert(res.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Submit Project Error:", err);
      alert("Failed to submit project.");
    }
  };

  const handleEdit = async (project) => {
    setTitle(project.title || "");
    setShortDescription(project.short_description || "");
    setStudentName(project.studentName || "");
    setAuthorType(project.authorType || "Admin");
    setImage(null);
    setStudentProfilePic(null);
    setEditId(project.id);

    setDescription("");
    if (editorInstance) {
      editorInstance.setData("");
    }
    
    const fileInput = document.getElementById('project-image-upload');
    if (fileInput) fileInput.value = '';

    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsFormVisible(true);

    await fetchStudentProjectBySlug(project.slug);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this project?")) return;
    try {
      const res = await DeleteRequest(ADMIN_DELETE_STUDENT_PROJECTS(id));
      if (res.success) {
        alert(res.message);
        fetchStudentProjects();
        if (editId === id) resetForm();
      }
    } catch (err) {
      console.error("Delete Project Error:", err);
    }
  };

  const toggleApproval = async (project) => {
    try {
      const res = await PutRequest(ADMIN_UPDATE_STUDENT_PROJECTS(project.id), { isApproved: !project.isApproved });
      if (res.success) {
        fetchStudentProjects();
      }
    } catch (err) {
      console.error("Toggle Approval Error:", err);
    }
  };

  // Pagination and Filtering logic
  const filteredProjects = studentProjects.filter(p => {
    if (activeTab === "projects") return p.authorType === "Admin" || !p.authorType;
    if (activeTab === "studentProjects") return p.authorType === "Student";
    return true;
  });

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in py-2">
      <div className="flex flex-col items-center text-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
            Student Projects Management
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">Manage student success stories and administrative projects from one centralized editor.</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "projects" ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Admin Projects
          </button>
          <button
            onClick={() => setActiveTab("studentProjects")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "studentProjects" ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Student Projects
          </button>
          <button
            onClick={() => setActiveTab("codes")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "codes" ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Access Codes
          </button>
        </div>
        
        {activeTab === "projects" && !isFormVisible && (
          <button
            onClick={() => {
              resetForm();
              setIsFormVisible(true);
            }}
            className="flex items-center gap-3 bg-brand-600 hover:bg-brand-700 text-white font-black py-4 px-10 rounded-[20px] transition-all shadow-xl shadow-brand-100 hover:-translate-y-1 active:scale-95"
          >
            <Plus className="w-6 h-6" />
            Add New Project
          </button>
        )}

        {activeTab === "codes" && (
          <button
            onClick={generateCode}
            disabled={generatingCode}
            className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-10 rounded-[20px] transition-all shadow-xl shadow-emerald-100 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
          >
            {generatingCode ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
            Generate New Access Code
          </button>
        )}
      </div>

      {activeTab === "projects" || activeTab === "studentProjects" ? (
        <>
      {/* 🔹 Project Form */}
      {isFormVisible && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-12 animate-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              {editId ? "Update Project" : "Create New Project"}
            </h2>
            <button 
              onClick={() => setIsFormVisible(false)}
              className="p-2 hover:bg-white text-slate-400 hover:text-slate-600 rounded-full transition-colors border border-transparent hover:border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Project Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={fetchingProject}
                    placeholder="Enter the title of the project"
                    className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Slug Preview</label>
                  <div className="w-full rounded-lg bg-slate-50 border-slate-200 border px-4 py-2.5 text-slate-400 font-mono text-sm flex items-center gap-2 overflow-hidden">
                    <span className="opacity-50">/</span>
                    <span className="truncate">{title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') || 'your-project-slug'}</span>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Short Description (Excerpt)</label>
                  <textarea
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    disabled={fetchingProject}
                    rows={2}
                    placeholder="A brief summary that appears on the project listing page"
                    className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:text-slate-500 resize-y"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Full Content (Editor)</label>

                {fetchingProject && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 mb-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Loading full content...</span>
                  </div>
                )}

                <div className={`rounded-xl overflow-hidden border ${fetchingProject ? 'border-slate-200 opacity-60 pointer-events-none' : 'border-slate-300'} focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all`}>
                  <CKEditor
                    editor={ClassicEditor}
                    data={description}
                    onReady={(editor) => {
                      setEditorInstance(editor);
                      if (editId && description) editor.setData(description);
                    }}
                    onChange={(event, editor) => {
                      setDescription(editor.getData());
                    }}
                    disabled={fetchingProject}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 block">Featured Image</label>

                <div className={`p-5 rounded-xl border-2 border-dashed ${image ? 'border-brand-300 bg-brand-50/30' : 'border-slate-300 bg-slate-50'}`}>
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="w-full sm:w-64 h-40 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                      {image ? (
                        <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                      ) : editId ? (
                        <img src={studentProjects.find((b) => b.id === editId)?.image} alt="Current" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400">
                          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-xs uppercase font-medium tracking-wider">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        id="project-image-upload"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.addEventListener("load", () => {
                              setCropImage(reader.result);
                              setCropModalVisible(true);
                            });
                            reader.readAsDataURL(file);
                          }
                        }}
                        disabled={fetchingProject}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 disabled:opacity-50 transition-colors"
                      />
                      <p className="text-xs text-slate-400 pt-1">Recommended aspect ratio 16:9. Max size 5MB.</p>
                    </div>
                  </div>
                </div>
              </div>

              {authorType === "Student" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Student Author Name</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter student's full name"
                      className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 block">Student Profile Picture</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                        {studentProfilePic ? (
                          <img src={URL.createObjectURL(studentProfilePic)} alt="Student" className="w-full h-full object-cover" />
                        ) : editId ? (
                          <img src={studentProjects.find(b => b.id === editId)?.studentProfilePic} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        id="student-pic-upload"
                        onChange={(e) => setStudentProfilePic(e.target.files[0])}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              <hr className="border-slate-100 my-2" />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={fetchingProject}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {fetchingProject ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : editId ? (
                    <><Edit2 className="w-5 h-5" /> Update Project</>
                  ) : (
                    <><FileText className="w-5 h-5" /> Publish Project</>
                  )}
                </button>
                
                {editId && (
                  <button onClick={resetForm} disabled={fetchingProject} className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors">
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900">Published Projects</h2>
          <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-brand-200">
            {filteredProjects.length} {activeTab === "studentProjects" ? "Student" : "Admin"} Projects
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-20 bg-white rounded-2xl border border-slate-200 border-dashed">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        </div>
      ) : studentProjects.length === 0 ? (
        <div className="bg-slate-50 border-2 border-slate-200 border-dashed rounded-2xl p-20 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-white rounded-full shadow-sm mb-4">
            <FileText className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-black text-2xl mb-2">No projects found</h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">Start by creating your first student success story.</p>
          <button
            onClick={() => setIsFormVisible(true)}
            className="flex items-center gap-3 bg-brand-600 hover:bg-brand-700 text-white font-black py-4 px-10 rounded-[20px] transition-all shadow-xl shadow-brand-100 hover:-translate-y-1 active:scale-95"
          >
            <Plus className="w-6 h-6" />
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Project Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Summary</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentProjects.map((project) => (
                  <tr key={project.id} className={`hover:bg-slate-50/80 transition-colors group ${editId === project.id ? 'bg-brand-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 bg-slate-100">
                          {project.image ? <img src={project.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-2 text-slate-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 truncate" title={project.title}>{project.title}</h4>
                          <p className="text-xs font-mono text-slate-400">/{project.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.authorType === "Student" ? (
                        <div className="flex items-center gap-3">
                          <img 
                            src={project.studentProfilePic} 
                            className="w-10 h-10 rounded-full object-cover border border-blue-200" 
                            alt="" 
                          />
                          <div className="flex flex-col">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 w-fit">STUDENT</span>
                            <span className="text-xs font-bold text-slate-700 mt-0.5">{project.studentName}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 w-fit">ADMIN</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell max-w-xs">
                      <p className="text-sm text-slate-500 line-clamp-1">{project.short_description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600 font-medium">{formatDate(project.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {project.authorType === "Student" && (
                          <button
                            onClick={() => toggleApproval(project)}
                            className={`p-2 rounded-lg transition-colors ${project.isApproved ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'}`}
                            title={project.isApproved ? "Unapprove" : "Approve"}
                          >
                            <CheckCircle2 className={`w-4 h-4 ${!project.isApproved && 'opacity-40'}`} />
                          </button>
                        )}
                        <button
                          onClick={() => fetchStudentProjectBySlug(project.slug).then(p => p && setPreviewProject(p))}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(project)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100/50" title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(project.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center flex-wrap items-center gap-2 p-6 border-t border-slate-100">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"><ChevronLeft size={18} /></button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-9 h-9 rounded-lg border text-sm font-semibold ${currentPage === i + 1 ? "bg-brand-600 text-white" : "bg-white text-slate-600"}`}>{i + 1}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"><ChevronRight size={18} /></button>
            </div>
          )}
        </div>
      )}
      </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Hash className="w-5 h-5 text-emerald-600" />
              Available Access Codes
            </h2>
            <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded-md">
              {projectCodes.length} Codes Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Access Code</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Created Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectCodes.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 text-emerald-700 font-mono font-bold px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-2">
                          {item.code}
                          <button onClick={() => { navigator.clipboard.writeText(item.code); alert("Code copied!"); }} className="p-1 hover:bg-emerald-100 rounded transition-colors opacity-0 group-hover:opacity-100"><Copy className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.isUsed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">Used</span>
                      ) : (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60) > 24 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Expired</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Available</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 opacity-40" />
                        {formatDate(item.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteCode(item._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {projectCodes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-medium italic">
                      No access codes generated yet. Generate one to allow students to post projects.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {previewProject && <ProjectPreviewModal project={previewProject} onClose={() => setPreviewProject(null)} />}

      <ProjectCropperModal 
        visible={cropModalVisible}
        image={cropImage}
        onClose={() => { setCropModalVisible(false); setCropImage(null); }}
        onApply={(croppedFile) => { setImage(croppedFile); setCropModalVisible(false); setCropImage(null); }}
      />
    </div>
  );
}

// 🔹 Constants & Helpers
const aspect = 1300 / 450;

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], "cropped_project_image.jpg", { type: "image/jpeg" }));
    }, "image/jpeg");
  });
};

const ProjectCropperModal = ({ visible, image, onClose, onApply }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  if (!visible) return null;

  const handleApply = async () => {
    if (croppedAreaPixels) {
      const croppedFile = await getCroppedImg(image, croppedAreaPixels);
      onApply(croppedFile);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Crop Featured Image</h3>
            <p className="text-xs text-slate-500">1300x450 aspect ratio</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white text-slate-400 hover:text-slate-600 rounded-full border border-transparent hover:border-slate-200"><X className="w-5 h-5" /></button>
        </div>
        <div className="relative bg-slate-100 h-[250px] sm:h-[400px]">
          <Cropper image={image} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} />
        </div>
        <div className="px-6 py-3 sm:px-8 sm:py-4 bg-slate-50 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-700 w-10">Zoom</span>
            <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600" />
            <span className="text-xs font-mono font-bold text-brand-600 w-10 text-right">{zoom.toFixed(1)}x</span>
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 text-sm">Cancel</button>
            <button onClick={handleApply} className="flex-[2] px-4 py-2 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-200 flex items-center justify-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4" />Apply Crop</button>
          </div>
        </div>
      </div>
    </div>
  );
};
