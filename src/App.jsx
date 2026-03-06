import { BrowserRouter, useLocation } from "react-router-dom";
import { ThemeProvider, CssBaseline, createTheme, Box } from "@mui/material";
import AppRoutes from "./routes/admin/AppRoutes";
import Sidebar from "./components/admin/Sidebar";
import Navbar from "./components/admin/Navbar"; 

const theme = createTheme();

function Layout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <Box sx={{ display: "flex" }}>
      {!isLoginPage && <Sidebar />} {/* hide sidebar on login page */}
      <Box sx={{ flexGrow: 1 }}>
        {!isLoginPage && <Navbar />} {/* ✅ Added Navbar (hidden on login) */}
        <AppRoutes />
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ThemeProvider>
  );
}
