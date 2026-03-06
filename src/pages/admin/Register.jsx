// Register.jsx
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
  PersonOutlined,
  EmailOutlined,
  PhoneOutlined,
  SchoolOutlined,
  ScheduleOutlined,
  DeleteOutline,
  HowToRegOutlined,
} from "@mui/icons-material";
import { GetRequest } from "../../apis/config";
import { ADMIN_GET_REGISTER } from "../../apis/endpoints";

export default function Register() {
  const [list, setList] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await GetRequest(ADMIN_GET_REGISTER);
        setList(data);
      } catch (err) {
        console.error("Failed to fetch registrations:", err);
      }
    })();
  }, []);

  return (
    <Box sx={{ mx: "auto" }}>
      <Typography
        variant="h4"
        sx={{ mb: 1, fontWeight: 700, color: "#1e293b" }}
      >
        Course Registrations
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#64748b" }}>
        View and manage all course registrations.
      </Typography>

      <Card
        sx={{
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <HowToRegOutlined color="primary" />
            <Typography variant="h6">
              All Registrations ({list.length})
            </Typography>
          </Box>

          {list.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <HowToRegOutlined
                sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary">
                No registrations yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Course registrations will appear here
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {list.map((r, index) => (
                <Card
                  key={r.id || index}
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
                  {/* HEADER */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{ width: 36, height: 36, bgcolor: "#3b82f6" }}
                      >
                        <PersonOutlined fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {r.fullName}
                        </Typography>

                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <EmailOutlined fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            {r.email}
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <PhoneOutlined fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            {r.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Chip
                      label="Registered"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  {/* DETAILS */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SchoolOutlined fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {r.courseName || "Course"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* FOOTER */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Registration received
                    </Typography>
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
