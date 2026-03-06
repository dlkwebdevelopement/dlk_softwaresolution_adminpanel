import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Paper,
} from "@mui/material";
import { Edit, Delete, Business, AddOutlined, Check, Close } from "@mui/icons-material";
import {
  GetRequest,
  PostRequest,
  PutRequest,
  DeleteRequest,
} from "../../apis/config";
import {
  ADMIN_GET_HIRING,
  ADMIN_CREATE_HIRING,
  ADMIN_UPDATE_HIRING,
  ADMIN_DELETE_HIRING,
} from "../../apis/endpoints";

export default function HiringCompanies() {
  const [companies, setCompanies] = useState([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // ✅ Fetch all companies
  const fetchCompanies = async () => {
    try {
      const res = await GetRequest(ADMIN_GET_HIRING);
      setCompanies(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ✅ Add new company
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return alert("Please enter a company name");

    try {
      await PostRequest(ADMIN_CREATE_HIRING, { companies: newCompanyName });
      setNewCompanyName("");
      fetchCompanies();
    } catch (err) {
      console.error("Error saving company:", err);
    }
  };

  // ✅ Start inline editing
  const handleEdit = (company) => {
    setEditingId(company.id);
    setEditValue(company.companies);
  };

  // ✅ Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // ✅ Save inline edited company
  const handleSaveEdit = async (id) => {
    if (!editValue.trim()) return alert("Please enter a company name");
    try {
      await PutRequest(ADMIN_UPDATE_HIRING(id), { companies: editValue });
      setEditingId(null);
      setEditValue("");
      fetchCompanies();
    } catch (err) {
      console.error("Error updating company:", err);
    }
  };

  // ✅ Delete company
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_HIRING(id));
      fetchCompanies();
    } catch (err) {
      console.error("Error deleting company:", err);
    }
  };

  return (
    <Box sx={{ mx: "auto"}}>
      <Typography
        variant="h4"
        sx={{ mb: 1, fontWeight: 700, color: "#1e293b" }}
      >
        Hiring Companies
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#64748b" }}>
        Manage the list of companies currently hiring
      </Typography>

      <Grid container spacing={3}>
        {/* ✅ Add Company Section */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
              height: "fit-content",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <AddOutlined color="primary" />
                Add New Company
              </Typography>

              <Box
                component="form"
                onSubmit={handleAdd}
                sx={{ display: "flex", gap: 1 }}
              >
                <TextField
                  fullWidth
                  label="Company Name"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  size="small"
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  sx={{ minWidth: 100 }}
                >
                  Add
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ✅ Company List Section */}
        <Grid item xs={12} md={7}>
          <Card
            sx={{
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Business color="primary" />
                Company List ({companies.length})
              </Typography>

              {companies.length === 0 ? (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: "center",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                  }}
                >
                  <Business sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No companies yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add your first hiring company to get started
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {companies.map((company) => (
                    <Box
                      key={company.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1.5,
                        borderRadius: "8px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        "&:hover": { backgroundColor: "#f1f5f9" },
                      }}
                    >
                      {editingId === company.id ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                          <TextField
                            fullWidth
                            size="small"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                          />
                          <IconButton color="success" onClick={() => handleSaveEdit(company.id)}>
                            <Check fontSize="small" />
                          </IconButton>
                          <IconButton color="error" onClick={handleCancelEdit}>
                            <Close fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <>
                          <Typography sx={{ fontWeight: 500, color: "#1e293b" }}>
                            {company.companies}
                          </Typography>
                          <Box>
                            <IconButton onClick={() => handleEdit(company)}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(company.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}