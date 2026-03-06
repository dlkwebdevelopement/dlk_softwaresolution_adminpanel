// Layout.jsx
import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <Box sx={{ display: "flex" }}>
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - 280px)`,
          marginLeft: "280px",
          marginTop: "64px",
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "#f8fafc",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}