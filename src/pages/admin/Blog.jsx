import React, { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { 
  Edit2, 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";

import {
  ADMIN_GET_ALL_BLOGS,
  ADMIN_POST_BLOGS,
  ADMIN_UPDATE_BLOGS,
  ADMIN_DELETE_BLOGS,
  ADMIN_GET_BLOGS_SLUG,
} from "../../apis/endpoints";

import {
  GetRequest,
  PostRequest,
  PutRequest,
  DeleteRequest,
} from "../../apis/config";
import { BASE_URL } from "../../apis/api";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingBlog, setFetchingBlog] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);

  const [editorInstance, setEditorInstance] = useState(null);

  // Fetch blogs list
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await GetRequest(ADMIN_GET_ALL_BLOGS);
      if (res.success) {
        console.log("API Response:", res.data);
        setBlogs(res.data.data || res.data);
      }
    } catch (err) {
      console.error("Fetch Blogs Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single blog by slug
  const fetchBlogBySlug = async (slug) => {
    setFetchingBlog(true);
    try {
      // Check what ADMIN_GET_BLOGS_SLUG actually contains
      console.log("ADMIN_GET_BLOGS_SLUG value:", ADMIN_GET_BLOGS_SLUG);

      // Construct URL properly
      let url;
      if (typeof ADMIN_GET_BLOGS_SLUG === "string") {
        // If it's a base URL, append the slug
        if (ADMIN_GET_BLOGS_SLUG.endsWith("/")) {
          url = `${ADMIN_GET_BLOGS_SLUG}${slug}`;
        } else {
          url = `${ADMIN_GET_BLOGS_SLUG}/${slug}`;
        }
      } else {
        // If it's a function or something else, try to get the correct format
        url = `/admin/blogs/${slug}`; // Fallback
      }

      console.log("Fetching from URL:", url);

      const res = await GetRequest(url);
      if (res.success) {
        const blogData = res.data;
        console.log("Fetched full blog data by slug:", blogData);

        setTitle(blogData.title || "");
        setShortDescription(blogData.short_description || "");
        setDescription(blogData.description || "");

        if (editorInstance) {
          editorInstance.setData(blogData.description || "");
        }

        return blogData;
      }
    } catch (err) {
      console.error("Fetch Blog by Slug Error:", err);
      alert("Failed to fetch blog details. Please check the endpoint URL.");
    } finally {
      setFetchingBlog(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Reset form
  const resetForm = () => {
    setTitle("");
    setShortDescription("");
    setDescription("");
    setImage(null);
    setEditId(null);

    // Also reset file input visually
    const fileInput = document.getElementById('blog-image-upload');
    if (fileInput) fileInput.value = '';

    if (editorInstance) {
      editorInstance.setData("");
    }
  };

  // Submit blog
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
      const existingImg = blogs.find((b) => b.id === editId)?.image || "";
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
        // 🔹 Update existing blog
        res = await PutRequest(ADMIN_UPDATE_BLOGS(editId), formData);
      } else {
        // 🔹 Create new blog
        res = await PostRequest(ADMIN_POST_BLOGS, formData);
      }

      if (res.success) {
        alert(res.message);
        resetForm();
        fetchBlogs();
      } else {
        alert(res.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Submit Blog Error:", err);
      alert("Failed to submit blog. Check console for details.");
    }
  };

  const handleEdit = async (blog) => {
    console.log("Editing blog (summary):", blog);

    setTitle(blog.title || "");
    setShortDescription(blog.short_description || "");
    setImage(null);
    setEditId(blog.id);

    setDescription("");
    if (editorInstance) {
      editorInstance.setData("");
    }
    
    // Also reset file input visually
    const fileInput = document.getElementById('blog-image-upload');
    if (fileInput) fileInput.value = '';

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Fetch full blog details using slug
    await fetchBlogBySlug(blog.slug);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this blog?")) return;
    try {
      const res = await DeleteRequest(ADMIN_DELETE_BLOGS(id));
      if (res.success) {
        alert(res.message);
        fetchBlogs();
        // If we are editing the deleted blog, reset the form
        if (editId === id) {
          resetForm();
        }
      }
    } catch (err) {
      console.error("Delete Blog Error:", err);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in py-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {editId ? "Edit Blog Post" : "Add New Blog Post"}
        </h1>
        <p className="text-slate-500">Manage your insightful articles and news</p>
      </div>

      {/* 🔹 Blog Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-10">
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-6">
            
            {/* Title & Short Description */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Blog Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={fetchingBlog}
                  placeholder="Enter the title of the blog post"
                  className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Short Description (Excerpt)</label>
                <textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  disabled={fetchingBlog}
                  rows={3}
                  placeholder="A brief summary that appears on the blog listing page"
                  className="w-full rounded-lg border-slate-200 border px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:text-slate-500 resize-y"
                />
              </div>
            </div>

            {/* Rich Text Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 block">Full Content (Editor)</label>

              {fetchingBlog && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 mb-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Loading full blog content...</span>
                </div>
              )}

              {editId && !fetchingBlog && description && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 mb-3">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Content loaded successfully and ready to edit!</span>
                </div>
              )}

              <div className={`rounded-xl overflow-hidden border ${fetchingBlog ? 'border-slate-200 opacity-60 pointer-events-none' : 'border-slate-300'} focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all`}>
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
                  disabled={fetchingBlog}
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
                        src={`${BASE_URL}/${blogs.find((b) => b.id === editId)?.image}`}
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
                        id="blog-image-upload"
                        onChange={(e) => setImage(e.target.files[0])}
                        disabled={fetchingBlog}
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
                disabled={fetchingBlog}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {fetchingBlog ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : editId ? (
                  <><Edit2 className="w-5 h-5" /> Update Blog Post</>
                ) : (
                  <><FileText className="w-5 h-5" /> Publish Blog Post</>
                )}
              </button>
              
              {editId && (
                <button
                  onClick={resetForm}
                  disabled={fetchingBlog}
                  className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel Edit
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 🔹 Blog List */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-slate-900">Manage Published Blogs</h2>
        <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm font-semibold">
          {blogs.length} Total
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-12 bg-white rounded-xl border border-slate-200 border-dashed">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <FileText className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-slate-700 font-medium text-lg mb-1">No blogs assigned yet</h3>
          <p className="text-slate-500 text-sm">Create your first blog post using the form above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className={`bg-white rounded-xl border transition-all duration-300 hover:shadow-lg flex flex-col overflow-hidden group ${editId === blog.id ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200 hover:border-brand-200'}`}
            >
              {/* Image Header */}
              <div className="aspect-[16/9] w-full bg-slate-100 relative overflow-hidden border-b border-slate-100">
                {blog.image ? (
                  <img
                    src={`${BASE_URL}/${blog.image}`}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-medium text-slate-400 bg-slate-50">
                    <ImageIcon className="w-10 h-10 opacity-20" />
                  </div>
                )}
                
                {/* Action Buttons overlay */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleEdit(blog)}
                    disabled={fetchingBlog}
                    className="p-2 bg-white/90 backdrop-blur text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg shadow-sm transition-colors border border-brand-100 disabled:opacity-50"
                    title="Edit Blog"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    disabled={fetchingBlog}
                    className="p-2 bg-white/90 backdrop-blur text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg shadow-sm transition-colors border border-red-100 disabled:opacity-50"
                    title="Delete Blog"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-brand-600 transition-colors">
                  {blog.title}
                </h3>
                
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {blog.short_description}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 text-xs font-mono text-slate-400 truncate" title={blog.slug}>
                  /{blog.slug}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
