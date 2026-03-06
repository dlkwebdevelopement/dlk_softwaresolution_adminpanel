import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Collapse,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import {
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  SubdirectoryArrowRight as SubcategoryIcon,
  Photo as BannerIcon,
  Business as CompanyIcon,
  ContactMail as EnquiryIcon,
  Help as FaqIcon,
  Work as HiringIcon,
  Home as HomeIcon,
  ExpandLess,
  ExpandMore,
  ContactMailTwoTone,
  CommentSharp,
  LiveHelpRounded,
  NewLabel,
} from "@mui/icons-material";
import { useState } from "react";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Categories", icon: <CategoryIcon />, path: "/categories" },
  { text: "Subcatdegories", icon: <SubcategoryIcon />, path: "/subcategories" },
  { text: "Banners", icon: <BannerIcon />, path: "/banners" },
  { text: "Company", icon: <CompanyIcon />, path: "/company" },
  { text: "Hiring Comps", icon: <HiringIcon />, path: "/hiring" },
  { text: "Enquiries", icon: <EnquiryIcon />, path: "/enquiries" },
  { text: "Registrations", icon: <GroupAddIcon />, path: "/register" },
  { text: "Live Classes", icon: <LiveHelpRounded />, path: "/liveclass" },
  { text: "Blogs", icon: <NewLabel />, path: "/blogs" },
  { text: "FAQ", icon: <FaqIcon />, path: "/faq" },
  { text: "Testimonial", icon: <CommentSharp />, path: "/Testimonial" },
];

const Sidebar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const handleToggle = () => setOpen(!open);

  return (
    <Box
      sx={{
        width: 250,
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "#1e293b",
        color: "white",
        paddingTop: "64px",
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        zIndex: 1200,

        overflowY: "auto", // ✅ Enable vertical scroll
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(255,255,255,0.2)",
          borderRadius: "10px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "rgba(255,255,255,0.3)",
        }, // Optional (clean)
      }}
    >
      <Box sx={{ px: 2, py: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: "#94a3b8",
            fontSize: "0.75rem",
            fontWeight: 600,
            mb: 1,
          }}
        >
          MAIN MENU
        </Typography>
      </Box>

      <List sx={{ px: 1 }}>
        {/* HOME ITEM */}
        <ListItemButton onClick={handleToggle} sx={{ mx: 1, mb: 0.5 }}>
          <Box
            sx={{
              color: "inherit",
              mr: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <HomeIcon />
          </Box>
          <ListItemText
            primary="Home"
            primaryTypographyProps={{
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        {/* COLLAPSIBLE SUB-MENU */}
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.text}
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: "8px",
                  mx: 2,
                  mb: 0.5,
                  pl: 4,
                  color: location.pathname.includes(item.path.toLowerCase())
                    ? "#3b82f6"
                    : "#cbd5e1",
                  backgroundColor: location.pathname.includes(
                    item.path.toLowerCase(),
                  )
                    ? "rgba(59, 130, 246, 0.1)"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: location.pathname.includes(
                      item.path.toLowerCase(),
                    )
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(255,255,255,0.05)",
                  },
                }}
              >
                <Box
                  sx={{
                    color: "inherit",
                    mr: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {item.icon}
                </Box>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: "inherit",
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* COURSES ITEM */}
        <ListItemButton
          onClick={() => setCoursesOpen(!coursesOpen)}
          sx={{ mx: 1, mb: 0.5 }}
        >
          <Box
            sx={{
              color: "inherit",
              mr: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <CategoryIcon />
          </Box>

          <ListItemText
            primary="Courses"
            primaryTypographyProps={{
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          />

          {coursesOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        {/* COURSES SUBMENU */}
        <Collapse in={coursesOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              component={Link}
              to="/courses"
              sx={{
                borderRadius: "8px",
                mx: 2,
                mb: 0.5,
                pl: 4,
                color: location.pathname.includes("/courses/details")
                  ? "#3b82f6"
                  : "#cbd5e1",
                backgroundColor: location.pathname.includes("/courses/details")
                  ? "rgba(59, 130, 246, 0.1)"
                  : "transparent",
                "&:hover": {
                  backgroundColor: location.pathname.includes(
                    "/courses/details",
                  )
                    ? "rgba(59, 130, 246, 0.15)"
                    : "rgba(255,255,255,0.05)",
                },
              }}
            >
              <ListItemText
                primary="Course Details"
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                }}
              />
            </ListItemButton>
          </List>
        </Collapse>


        {/* Contacts */}
        <ListItemButton
          onClick={() => setContactOpen(!contactOpen)}
          sx={{ mx: 1, mb: 0.5 }}
        >
          <Box
            sx={{
              color: "inherit",
              mr: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <ContactMailTwoTone />
          </Box>

          <ListItemText
            primary="Contact"
            primaryTypographyProps={{
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          />

          {contactOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        {/* COURSES SUBMENU */}
        <Collapse in={contactOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              component={Link}
              to="/contacts"
              sx={{
                borderRadius: "8px",
                mx: 2,
                mb: 0.5,
                pl: 4,
                color: location.pathname.includes("/contact")
                  ? "#3b82f6"
                  : "#cbd5e1",
                backgroundColor: location.pathname.includes("/contact")
                  ? "rgba(59, 130, 246, 0.1)"
                  : "transparent",
                "&:hover": {
                  backgroundColor: location.pathname.includes(
                    "/contact",
                  )
                    ? "rgba(59, 130, 246, 0.15)"
                    : "rgba(255,255,255,0.05)",
                },
              }}
            >
              <ListItemText
                primary="Contact messages"
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                }}
              />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Box>
  );
};

export default Sidebar;
