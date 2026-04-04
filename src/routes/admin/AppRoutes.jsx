import { Routes, Route } from "react-router-dom";
import Dashboard from "../../pages/admin/Dashboard";
import Categories from "../../pages/admin/Categories";
import Banners from "../../pages/admin/Banners";
import Company from "../../pages/admin/Company";
import Enquiries from "../../pages/admin/Enquiries";
import Faq from "../../pages/admin/Faq";
import Login from "../../pages/admin/Login";
import ProtectedRoute from "../../components/admin/ProtectedRoute";
import Register from "../../pages/admin/Register";
import LiveClasses from "../../pages/admin/LiveClasses";
import Blog from "../../pages/admin/Blog";
import StudentProjects from "../../pages/admin/StudentProjects";
import CourseDetails from "../../pages/adminCourse/CourseDetails";
import Contact from "../../pages/adminContact/Contact";
import Testimonials from "../../pages/admin/Testimonials";
import GalleryManagement from "../../pages/admin/GalleryManagement.jsx";
import Videos from "../../pages/admin/Videos";
import Skills from "../../pages/admin/Skills";
import Offers from "../../pages/admin/Offers";
import Placements from "../../pages/admin/Placements";
import GalleryEvents from "../../pages/admin/GalleryEvents";

export default function AppRoutes() {
  return (
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
        path="/student-projects"
        element={
          <ProtectedRoute>
            <StudentProjects />
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
      <Route
        path="/gallery"
        element={
          <ProtectedRoute>
            <GalleryManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/videos"
        element={
          <ProtectedRoute>
            <Videos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/skills"
        element={
          <ProtectedRoute>
            <Skills />
          </ProtectedRoute>
        }
      />
      <Route
        path="/offers"
        element={
          <ProtectedRoute>
            <Offers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/placements"
        element={
          <ProtectedRoute>
            <Placements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gallery-events"
        element={
          <ProtectedRoute>
            <GalleryEvents />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
