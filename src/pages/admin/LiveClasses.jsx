import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Paper,
  TextField,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";

import {
  GetRequest,
  PostRequest,
  DeleteRequest,
  PutRequest,
} from "../../apis/config";

import {
  ADMIN_GET_LIVE_CLASSES,
  ADMIN_POST_LIVE_CLASSES,
  ADMIN_DELETE_LIVE_CLASSES,
  ADMIN_GET_CATEGORIES,
  ADMIN_UPDATE_LIVE_CLASSES,
} from "../../apis/endpoints";

export default function LiveClasses() {
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);

  // 🔹 Form fields
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // 🔹 Edit state
  const [editingId, setEditingId] = useState(null);

  const fetchLiveClasses = async () => {
    const data = await GetRequest(ADMIN_GET_LIVE_CLASSES);
    setList(data);
  };

  const fetchCategories = async () => {
    const data = await GetRequest(ADMIN_GET_CATEGORIES);
    setCategories(data);
  };

  useEffect(() => {
    fetchLiveClasses();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setCourseId("");
    setTitle("");
    setStartDate("");
    setDurationDays("");
    setStartTime("");
    setEndTime("");
    setEditingId(null);
  };

  const submitLiveClass = async () => {
    if (
      !courseId ||
      !title ||
      !startDate ||
      !durationDays ||
      !startTime ||
      !endTime
    ) {
      return alert("Please fill all required fields");
    }

    const payload = {
      courseId,
      title,
      startDate,
      durationDays: Number(durationDays),
      startTime,
      endTime,
    };

    try {
      if (editingId) {
        await PutRequest(ADMIN_UPDATE_LIVE_CLASSES(editingId), payload);
      } else {
        await PostRequest(ADMIN_POST_LIVE_CLASSES, payload);
      }

      resetForm();
      fetchLiveClasses();
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Operation failed");
    }
  };

  const toInputDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const editLiveClass = (c) => {
    setEditingId(c.id);
    setCourseId(c.courseId);
    setTitle(c.title);
    setStartDate(toInputDate(c.startDate));
    setDurationDays(c.durationDays);
    setStartTime(c.startTime);
    setEndTime(c.endTime);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeLiveClass = async (id) => {
    if (!confirm("Delete this live class?")) return;
    await DeleteRequest(ADMIN_DELETE_LIVE_CLASSES(id));
    fetchLiveClasses();
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime12 = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Live Classes Management
      </Typography>

      {/* 🔹 FORM */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: "flex", gap: 1 }}>
            <EventAvailableOutlinedIcon />
            {editingId ? "Edit Live Class" : "Add New Live Class"}
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Select Category</em>
              </MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.category}
                </MenuItem>
              ))}
            </Select>

            <TextField
              label="Class Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              label="Duration (Days)"
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
            />
            <TextField
              type="time"
              label="Start Time"
              InputLabelProps={{ shrink: true }}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <TextField
              type="time"
              label="End Time"
              InputLabelProps={{ shrink: true }}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              fullWidth
              sx={{ height: 50 }}
              variant="contained"
              onClick={submitLiveClass}
            >
              {editingId ? "Update Live Class" : "Create Live Class"}
            </Button>

            {editingId && (
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={resetForm}
              >
                Cancel
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* 🔹 LIST */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, display: "flex", gap: 1 }}>
            <SchoolOutlinedIcon />
            Live Classes ({list.length})
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 3,
            }}
          >
            {list.map((c) => (
              <Paper
                key={c.id}
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
                {/* Header */}
                <Typography
                  fontWeight={700}
                  sx={{ fontSize: "1.2rem", color: "#0f172a" }}
                >
                  {c.title}
                </Typography>
                {/* Header */}
                <Typography
                  fontWeight={700}
                  sx={{ mb: 1, fontSize: "1rem", color: "#535558" }}
                >
                  {c.category.category}
                </Typography>

                {/* Meta Info */}
                <Stack spacing={0.8} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: "#475569" }}>
                    📅 <strong>Start:</strong> {formatDate(c.startDate)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#475569" }}>
                    ⏳ <strong>Duration:</strong> {c.durationDays} days
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#475569" }}>
                    🕒 <strong>Time:</strong> {formatTime12(c.startTime)} –{" "}
                    {formatTime12(c.endTime)}
                  </Typography>
                </Stack>

                {/* Actions */}
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => editLiveClass(c)}
                    sx={{
                      border: "1px solid #c7d2fe",
                      color: "#4338ca",
                      backgroundColor: "#eef2ff",
                      "&:hover": {
                        backgroundColor: "#e0e7ff",
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={() => removeLiveClass(c.id)}
                    sx={{
                      border: "1px solid #fecaca",
                      color: "#b91c1c",
                      backgroundColor: "#fef2f2",
                      "&:hover": {
                        backgroundColor: "#fee2e2",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
