import { Routes, Route, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import Dashboard from "../../pages/admin/Dashboard";
import Categories from "../../pages/admin/Categories";
import Subcategories from "../../pages/admin/Subcategories";
import Banners from "../../pages/admin/Banners";
import Company from "../../pages/admin/Company";
import Enquiries from "../../pages/admin/Enquiries";
import Faq from "../../pages/admin/Faq";
import Login from "../../pages/admin/Login";
import HiringCompanies from "../../pages/admin/HiringCompanies"; // ✅ Added import
import ProtectedRoute from "../../components/admin/ProtectedRoute";
import Register from "../../pages/admin/Register";
import LiveClasses from "../../pages/admin/LiveClasses";
import Blog from "../../pages/admin/Blog";
import CourseDetails from "../../pages/adminCourse/CourseDetails";
import Contact from "../../pages/adminContact/Contact";
import Testimonials from "../../pages/admin/Testimonials";

export default function AppRoutes() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <Box
      sx={{ ml: isLoginPage ? 0 : "250px", p: 3, mt: isLoginPage ? 0 : "64px" }}
    >
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subcategories"
          element={
            <ProtectedRoute>
              <Subcategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/banners"
          element={
            <ProtectedRoute>
              <Banners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company"
          element={
            <ProtectedRoute>
              <Company />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hiring"
          element={
            <ProtectedRoute>
              <HiringCompanies />
            </ProtectedRoute>
          }
        />{" "}
        {/* ✅ Added route */}
        <Route
          path="/enquiries"
          element={
            <ProtectedRoute>
              <Enquiries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faq"
          element={
            <ProtectedRoute>
              <Faq />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/liveclass"
          element={
            <ProtectedRoute>
              <LiveClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs"
          element={
            <ProtectedRoute>
              <Blog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CourseDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/testimonials"
          element={
            <ProtectedRoute>
              <Testimonials />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Box>
  );
}
