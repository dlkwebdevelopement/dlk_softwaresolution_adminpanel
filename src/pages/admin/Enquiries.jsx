// Enquiries.jsx - Fully Furnished UI
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  ContactMailOutlined,
  EmailOutlined,
  PersonOutlined,
  PhoneOutlined,
  LocationOnOutlined,
  ScheduleOutlined,
  SchoolOutlined,
  DeleteOutline,
} from "@mui/icons-material";
import { GetRequest } from "../../apis/config";
import { ADMIN_GET_ENQUIRIES } from "../../apis/endpoints";

export default function Enquiries() {
  const [list, setList] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await GetRequest(ADMIN_GET_ENQUIRIES);
        setList(data);
      } catch (err) {
        console.error("Failed to fetch enquiries:", err);
      }
    })();
  }, []);

  return (
    <Box sx={{ mx: "auto"}}>
      <Typography
        variant="h4"
        sx={{ mb: 1, fontWeight: 700, color: "#1e293b" }}
      >
        Customer Enquiries
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#64748b" }}>
        Manage and respond to customer inquiries efficiently.
      </Typography>

      <Card sx={{ boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <ContactMailOutlined color="primary" />
            <Typography variant="h6">All Enquiries ({list.length})</Typography>
          </Box>

          {list.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <EmailOutlined sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No enquiries yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customer enquiries will appear here
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {list.map((e, index) => (
                <Card
                  key={e.id || index}
                  variant="outlined"
                  sx={{
                    p: 2,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                      borderColor: "#3b82f6",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: "#3b82f6" }}>
                        <PersonOutlined fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {e.name || "Anonymous User"}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <EmailOutlined fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            {e.email || "No email"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PhoneOutlined fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            {e.mobile || "No mobile"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Chip label="New" size="small" color="primary" variant="outlined" />
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SchoolOutlined fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {e.course || "N/A"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationOnOutlined fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {e.location || "N/A"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ScheduleOutlined fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {e.timeslot || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  {e.message && (
                    <Typography
                      variant="body2"
                      sx={{ color: "#475569", lineHeight: 1.6, mt: 2 }}
                    >
                      {e.message}
                    </Typography>
                  )}

                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Received recently
                    </Typography>
                    <Tooltip title="Delete Enquiry">
                      <IconButton size="small" color="error">
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
