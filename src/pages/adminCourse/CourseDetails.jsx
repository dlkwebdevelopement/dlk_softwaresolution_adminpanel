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
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";

import {
  GetRequest,
  PostRequest,
  DeleteRequest,
  PutRequest,
} from "../../apis/config";

import {
  ADMIN_GET_COURSE_SLUG,
  ADMIN_DELETE_COURSE,
  ADMIN_UPDATE_COURSE,
  ADMIN_POST_COURSES,
  ADMIN_GET_CATEGORIES,
  ADMIN_GET_ALL_COURSES,
} from "../../apis/endpoints";
import { Pagination } from "@mui/material";

import { BASE_URL } from "../../apis/api";

const initialState = {
  category_id: "",
  title: "",
  short_description: "",
  full_description: "",
  mode: "",
  duration_months: "",
  level: "",

  price: "",
  original_price: "",
  discount_percentage: "",
  whoShouldEnroll: [{ content: "", order_index: 0 }],
  learningPoints: [{ content: "", order_index: 0 }],
  curriculum: [{ title: "", order_index: 0 }],
};

export default function CourseDetails() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [courseId, setCourseId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [courses, setCourses] = useState([]);
  const [syllabusPdf, setSyllabusPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialState);

  // ================= FETCH =================
  const fetchCategories = async () => {
    try {
      const res = await GetRequest(ADMIN_GET_CATEGORIES);
      setCategories(res || []);
    } catch (err) {
      setCategories([]);
    }
  };

  const fetchAllCourses = async (pageNumber = 1) => {
    try {
      const res = await GetRequest(
        `${ADMIN_GET_ALL_COURSES}?page=${pageNumber}`,
      );

      if (res?.success) {
        setCourses(res.data || []);
        setTotalPages(res.totalPages || 0);
        setTotalCourses(res.total || 0);
        setPage(res.page || 1);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchAllCourses(page);
  }, [page]);

  // ================= FORM HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...(formData[field] || [])];
    if (field === "curriculum") {
      updated[index].title = value;
    } else {
      updated[index].content = value;
    }
    setFormData({ ...formData, [field]: updated });
  };

  const addArrayItem = (field) => {
    if (field === "curriculum") {
      setFormData({
        ...formData,
        curriculum: [...formData.curriculum, { title: "", order_index: 0 }],
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...formData[field], { content: "", order_index: 0 }],
      });
    }
  };

  // ================= EDIT =================
  const handleEditCourse = async (slugValue) => {
    try {
      setLoading(true);
      const res = await GetRequest(ADMIN_GET_COURSE_SLUG(slugValue));
      if (!res?.success) return alert("Course not found");

      const data = res.data;
      setCourseId(data.id);

      setFormData({
        category_id: data.category_id || "",
        title: data.title || "",
        short_description: data.short_description || "",
        full_description: data.full_description || "",
        mode: data.mode || "",
        duration_months: data.duration_months || "",
        level: data.level || "",
        price: data.price || "",
        original_price: data.original_price || "",
        discount_percentage: data.discount_percentage || "",
        thumbnail: data.thumbnail || "",
        syllabus_pdf: data.syllabus_pdf || "",
       
        whoShouldEnroll: data.whoShouldEnroll || [],
        learningPoints: data.learningPoints || [],
        curriculum: data.curriculum || [],
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      alert("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE =================
  const handleCreate = async () => {
    try {
      const sendData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (
          key === "whoShouldEnroll" ||
          key === "learningPoints" ||
          key === "curriculum"
        ) {
          const cleanedArray = (formData[key] || [])
            .filter((item) =>
              key === "curriculum"
                ? item.title && item.title.trim() !== ""
                : item.content && item.content.trim() !== "",
            )
            .map((item) => {
              const newItem = { ...item };
              if (!newItem.id) delete newItem.id;
              return newItem;
            });

          if (cleanedArray.length === 0) {
            sendData.append(key, null);
          } else {
            sendData.append(key, JSON.stringify(cleanedArray));
          }
        } else {
          sendData.append(key, formData[key] || "");
        }
      });

      if (thumbnail) sendData.append("thumbnail", thumbnail);
      if (syllabusPdf) sendData.append("syllabus_pdf", syllabusPdf);

      await PostRequest(ADMIN_POST_COURSES, sendData, true);
      await fetchAllCourses();

      alert("Course Created Successfully");
      setFormData(initialState);
      setThumbnail(null);
      setCourseId(null);
      setSyllabusPdf(null);
    } catch (error) {
      alert("Create Failed");
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (!courseId) return alert("Load course first");

    try {
      const sendData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (
          key === "whoShouldEnroll" ||
          key === "learningPoints" ||
          key === "curriculum"
        ) {
          const cleanedArray = (formData[key] || [])
            .filter((item) =>
              key === "curriculum"
                ? item.title && item.title.trim() !== ""
                : item.content && item.content.trim() !== "",
            )
            .map((item) => {
              const newItem = { ...item };
              if (!newItem.id) delete newItem.id;
              return newItem;
            });

          if (cleanedArray.length === 0) {
            sendData.append(key, null);
          } else {
            sendData.append(key, JSON.stringify(cleanedArray));
          }
        } else {
          sendData.append(key, formData[key] || "");
        }
      });

      if (thumbnail) sendData.append("thumbnail", thumbnail);
      if (syllabusPdf) sendData.append("syllabus_pdf", syllabusPdf);

      await PutRequest(ADMIN_UPDATE_COURSE(courseId), sendData, true);
      setSyllabusPdf(null);
      alert("Course Updated Successfully");
    } catch (error) {
      alert("Update Failed" + error.message);
    }
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!courseId) return alert("Load course first");
    if (!window.confirm("Are you sure?")) return;

    try {
      await DeleteRequest(ADMIN_DELETE_COURSE(courseId));
      await fetchAllCourses();
      alert("Deleted Successfully");

      setFormData(initialState);
      setCourseId(null);
      setThumbnail(null);
    } catch (error) {
      alert("Delete Failed");
    }
  };

  // ================= UI =================
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Course Management
      </Typography>

      {/* FORM CARD */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            <MenuBookOutlinedIcon sx={{ mr: 1 }} />
            {courseId ? "Edit Course" : "Create Course"}
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              displayEmpty
            >
              <MenuItem value="">
                <em>Select Category</em>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.category}
                </MenuItem>
              ))}
            </Select>

            <TextField
              name="title"
              label="Title"
              value={formData.title}
              onChange={handleChange}
            />
            <TextField
              name="mode"
              label="Mode"
              value={formData.mode}
              onChange={handleChange}
            />
            <TextField
              name="duration_months"
              label="Duration (Months)"
              value={formData.duration_months}
              onChange={handleChange}
            />
            <TextField
              name="level"
              label="Level"
              value={formData.level}
              onChange={handleChange}
            />
            <TextField
              name="price"
              label="Price"
              value={formData.price}
              onChange={handleChange}
            />
            <TextField
              name="original_price"
              label="Original Price"
              value={formData.original_price}
              onChange={handleChange}
            />
            <TextField
              name="discount_percentage"
              label="Discount %"
              value={formData.discount_percentage}
              onChange={handleChange}
            />

            <TextField
              name="short_description"
              label="Short Description"
              multiline
              rows={2}
              value={formData.short_description}
              onChange={handleChange}
            />

            <TextField
              name="full_description"
              label="Full Description"
              multiline
              rows={3}
              value={formData.full_description}
              onChange={handleChange}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            {formData.thumbnail_url &&
              typeof formData.thumbnail_url === "string" && (
                <img
                  src={`${formData.thumbnail_url}`}
                  alt="Course Thumbnail"
                  style={{ width: 150, marginBottom: 10 }}
                />
              )}
            <Button variant="outlined" component="label" sx={{ mr: 2 }}>
              Upload Logo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files[0])}
              />
            </Button>

            {thumbnail && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {thumbnail.name}
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            {formData.syllabus_pdf_url && (
              <Typography sx={{ mb: 1 }}>
                Current PDF:
                <a
                  href={formData.syllabus_pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginLeft: 8 }}
                >
                  View Syllabus
                </a>
              </Typography>
            )}

            <Button variant="outlined" component="label" sx={{ mt: 2 }}>
              Upload Syllabus PDF
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={(e) => setSyllabusPdf(e.target.files[0])}
              />
            </Button>

            {syllabusPdf && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {syllabusPdf.name}
              </Typography>
            )}
          </Box>

          {/* ARRAYS */}
          {["whoShouldEnroll", "learningPoints", "curriculum"].map((field) => (
            <Box key={field} sx={{ mt: 3 }}>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                {field}
              </Typography>

              {(formData[field] || []).map((item, index) => (
                <TextField
                  key={index}
                  fullWidth
                  sx={{ mb: 1 }}
                  placeholder={field === "curriculum" ? "Title" : "Content"}
                  value={
                    field === "curriculum" ? item.title || "" : item.content
                  }
                  onChange={(e) =>
                    handleArrayChange(field, index, e.target.value)
                  }
                />
              ))}

              <Button
                size="small"
                variant="outlined"
                onClick={() => addArrayItem(field)}
              >
                Add
              </Button>
            </Box>
          ))}

          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={courseId ? handleUpdate : handleCreate}
            >
              {courseId ? "Update Course" : "Create Course"}
            </Button>

            {courseId && (
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setFormData(initialState);
                  setCourseId(null);
                  setThumbnail(null);
                }}
              >
                Cancel
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* COURSE LIST */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            <SchoolOutlinedIcon sx={{ mr: 1 }} />
            All Courses ({courses.length})
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 3,
            }}
          >
            {courses.map((course) => (
              <Paper
                key={course.id}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                  position: "relative",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {course.thumbnail && (
                  <img
                    src={`${BASE_URL}/uploads/${course.thumbnail}`}
                    alt={course.title}
                    style={{
                      width: "100%",
                      height: 150,
                      objectFit: "cover",
                      borderRadius: 8,
                      marginBottom: 10,
                    }}
                  />
                )}

                <Typography fontWeight={700}>{course.title}</Typography>
                <Typography sx={{ color: "#475569" }}>
                  ₹ {course.price}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ position: "absolute", top: 10, right: 10 }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleEditCourse(course.slug)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    color="error"
                    onClick={async () => {
                      if (!window.confirm("Delete this course?")) return;
                      await DeleteRequest(ADMIN_DELETE_COURSE(course.id));
                      fetchAllCourses();
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Box>
          <Box sx={{ mt: 2, textAlign: "center", color: "#64748b" }}>
            Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, totalCourses)} of{" "}
            {totalCourses} courses
          </Box>
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
