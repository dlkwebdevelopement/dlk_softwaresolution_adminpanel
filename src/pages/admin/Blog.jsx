import React, { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Paper,
  TextField,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

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
      }
    } catch (err) {
      console.error("Delete Blog Error:", err);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        {editId ? "Edit Blog" : "Add New Blog"}
      </Typography>

      {/* 🔹 Blog Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              disabled={fetchingBlog}
            />
            <TextField
              label="Short Description"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
              disabled={fetchingBlog}
            />

            <Box>
              <Typography sx={{ mb: 1 }}>Description</Typography>

              {fetchingBlog && (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <CircularProgress size={20} />
                  <Typography variant="caption" color="info">
                    Loading blog content...
                  </Typography>
                </Box>
              )}

              {editId && !fetchingBlog && description && (
                <Alert severity="success" sx={{ mb: 1, py: 0 }}>
                  Description loaded successfully!
                </Alert>
              )}

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
            </Box>

            <Box>
              <Typography sx={{ mb: 1 }}>Image</Typography>

              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: 180,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ) : editId ? (
                <img
                  src={`${BASE_URL}/${blogs.find((b) => b.id === editId)?.image}`}
                  alt="Current"
                  style={{
                    width: 300,
                    maxHeight: 300,
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
              ) : null}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                style={{ marginTop: 5 }}
                disabled={fetchingBlog}
              />
            </Box>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{ height: 50 }}
              disabled={fetchingBlog}
            >
              {fetchingBlog ? (
                <CircularProgress size={24} />
              ) : editId ? (
                "Update Blog"
              ) : (
                "Create Blog"
              )}
            </Button>
            {editId && (
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={resetForm}
                sx={{ height: 50 }}
                disabled={fetchingBlog}
              >
                Cancel
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* 🔹 Blog List */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Blog List ({blogs.length})
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          {blogs.map((blog) => (
            <Paper
              key={blog.id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
                position: "relative",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Typography fontWeight={700} sx={{ fontSize: "1.2rem", mb: 1 }}>
                {blog.title}
              </Typography>
              <Typography sx={{ mb: 1, color: "#475569" }}>
                {blog.short_description}
              </Typography>

              <Typography
                variant="caption"
                display="block"
                sx={{ mb: 1, color: "text.secondary" }}
              >
                Slug: {blog.slug}
              </Typography>

              {blog.image && (
                <Box sx={{ mb: 1 }}>
                  <img
                    src={`${BASE_URL}/${blog.image}`}
                    alt={blog.title}
                    style={{
                      width: "100%",
                      maxHeight: 180,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                </Box>
              )}

              <Stack
                direction="row"
                spacing={1}
                sx={{ position: "absolute", top: 12, right: 12 }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleEdit(blog)}
                  disabled={fetchingBlog}
                  sx={{
                    border: "1px solid #c7d2fe",
                    color: "#4338ca",
                    backgroundColor: "#eef2ff",
                    "&:hover": { backgroundColor: "#e0e7ff" },
                    "&.Mui-disabled": { opacity: 0.5 },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(blog.id)}
                  disabled={fetchingBlog}
                  sx={{
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    backgroundColor: "#fef2f2",
                    "&:hover": { backgroundColor: "#fee2e2" },
                    "&.Mui-disabled": { opacity: 0.5 },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}
