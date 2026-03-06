import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";

import {
  GetRequest,
  PostRequest,
  DeleteRequest,
  PutRequest,
} from "../../apis/config";

import {
  ADMIN_GET_ALL_TESIMONIALS,
  ADMIN_POST_TESTIMONIALS,
  ADMIN_DELETE_TESTIMONIALS,
  ADMIN_UPDATE_TESTIMONIALS,
} from "../../apis/endpoints";
import { BASE_URL } from "../../apis/api";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    text: "",
    image: null,
  });

  /* =========================
     FETCH ALL
  ========================== */
  const fetchTestimonials = async () => {
    try {
      setLoading(true);

      const res = await GetRequest(ADMIN_GET_ALL_TESIMONIALS);

      if (res?.data) {
        setTestimonials(res?.data);
      }
    } catch (error) {
      console.error("Fetch Testimonials Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  /* =========================
     FORM HANDLING
  ========================== */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      name: "",
      role: "",
      text: "",
      image: "",
    });
    setOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      role: item.role,
      text: item.text,
      image: item.image,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  /* =========================
     CREATE / UPDATE
  ========================== */
  const handleSubmit = async () => {
    try {
      if (!form.name || !form.role || !form.text) {
        alert("Please fill all required fields");
        return;
      }

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("role", form.role);
      formData.append("text", form.text);

      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      if (editingId) {
        await PutRequest(ADMIN_UPDATE_TESTIMONIALS(editingId), formData);
      } else {
        await PostRequest(ADMIN_POST_TESTIMONIALS, formData);
      }

      fetchTestimonials();
      handleClose();
    } catch (error) {
      console.error("Submit Error:", error);
    }
  };

  /* =========================
     DELETE
  ========================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?"))
      return;

    try {
      await DeleteRequest(ADMIN_DELETE_TESTIMONIALS(id));

      fetchTestimonials();
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Manage Testimonials
      </Typography>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleOpenCreate}
        sx={{ mb: 3 }}
      >
        Add Testimonial
      </Button>

      <Paper>
        {loading ? (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Text</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {testimonials.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Avatar src={item.image} />
                  </TableCell>

                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.role}</TableCell>

                  <TableCell sx={{ maxWidth: 300 }}>
                    {item.text?.substring(0, 80)}...
                  </TableCell>

                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <Edit />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {testimonials.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No testimonials found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* =========================
          CREATE / EDIT DIALOG
      ========================== */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingId ? "Update Testimonial" : "Create Testimonial"}
        </DialogTitle>

        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            fullWidth
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            fullWidth
            multiline
            rows={4}
            label="Testimonial Text"
            name="text"
            value={form.text}
            onChange={handleChange}
          />

          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" component="label">
              Upload Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) =>
                  setForm({
                    ...form,
                    image: e.target.files[0],
                  })
                }
              />
            </Button>

            {form.image && (
              <Box sx={{ mt: 2 }}>
                <Avatar src={form.image} sx={{ width: 60, height: 60 }} />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
