import { useState } from "react";
import { Card, CardContent, TextField, Button, Typography, Box } from "@mui/material";
import { PostRequest } from "../../apis/config";
import { ADMIN_LOGIN } from "../../apis/endpoints";
import { useNavigate } from "react-router-dom";
import { AdminPanelSettingsOutlined, LockOutlined, PersonOutlined } from "@mui/icons-material";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await PostRequest(ADMIN_LOGIN, form);
      localStorage.setItem("admin", JSON.stringify(data.admin));
      navigate("/");
    } catch (err) {
      alert(err?.message || "Login failed");
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4
      }}
    >
      <Card 
        sx={{ 
          width: 400, 
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          borderRadius: "16px",
          overflow: "hidden"
        }}
      >
        <Box 
          sx={{ 
            background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
            color: "white",
            textAlign: "center",
            py: 4
          }}
        >
          <AdminPanelSettingsOutlined sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            DLK Admin
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Sign in to your account
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={submit}>
            <TextField 
              fullWidth 
              label="Username" 
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })} 
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <PersonOutlined sx={{ mr: 1, color: "text.secondary" }} />
              }}
            />
            <TextField 
              fullWidth 
              label="Password" 
              type="password" 
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <LockOutlined sx={{ mr: 1, color: "text.secondary" }} />
              }}
            />
            <Button 
              variant="contained" 
              fullWidth 
              type="submit"
              size="large"
              sx={{
                py: 1.5,
                background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                fontWeight: 600,
                fontSize: "1rem",
                '&:hover': {
                  background: "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)",
                }
              }}
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}