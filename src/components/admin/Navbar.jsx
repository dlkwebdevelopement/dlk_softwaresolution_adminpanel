// Navbar.jsx - Enhanced UI
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined, AdminPanelSettingsOutlined } from "@mui/icons-material";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "white",
        color: "#1e293b",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "64px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AdminPanelSettingsOutlined sx={{ color: "#3b82f6", fontSize: 28 }} />
          <Typography variant="h6" onClick={()=>navigate("/dashboard")} sx={{ fontWeight: 700, color: "#1e293b", cursor:"pointer"}}>
            DLK Admin
          </Typography>
        </Box>
        
        <Button 
          variant="outlined"
          onClick={handleLogout}
          startIcon={<LogoutOutlined />}
          sx={{
            borderColor: "#dc2626",
            color: "#dc2626",
            "&:hover": {
              borderColor: "#b91c1c",
              backgroundColor: "rgba(220, 38, 38, 0.04)",
            },
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}