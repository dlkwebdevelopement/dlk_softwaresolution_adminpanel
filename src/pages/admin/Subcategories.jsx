import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Box,
  IconButton,
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
  ADMIN_GET_SUBCATEGORIES,
  ADMIN_CREATE_SUBCATEGORY,
  ADMIN_DELETE_SUBCATEGORY,
  ADMIN_UPDATE_SUBCATEGORY,
} from "../../apis/endpoints";

export default function Subcategories() {
  const [categories, setCategories] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ category_id: "", subcategory: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    category_id: "",
    subcategory: "",
  });

  const fetch = async () => {
    setCategories(await GetRequest(ADMIN_GET_CATEGORIES));
    setList(await GetRequest(ADMIN_GET_SUBCATEGORIES));
  };

  useEffect(() => {
    fetch();
  }, []);

  const add = async () => {
    if (!form.category_id || !form.subcategory.trim()) return;
    await PostRequest(ADMIN_CREATE_SUBCATEGORY, form);
    setForm({ category_id: "", subcategory: "" });
    fetch();
  };

  const remove = async (id) => {
    if (!confirm("Delete?")) return;
    await DeleteRequest(ADMIN_DELETE_SUBCATEGORY(id));
    fetch();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      category_id: item.category_id,
      subcategory: item.subcategory,
    });
  };

  const saveEdit = async (id) => {
    if (!editForm.subcategory.trim()) return;
    await PutRequest(ADMIN_UPDATE_SUBCATEGORY(id), editForm);
    setEditingId(null);
    fetch();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ category_id: "", subcategory: "" });
  };

  return (
    <>
      <Typography style={{ fontWeight: 600 }} variant="h4">
        Navbar Subcategories
      </Typography>
      <Card>
        <CardContent>
          {/* Add New */}
          <Box sx={{ display: "flex", gap: 1, my: 2 }}>
            <Select
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              displayEmpty
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Select Category</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.category}
                </MenuItem>
              ))}
            </Select>
            <TextField
              value={form.subcategory}
              onChange={(e) =>
                setForm({ ...form, subcategory: e.target.value })
              }
              placeholder="Subcategory"
              fullWidth
            />
            <Button variant="contained" onClick={add}>
              Add
            </Button>
          </Box>

          {/* List with Inline Edit */}
          {list.map((s) => (
            <Box
              key={s.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1,
                borderBottom: "1px solid #eee",
              }}
            >
              {editingId === s.id ? (
                <>
                  <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
                    <Select
                      value={editForm.category_id}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          category_id: e.target.value,
                        })
                      }
                      size="small"
                      sx={{ minWidth: 160 }}
                    >
                      {categories.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.category}
                        </MenuItem>
                      ))}
                    </Select>
                    <TextField
                      value={editForm.subcategory}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          subcategory: e.target.value,
                        })
                      }
                      size="small"
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      color="success"
                      onClick={() => saveEdit(s.id)}
                      size="small"
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton color="error" onClick={cancelEdit} size="small">
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </>
              ) : (
                <>
                  <Box>
                    <Typography>{s.subcategory}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.category?.category || "No category"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton onClick={() => startEdit(s)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => remove(s.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </>
              )}
            </Box>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
