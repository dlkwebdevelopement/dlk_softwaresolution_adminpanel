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
  Calendar
} from "lucide-react";

import {
  ADMIN_GET_ALL_STUDENT_PROJECTS,
  ADMIN_POST_STUDENT_PROJECTS,
  ADMIN_UPDATE_STUDENT_PROJECTS,
  ADMIN_DELETE_STUDENT_PROJECTS,
  ADMIN_GET_STUDENT_PROJECTS_SLUG,
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
  const [editId, setEditId] = useState(null);

  const [editorInstance, setEditorInstance] = useState(null);
  const [previewProject, setPreviewProject] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // 🔹 Cropping States
  const [cropImage, setCropImage] = useState(null);
  const [cropModalVisible, setCropModalVisible] = useState(false);

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
                <span className="text-slate-300">|</span>
                <span className="font-mono text-brand-600">/{project.slug}</span>
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
      // Check what ADMIN_GET_STUDENT_PROJECTS_SLUG actually contains
      console.log("ADMIN_GET_STUDENT_PROJECTS_SLUG value:", ADMIN_GET_STUDENT_PROJECTS_SLUG);

      // Construct URL properly
      let url;
      if (typeof ADMIN_GET_STUDENT_PROJECTS_SLUG === "function") {
        url = ADMIN_GET_STUDENT_PROJECTS_SLUG(slug);
      } else if (typeof ADMIN_GET_STUDENT_PROJECTS_SLUG === "string") {
        // If it's a base URL, append the slug
        if (ADMIN_GET_STUDENT_PROJECTS_SLUG.endsWith("/")) {
          url = `${ADMIN_GET_STUDENT_PROJECTS_SLUG}${slug}`;
        } else {
          url = `${ADMIN_GET_STUDENT_PROJECTS_SLUG}/${slug}`;
        }
      } else {
        // Fallback
        url = `/admin/student-projects/${slug}`; 
      }

      console.log("Fetching from URL:", url);

      const res = await GetRequest(url);
      if (res.success) {
        const projectData = res.data;
        console.log("Fetched full project data by slug:", projectData);

        setTitle(projectData.title || "");
        setShortDescription(projectData.short_description || "");
        setDescription(projectData.description || "");

        if (editorInstance) {
          editorInstance.setData(projectData.description || "");
        }

        return projectData;
      }
    } catch (err) {
      console.error("Fetch Project by Slug Error:", err);
      alert("Failed to fetch project details. Please check the endpoint URL.");
    } finally {
      setFetchingProject(false);
    }
  };

  useEffect(() => {
    fetchStudentProjects();
  }, []);

  // Reset form
  const resetForm = () => {
    setTitle("");
    setShortDescription("");
    setDescription("");
    setImage(null);
    setEditId(null);

    // Also reset file input visually
    const fileInput = document.getElementById('project-image-upload');
    if (fileInput) fileInput.value = '';

    if (editorInstance) {
      editorInstance.setData("");
    }
    
    setIsFormVisible(false);
  };

  // Submit project
  const handleSubmit = async () => {
    // 1️⃣ Basic validation
    if (
      !title.trim() ||
      !shortDescription.trim() ||
      !description.trim() ||
      (!image && !editId)
    ) {
      return alert("All fields are required");
    }

    // 2️⃣ Prepare FormData
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("short_description", shortDescription.trim());
    formData.append("description", description.trim());

    if (image) {
      // New image selected
      formData.append("image", image);
    } else if (editId) {
      // Editing but not changing image
      const existingImg = studentProjects.find((b) => b.id === editId)?.image || "";
      formData.append("existingImage", existingImg);
    }

    // 3️⃣ Debug: log formData entries
    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      let res;

      if (editId) {
        // 🔹 Update existing project
        res = await PutRequest(ADMIN_UPDATE_STUDENT_PROJECTS(editId), formData);
      } else {
        // 🔹 Create new project
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
      alert("Failed to submit project. Check console for details.");
    }
  };

  const handleEdit = async (project) => {
    console.log("Editing project (summary):", project);

    setTitle(project.title || "");
    setShortDescription(project.short_description || "");
    setImage(null);
    setEditId(project.id);

    setDescription("");
    if (editorInstance) {
      editorInstance.setData("");
    }
    
    // Also reset file input visually
    const fileInput = document.getElementById('project-image-upload');
    if (fileInput) fileInput.value = '';

    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsFormVisible(true);

    // Fetch full project details using slug
    await fetchStudentProjectBySlug(project.slug);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this project?")) return;
    try {
      const res = await DeleteRequest(ADMIN_DELETE_STUDENT_PROJECTS(id));
      if (res.success) {
        alert(res.message);
        fetchStudentProjects();
        // If we are editing the deleted project, reset the form
        if (editId === id) {
          resetForm();
        }
      }
    } catch (err) {
      console.error("Delete Project Error:", err);
    }
  };

  // Pagination logic
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = studentProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(studentProjects.length / projectsPerPage);

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Student Projects Management
          </h1>
          <p className="text-slate-500">Manage your student success stories and projects</p>
        </div>
        
        {!isFormVisible && (
          <button
            onClick={() => {
              resetForm();
              setIsFormVisible(true);
            }}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-brand-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Project
          </button>
        )}
      </div>

      {/* 🔹 Project Form */}
      {isFormVisible && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-12 animate-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              {editId ? "Update Student Project" : "Create New Project"}
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
              
              {/* Title & Short Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Project Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={fetchingProject}
                    placeholder="Enter the title of the student project"
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

              {/* Rich Text Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Full Content (Editor)</label>

                {fetchingProject && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 mb-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Loading full project content...</span>
                  </div>
                )}

                {editId && !fetchingProject && description && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Content loaded successfully and ready to edit!</span>
                  </div>
                )}

                <div className={`rounded-xl overflow-hidden border ${fetchingProject ? 'border-slate-200 opacity-60 pointer-events-none' : 'border-slate-300'} focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all`}>
                  <CKEditor
                    editor={ClassicEditor}
                    data={description}
                    onReady={(editor) => {
                      console.log("CKEditor is ready to use!");
                      setEditorInstance(editor);

                      if (editId && description) {
                        editor.setData(description);
                      }
                    }}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setDescription(data);
                    }}
                    disabled={fetchingProject}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 block">Featured Image</label>

                <div className={`p-5 rounded-xl border-2 border-dashed ${image ? 'border-brand-300 bg-brand-50/30' : 'border-slate-300 bg-slate-50'}`}>
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    
                    {/* Preview Area */}
                    <div className="w-full sm:w-64 h-40 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                      {image ? (
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : editId ? (
                        <img
                          src={studentProjects.find((b) => b.id === editId)?.image}
                          alt="Current"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400">
                          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-xs uppercase font-medium tracking-wider">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Controls Area */}
                    <div className="flex-1 space-y-3">
                      {editId && !image && (
                        <p className="text-sm text-slate-500 mb-2">
                          Current image is shown. Upload a new one below to replace it.
                        </p>
                      )}
                      
                      <div>
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
                          className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-brand-50 file:text-brand-700
                            hover:file:bg-brand-100
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-colors"
                        />
                      </div>
                      <p className="text-xs text-slate-400 pt-1">
                        Recommended aspect ratio 16:9. Max size 5MB.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100 my-2" />

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={fetchingProject}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {fetchingProject ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : editId ? (
                    <><Edit2 className="w-5 h-5" /> Update student project</>
                  ) : (
                    <><FileText className="w-5 h-5" /> Publish student project</>
                  )}
                </button>
                
                {editId && (
                  <button
                    onClick={resetForm}
                    disabled={fetchingProject}
                    className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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
          <h2 className="text-xl font-bold text-slate-900">Published Articles</h2>
          <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-brand-200">
            {studentProjects.length} Total
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
          <h3 className="text-slate-700 font-bold text-xl mb-1">No projects found</h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-6">Start by creating your first student success story.</p>
          <button
            onClick={() => setIsFormVisible(true)}
            className="text-brand-600 font-bold hover:underline"
          >
            + Create your first project
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Project Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Summary</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentProjects.map((project) => (
                  <tr 
                    key={project.id} 
                    className={`hover:bg-slate-50/80 transition-colors group ${editId === project.id ? 'bg-brand-50/30' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 bg-slate-100">
                          {project.image ? (
                            <img src={project.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-full h-full p-2 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 truncate" title={project.title}>
                            {project.title?.length > 50 ? `${project.title.substring(0, 50)}...` : project.title}
                          </h4>
                          <p className="text-xs font-mono text-slate-400">/{project.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell max-w-xs">
                      <p className="text-sm text-slate-500 line-clamp-1">{project.short_description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600 font-medium">{formatDate(project.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            fetchStudentProjectBySlug(project.slug).then(fullProject => {
                              if (fullProject) setPreviewProject(fullProject);
                            });
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(project)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100/50"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center flex-wrap items-center gap-2 p-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={18} />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-lg border text-sm font-semibold transition-all ${
                    currentPage === i + 1
                      ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-200"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
                title="Next Page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🔹 Preview Modal */}
      {previewProject && (
        <ProjectPreviewModal 
          project={previewProject} 
          onClose={() => setPreviewProject(null)} 
        />
      )}

      {/* 🔹 Cropper Modal */}
      <ProjectCropperModal 
        visible={cropModalVisible}
        image={cropImage}
        onClose={() => {
          setCropModalVisible(false);
          setCropImage(null);
        }}
        onApply={(croppedFile) => {
          setImage(croppedFile);
          setCropModalVisible(false);
          setCropImage(null);
        }}
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
      const file = new File([blob], "cropped_project_image.jpg", { type: "image/jpeg" });
      resolve(file);
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">Crop Featured Image</h3>
            <p className="text-xs text-slate-500">1300x450 aspect ratio</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white text-slate-400 hover:text-slate-600 rounded-full transition-all border border-transparent hover:border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative bg-slate-100 h-[250px] sm:h-[400px]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
          />
        </div>

        <div className="px-6 py-3 sm:px-8 sm:py-4 bg-slate-50 border-t border-slate-100 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-700 w-10">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <span className="text-xs font-mono font-bold text-brand-600 w-10 text-right">{zoom.toFixed(1)}x</span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-95 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-[2] px-4 py-2 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
