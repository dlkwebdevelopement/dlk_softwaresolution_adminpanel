import { useEffect, useState } from "react";
import {
  PlusCircle,
  Trash2,
  Edit2,
  Check,
  X,
  HelpCircle,
  MessageSquare,
  Search,
  ChevronDown
} from "lucide-react";
import {
  GetRequest,
  PostRequest,
  DeleteRequest,
  PutRequest,
} from "../../apis/api";
import {
  ADMIN_ADD_QUESTION,
  ADMIN_ADD_ANSWER,
  ADMIN_GET_ALL_QUESTIONS,
  ADMIN_UPDATE_QUESTION,
  ADMIN_UPDATE_ANSWER,
  ADMIN_DELETE_QUESTION,
  ADMIN_DELETE_ANSWER,
} from "../../apis/endpoints";

export default function Faq() {
  const [questions, setQuestions] = useState([]);
  const [qVal, setQVal] = useState("");
  const [ansVal, setAnsVal] = useState("");
  const [selectedQ, setSelectedQ] = useState(null);
  const [editingQ, setEditingQ] = useState(null);
  const [editingA, setEditingA] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [expandedQ, setExpandedQ] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetch = async () => setQuestions(await GetRequest(ADMIN_GET_ALL_QUESTIONS));
  useEffect(() => { fetch(); }, []);

  const addQuestion = async () => {
    if (!qVal.trim()) return;
    await PostRequest(ADMIN_ADD_QUESTION, { question: qVal });
    setQVal(""); fetch();
    setShowForm(false);
  };

  const addAnswer = async () => {
    if (!ansVal.trim() || !selectedQ) return;
    await PostRequest(ADMIN_ADD_ANSWER, { answer: ansVal, question_id: selectedQ });
    setAnsVal(""); 
    setExpandedQ(selectedQ); // Expand to show the newly added answer
    fetch();
    setShowForm(false);
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
    if (selectedQ === id) setSelectedQ(null);
    if (expandedQ === id) setExpandedQ(null);
  };

  const removeAnswer = async (id) => {
    if (!confirm("Delete answer?")) return;
    await DeleteRequest(ADMIN_DELETE_ANSWER(id)); fetch();
  };

  const toggleExpand = (id) => {
    if (editingQ) return; // Don't toggle while editing
    setExpandedQ(expandedQ === id ? null : id);
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in py-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">FAQ Management</h1>
          <p className="text-slate-500">Create, edit and manage frequently asked questions and answers.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
            showForm 
              ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-slate-100' 
              : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-100'
          }`}
        >
          {showForm ? <X size={20} /> : <PlusCircle size={20} />}
          {showForm ? "Cancel & Close" : "Add FAQ Item"}
        </button>
      </div>

      {/* FORM SECTION */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-10 overflow-hidden animate-slide-up">
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Question Side */}
              <div className="border border-slate-200 rounded-xl p-6 bg-slate-50">
                  <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-brand-600" />
                    Add New Question
                  </h2>
                  
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={qVal}
                      onChange={(e) => setQVal(e.target.value)}
                      placeholder="Enter new question..."
                      className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all hover:bg-white"
                      onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
                    />
                    <button 
                      onClick={addQuestion}
                      disabled={!qVal.trim()}
                      className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
                    >
                      Publish Question
                    </button>
                  </div>
              </div>

              {/* Add Answer Side */}
              <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 relative">
                  <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-brand-600" />
                    Add Answer
                  </h2>
                  
                  <div className="space-y-4">
                    <textarea
                      value={ansVal}
                      onChange={(e) => setAnsVal(e.target.value)}
                      placeholder={selectedQ ? "Enter answer for selected question..." : "Select a question from the list below first to answer it..."}
                      disabled={!selectedQ}
                      rows={4}
                      className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed resize-none hover:bg-white"
                    />
                    <button 
                      onClick={addAnswer}
                      disabled={!ansVal.trim() || !selectedQ}
                      className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors shadow-sm mt-3"
                    >
                      Publish Answer
                    </button>
                  </div>
                  
                  {selectedQ && (
                    <div className="absolute top-6 right-6 text-xs text-brand-700 bg-brand-50 border border-brand-200 rounded-md p-2 flex items-center gap-2 shadow-sm font-medium">
                      <span>Answering selected question</span>
                      <button 
                        onClick={() => setSelectedQ(null)}
                        className="p-1 hover:bg-brand-100 rounded text-brand-500 hover:text-brand-800"
                        title="Clear selection"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIST VIEW SECTION */}
      {!showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/30">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Available FAQs</h2>
                  <p className="text-sm text-slate-500">Manage {questions.length} FAQ entries effectively</p>
                </div>
              </div>
              
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions or answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all hover:bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-[45%]">Question</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Responses</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions
                  .filter(q => 
                    q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    q.answers?.some(a => a.answer.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 relative">
                      {editingQ === q.id ? (
                        <div className="flex items-center gap-2 max-w-[400px]" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editVal}
                            onChange={(e) => setEditVal(e.target.value)}
                            className="flex-1 rounded-md border-slate-300 border px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && saveQuestion(q.id)}
                          />
                          <button onClick={() => saveQuestion(q.id)} className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md shadow-sm transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={cancelEdit} className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md shadow-sm transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-semibold text-slate-800 break-words mb-1 flex items-start gap-2">
                            {q.question}
                          </p>
                          {/* Expanded Answers View */}
                          {expandedQ === q.id && (
                            <div className="mt-4 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Answers</p>
                              {q.answers?.length === 0 ? (
                                <p className="text-sm text-slate-400 italic">No answers provided yet.</p>
                              ) : (
                                q.answers?.map((a) => (
                                  <div key={a.id} className="group/ans flex gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                                     {editingA === a.id ? (
                                        <div className="flex items-start gap-2 w-full">
                                          <textarea
                                            value={editVal}
                                            onChange={(e) => setEditVal(e.target.value)}
                                            className="flex-1 rounded-md border-slate-300 border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[60px]"
                                            autoFocus
                                          />
                                          <div className="flex flex-col gap-1 shrink-0">
                                            <button onClick={() => saveAnswer(a.id)} className="p-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded"><Check className="w-4 h-4" /></button>
                                            <button onClick={cancelEdit} className="p-1 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded"><X className="w-4 h-4" /></button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex-1 text-sm text-slate-600 whitespace-pre-wrap">{a.answer}</div>
                                          <div className="flex flex-col gap-1 opacity-0 group-hover/ans:opacity-100 transition-opacity shrink-0">
                                            <button onClick={() => startEditAnswer(a)} className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded" title="Edit Answer"><Edit2 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => removeAnswer(a.id)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete Answer"><Trash2 className="w-3.5 h-3.5" /></button>
                                          </div>
                                        </>
                                      )}
                                  </div>
                                ))
                              )}
                              
                              <div className="pt-2 flex">
                                <button
                                  onClick={() => {
                                    setSelectedQ(q.id);
                                    setShowForm(true);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors flex items-center gap-1.5 border border-brand-100"
                                >
                                  <MessageSquare size={14} /> Add Another Answer
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => toggleExpand(q.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                           q.answers?.length > 0 
                            ? (expandedQ === q.id ? 'bg-brand-100 text-brand-700 border-brand-200' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:border-slate-300')
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {q.answers?.length || 0} Answers
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedQ === q.id ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${
                        selectedQ === q.id
                          ? 'bg-brand-50 text-brand-700 border-brand-200'
                          : (q.answers?.length > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200')
                      }`}>
                        {selectedQ === q.id ? 'In Editor' : (q.answers?.length > 0 ? 'Answered' : 'Unanswered')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 outline-none">
                        <button
                          onClick={() => {
                            setSelectedQ(selectedQ === q.id ? null : q.id);
                            if (selectedQ !== q.id) {
                              setShowForm(true);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className={`p-2 rounded-lg transition-colors border shadow-sm ${
                            selectedQ === q.id 
                               ? 'bg-brand-50 text-brand-600 border-brand-200 hover:bg-brand-100' 
                               : 'bg-white text-slate-500 border-slate-200 hover:border-brand-300 hover:text-brand-600'
                          }`}
                          title="Select to add answer"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEditQuestion(q)}
                          className="p-2 bg-white text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-lg transition-colors border border-slate-200 shadow-sm"
                          title="Edit Question"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="p-2 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors border border-slate-200 shadow-sm"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {questions.length > 0 && questions.filter(q => 
                  q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  q.answers?.some(a => a.answer.toLowerCase().includes(searchTerm.toLowerCase()))
                ).length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                      No FAQs found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
