import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";
import { GetRequest } from "../../apis/config";
import { 
  ADMIN_GET_CATEGORIES, 
  ADMIN_GET_SUBCATEGORIES, 
  ADMIN_GET_ENQUIRIES, 
  ADMIN_GET_ALL_QUESTIONS 
} from "../../apis/endpoints";
import {
  Category as CategoryIcon,
  SubdirectoryArrowRight as SubcategoryIcon,
  ContactMail as EnquiryIcon,
  Help as FaqIcon,
  TrendingUp as TrendingUpIcon
} from "@mui/icons-material";

const StatCard = ({ title, count, icon, color }) => (
  <Card sx={{ 
    height: "100%", 
    width: 200,
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    }
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box>
          <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
            {count}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1,
            borderRadius: "8px",
            backgroundColor: `${color}.50`,
            color: `${color}.500`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <TrendingUpIcon sx={{ fontSize: 16, color: "#10b981" }} />
        <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 600 }}>
          Active
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    cats: 0,
    subs: 0,
    enquiries: 0,
    faqs: 0,
  });

  const fetch = async () => {
    try {
      const cats = await GetRequest(ADMIN_GET_CATEGORIES);
      const subs = await GetRequest(ADMIN_GET_SUBCATEGORIES);
      const enquiries = await GetRequest(ADMIN_GET_ENQUIRIES);
      const faqs = await GetRequest(ADMIN_GET_ALL_QUESTIONS);

      setCounts({
        cats: Array.isArray(cats) ? cats.length : cats?.data?.length || 0,
        subs: Array.isArray(subs) ? subs.length : subs?.data?.length || 0,
        enquiries: Array.isArray(enquiries) ? enquiries.length : enquiries?.data?.length || 0,
        faqs: Array.isArray(faqs) ? faqs.length : faqs?.data?.length || 0,
      });
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: "#1e293b" }}>
        Dashboard Overview
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#64748b" }}>
        Welcome back! Here's what's happening with your store today.
      </Typography>

      {/* Stats cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Categories" count={counts.cats} icon={<CategoryIcon />}/>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Subcategories" count={counts.subs} icon={<SubcategoryIcon />}  />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Enquiries" count={counts.enquiries} icon={<EnquiryIcon />}/>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="FAQ Items" count={counts.faqs} icon={<FaqIcon />}  />
        </Grid>
      </Grid>

      {/* Quick actions */}
      <Card sx={{ mt: 4, boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#1e293b" }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {[
              { label: "Add Category", path: "/categories" },
              { label: "Manage Banners", path: "/banners" },
              { label: "View Enquiries", path: "/enquiries" },
              { label: "Update FAQ", path: "/faq" },
            ].map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                      borderColor: "#3b82f6",
                    },
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {action.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
