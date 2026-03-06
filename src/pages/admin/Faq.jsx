// Faq.jsx - Enhanced UI
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  GetRequest,
  PostRequest,
  DeleteRequest,
  PutRequest,
} from "../../apis/config";
import {
  ADMIN_ADD_QUESTION,
  ADMIN_ADD_ANSWER,
  ADMIN_GET_ALL_QUESTIONS,
  ADMIN_UPDATE_QUESTION,
  ADMIN_UPDATE_ANSWER,
  ADMIN_DELETE_QUESTION,
  ADMIN_DELETE_ANSWER,
} from "../../apis/endpoints";
import { HelpOutlined, AddOutlined, QuestionAnswerOutlined } from "@mui/icons-material";

export default function Faq() {
  const [questions, setQuestions] = useState([]);
  const [qVal, setQVal] = useState("");
  const [ansVal, setAnsVal] = useState("");
  const [selectedQ, setSelectedQ] = useState(null);
  const [editingQ, setEditingQ] = useState(null);
  const [editingA, setEditingA] = useState(null);
  const [editVal, setEditVal] = useState("");

  const fetch = async () => setQuestions(await GetRequest(ADMIN_GET_ALL_QUESTIONS));
  useEffect(() => { fetch(); }, []);

  const addQuestion = async () => {
    if (!qVal.trim()) return;
    await PostRequest(ADMIN_ADD_QUESTION, { question: qVal });
    setQVal(""); fetch();
  };

  const addAnswer = async () => {
    if (!ansVal.trim() || !selectedQ) return;
    await PostRequest(ADMIN_ADD_ANSWER, { answer: ansVal, question_id: selectedQ });
    setAnsVal(""); fetch();
  };

  const startEditQuestion = (q) => { setEditingQ(q.id); setEditVal(q.question); };
  const saveQuestion = async (id) => {
    if (!editVal.trim()) return;
    await PutRequest(ADMIN_UPDATE_QUESTION(id), { question: editVal.trim() });
    cancelEdit(); fetch();
  };

  const startEditAnswer = (a) => { setEditingA(a.id); setEditVal(a.answer); };
  const saveAnswer = async (id) => {
    if (!editVal.trim()) return;
    await PutRequest(ADMIN_UPDATE_ANSWER(id), { answer: editVal.trim() });
    cancelEdit(); fetch();
  };

  const cancelEdit = () => { setEditingQ(null); setEditingA(null); setEditVal(""); };

  const removeQuestion = async (id) => {
    if (!confirm("Delete question?")) return;
    await DeleteRequest(ADMIN_DELETE_QUESTION(id)); fetch();
  };

  const removeAnswer = async (id) => {
    if (!confirm("Delete answer?")) return;
    await DeleteRequest(ADMIN_DELETE_ANSWER(id)); fetch();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: "#1e293b" }}>
        FAQ Management
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#64748b" }}>
        Manage frequently asked questions and answers
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", height: "fit-content" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <AddOutlined color="primary" />
                Add New Question
              </Typography>
              
              <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                <TextField
                  value={qVal}
                  onChange={(e) => setQVal(e.target.value)}
                  placeholder="Enter new question..."
                  fullWidth
                  size="small"
                />
                <Button variant="contained" onClick={addQuestion} sx={{ minWidth: 80 }}>
                  Add
                </Button>
              </Box>

              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <QuestionAnswerOutlined color="primary" />
                Add Answer
              </Typography>
              
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  value={ansVal}
                  onChange={(e) => setAnsVal(e.target.value)}
                  placeholder="Enter answer..."
                  fullWidth
                  size="small"
                />
                <Button 
                  variant="contained" 
                  onClick={addAnswer}
                  disabled={!selectedQ}
                  sx={{ minWidth: 80 }}
                >
                  Add
                </Button>
              </Box>
              
              {!selectedQ && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  Select a question first to add answer
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <HelpOutlined color="primary" />
                Questions & Answers ({questions.length})
              </Typography>

              {questions.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center", backgroundColor: "#f8fafc" }}>
                  <HelpOutlined sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No questions yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add your first FAQ question to get started
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {questions.map((q) => (
                    <Accordion 
                      key={q.id}
                      elevation={1}
                      sx={{ 
                        border: "1px solid #e2e8f0",
                        '&:before': { display: 'none' },
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                          <Typography sx={{ fontWeight: 600, flex: 1 }}>
                            {editingQ === q.id ? (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                                <TextField
                                  value={editVal}
                                  onChange={(e) => setEditVal(e.target.value)}
                                  size="small"
                                  fullWidth
                                />
                                <IconButton color="success" onClick={() => saveQuestion(q.id)} size="small">
                                  <CheckIcon />
                                </IconButton>
                                <IconButton color="error" onClick={cancelEdit} size="small">
                                  <CloseIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              q.question
                            )}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.5, ml: 2 }}>
                            <Chip 
                              label={`${q.answers?.length || 0} answers`} 
                              size="small" 
                              variant="outlined"
                            />
                            {editingQ !== q.id && (
                              <>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); startEditQuestion(q); }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {q.answers?.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No answers yet. Add an answer to this question.
                          </Typography>
                        ) : (
                          q.answers?.map((a) => (
                            <Box
                              key={a.id}
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1,
                                mb: 1,
                                p: 1,
                                borderRadius: "6px",
                                backgroundColor: "#f8fafc",
                              }}
                            >
                              {editingA === a.id ? (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                                  <TextField
                                    value={editVal}
                                    onChange={(e) => setEditVal(e.target.value)}
                                    size="small"
                                    fullWidth
                                    multiline
                                    rows={2}
                                  />
                                  <IconButton color="success" onClick={() => saveAnswer(a.id)} size="small">
                                    <CheckIcon />
                                  </IconButton>
                                  <IconButton color="error" onClick={cancelEdit} size="small">
                                    <CloseIcon />
                                  </IconButton>
                                </Box>
                              ) : (
                                <>
                                  <Typography variant="body2" sx={{ flexGrow: 1, lineHeight: 1.6 }}>
                                    {a.answer}
                                  </Typography>
                                  <Box sx={{ display: "flex", gap: 0.5 }}>
                                    <IconButton size="small" onClick={() => startEditAnswer(a)}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => removeAnswer(a.id)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </>
                              )}
                            </Box>
                          ))
                        )}
                        
                        <Button
                          size="small"
                          variant={selectedQ === q.id ? "contained" : "outlined"}
                          onClick={() => setSelectedQ(selectedQ === q.id ? null : q.id)}
                          sx={{ mt: 1 }}
                        >
                          {selectedQ === q.id ? "Selected for Answer" : "Select for Answer"}
                        </Button>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}