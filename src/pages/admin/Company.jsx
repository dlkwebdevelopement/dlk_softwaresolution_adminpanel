import { useEffect, useState, useRef } from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Paper,
  Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { GetRequest, PostRequest, DeleteRequest } from "../../apis/config";
import { ADMIN_UPLOAD_COMPANY, ADMIN_DELETE_COMPANY, ADMIN_GET_COMPANIES } from "../../apis/endpoints";
import { CloudUploadOutlined, PhotoLibraryOutlined } from "@mui/icons-material";
import { BASE_URL } from "../../apis/api";

export default function Company() {
  const [list, setList] = useState([]);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetch = async () => {
    try {
      const data = await GetRequest(ADMIN_GET_COMPANIES);
      setList(data);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const upload = async () => {
    if (!file) return alert("Select a file first!");
    const fd = new FormData();
    fd.append("photo", file);

    try {
      await PostRequest(ADMIN_UPLOAD_COMPANY, fd);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetch();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload company photo.");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this company photo?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_COMPANY(id));
      fetch();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete company photo.");
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: "#1e293b" }}>
        Company Photos
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#64748b" }}>
        Manage your company gallery and brand images
      </Typography>

      <Card sx={{ mb: 4, boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <CloudUploadOutlined color="primary" />
            Upload New Photo
          </Typography>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              textAlign: "center",
              border: "2px dashed #cbd5e1",
              backgroundColor: "#f8fafc",
              mb: 2
            }}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ display: "none" }}
              id="company-upload"
            />
            <label htmlFor="company-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadOutlined />}
                sx={{ mb: 1 }}
              >
                Choose File
              </Button>
            </label>
            {file && (
              <Alert severity="success" sx={{ mt: 1 }}>
                Selected: {file.name}
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              PNG, JPG, WEBP up to 10MB
            </Typography>
          </Paper>

          <Button 
            variant="contained" 
            onClick={upload}
            disabled={!file}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Upload Photo
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
            <PhotoLibraryOutlined color="primary" />
            Company Gallery ({list.length})
          </Typography>

          {list.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center", backgroundColor: "#f8fafc" }}>
              <PhotoLibraryOutlined sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No company images uploaded yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload your first company photo to get started
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
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <img
                    src={`${BASE_URL}/${c.photoUrl}`}
                    alt="company"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                  <IconButton
                    onClick={() => remove(c.id)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(239, 68, 68, 0.9)",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#dc2626",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
