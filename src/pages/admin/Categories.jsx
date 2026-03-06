import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Paper,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  GetRequest,
  PostRequest,
  DeleteRequest,
  PutRequest,
} from "../../apis/config";
import {
  ADMIN_GET_CATEGORIES,
  ADMIN_CREATE_CATEGORY,
  ADMIN_DELETE_CATEGORY,
  ADMIN_UPDATE_CATEGORY,
} from "../../apis/endpoints";
import { BASE_URL } from "../../apis/api";

export default function Categories() {
  const [list, setList] = useState([]);
  const [val, setVal] = useState("");
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [editFile, setEditFile] = useState(null);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const [description, setDescription] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchCategories = async () => {
    try {
      const data = await GetRequest(ADMIN_GET_CATEGORIES);
      setList(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!val.trim()) return;
    const formData = new FormData();
    formData.append("category", val.trim());
    formData.append("description", description.trim());

    if (file) formData.append("image", file);

    try {
      await PostRequest(ADMIN_CREATE_CATEGORY, formData, true);
      setVal("");
      setDescription("");

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchCategories();
    } catch (err) {
      console.error("Failed to add category:", err);
      alert("Failed to add category.");
    }
  };

  const removeCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_CATEGORY(id));
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert("Failed to delete category.");
    }
  };

  const startEdit = (id, current, desc) => {
    setEditingId(id);
    setEditVal(current);
    setEditDescription(desc || "");
    setEditFile(null);
  };

  const saveEdit = async (id) => {
    if (!editVal.trim()) return;
    const formData = new FormData();
    formData.append("category", editVal.trim());
    formData.append("description", editDescription.trim());

    if (editFile) formData.append("image", editFile);

    try {
      await PutRequest(ADMIN_UPDATE_CATEGORY(id), formData, true);
      setEditingId(null);
      setEditVal("");
      setEditDescription("");

      setEditFile(null);
      if (editFileInputRef.current) editFileInputRef.current.value = "";
      fetchCategories();
    } catch (err) {
      console.error("Failed to update category:", err);
      alert("Failed to update category.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditVal("");
    setEditDescription("");

    setEditFile(null);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  return (
    <Box sx={{ mx: "auto" }}>
      <Typography
        variant="h4"
        sx={{ mb: 1, fontWeight: 700, color: "#1e293b" }}
      >
        Navbar Categories
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#64748b" }}>
        Manage your website categories and their images
      </Typography>

      {/* Add New Category */}
      <Card
        sx={{
          mb: 4,
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add New Category
          </Typography>
          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2, mb: 2 }}
          >
            <TextField
              placeholder="Category Name"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              fullWidth
            />
            <TextField
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                textAlign: "center",
                border: "2px dashed #cbd5e1",
                backgroundColor: "#f8fafc",
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept="image/*"
                style={{ display: "none" }}
                id="category-upload"
              />

              <label htmlFor="category-upload">
                <Button variant="outlined" component="span">
                  Choose Image
                </Button>
              </label>
              {file && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  Selected: {file.name}
                </Alert>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                PNG, JPG, WEBP up to 5MB
              </Typography>
            </Paper>
            <Button
              variant="contained"
              onClick={addCategory}
              disabled={!val.trim()}
              fullWidth
            >
              Add Category
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Category List */}
      <Card
        sx={{
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Categories ({list.length})
          </Typography>
          {list.length === 0 ? (
            <Paper
              sx={{ p: 4, textAlign: "center", backgroundColor: "#f8fafc" }}
            >
              <Typography variant="h6" color="text.secondary">
                No categories found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add your first category to get started
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 3,
              }}
            >
              {list.map((c) => (
                <Paper
                  key={c.id}
                  elevation={1}
                  sx={{
                    position: "relative",
                    borderRadius: "12px",
                    overflow: "hidden",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  {editingId === c.id ? (
                    <>
                      <TextField
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                      />

                      <input
                        type="file"
                        ref={editFileInputRef}
                        onChange={(e) =>
                          setEditFile(e.target.files?.[0] || null)
                        }
                        accept="image/*"
                        style={{ display: "none" }}
                        id={`edit-upload-${c.id}`}
                      />
                      <label htmlFor={`edit-upload-${c.id}`}>
                        <Button
                          variant="outlined"
                          component="span"
                          sx={{ mt: 1 }}
                        >
                          Choose Image
                        </Button>
                      </label>
                      {editFile && (
                        <Alert severity="success">
                          Selected: {editFile.name}
                        </Alert>
                      )}
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <IconButton
                          color="success"
                          onClick={() => saveEdit(c.id)}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton color="error" onClick={cancelEdit}>
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {c.image && (
                          <img
                            src={`${BASE_URL}/${c.image}`}
                            alt={c.category}
                            style={{
                              width: 50,
                              height: 50,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                        )}
                        <Typography sx={{ fontWeight: 500 }}>
                          {c.category}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          onClick={() =>
                            startEdit(c.id, c.category, c.description)
                          }
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => removeCategory(c.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
