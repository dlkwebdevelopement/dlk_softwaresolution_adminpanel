// Faq.jsx - Enhanced UI
import { useEffect, useState } from "react";
import {
  Trash2,
  Edit2,
  Check,
  X,
  ChevronDown,
  HelpCircle,
  Plus,
  MessageSquareQuoted
} from "lucide-react";
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

export default function Faq() {
  const [questions, setQuestions] = useState([]);
  const [qVal, setQVal] = useState("");
  const [ansVal, setAnsVal] = useState("");
  const [selectedQ, setSelectedQ] = useState(null);
  const [editingQ, setEditingQ] = useState(null);
  const [editingA, setEditingA] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [expandedQ, setExpandedQ] = useState(null);

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
    setAnsVal(""); 
    setExpandedQ(selectedQ); // Expand to show the newly added answer
    fetch();
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
    <div className="max-w-[1200px] mx-auto animate-fade-in py-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">FAQ Management</h1>
        <p className="text-slate-500">Manage frequently asked questions and answers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Add Forms */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-600" />
              Add New Question
            </h2>
            
            <div className="flex gap-3 flex-col sm:flex-row mb-8">
              <input
                type="text"
                value={qVal}
                onChange={(e) => setQVal(e.target.value)}
                placeholder="Enter new question..."
                className="flex-1 rounded-lg border-slate-200 border px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
              />
              <button 
                onClick={addQuestion}
                disabled={!qVal.trim()}
                className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-2 px-5 rounded-lg transition-colors shrink-0"
              >
                Add
              </button>
            </div>

            <hr className="border-slate-100 my-6" />

            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <MessageSquareQuoted className="w-5 h-5 text-brand-600" />
              Add Answer
            </h2>
            
            <div className="flex gap-3 flex-col sm:flex-row">
              <textarea
                value={ansVal}
                onChange={(e) => setAnsVal(e.target.value)}
                placeholder={selectedQ ? "Enter answer..." : "Select a question first..."}
                disabled={!selectedQ}
                rows={3}
                className="flex-1 rounded-lg border-slate-200 border px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
              />
              <button 
                onClick={addAnswer}
                disabled={!ansVal.trim() || !selectedQ}
                className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-2 px-5 rounded-lg transition-colors shrink-0 h-fit"
              >
                Add
              </button>
            </div>
            
            {!selectedQ && (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-md p-2 mt-3 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                Select a question from the list to add an answer
              </p>
            )}
            {selectedQ && (
              <div className="text-sm text-brand-700 bg-brand-50 border border-brand-100 rounded-md p-2 mt-3 flex items-center justify-between gap-2">
                <span className="truncate flex-1">
                  Adding answer to selected question
                </span>
                <button 
                  onClick={() => setSelectedQ(null)}
                  className="text-brand-500 hover:text-brand-800 shrink-0"
                  title="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Q&A List */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2 relative z-10">
              <HelpCircle className="w-5 h-5 text-brand-600" />
              Questions & Answers 
              <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-sm font-medium ml-1">
                {questions.length}
              </span>
            </h2>

            {questions.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center">
                <HelpCircle className="w-12 h-12 text-slate-300 mb-3" />
                <h3 className="text-slate-700 font-medium text-lg mb-1">No questions yet</h3>
                <p className="text-slate-500 text-sm">Add your first FAQ question to get started</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {questions.map((q) => (
                  <div 
                    key={q.id} 
                    className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                      expandedQ === q.id 
                        ? 'border-brand-200 shadow-sm bg-white' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    } ${
                      selectedQ === q.id ? 'ring-1 ring-brand-500' : ''
                    }`}
                  >
                    {/* Accordion Header */}
                    <div 
                      className={`flex items-center justify-between p-4 cursor-pointer select-none transition-colors ${
                        expandedQ === q.id ? 'bg-slate-50/50' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => toggleExpand(q.id)}
                    >
                      {editingQ === q.id ? (
                        <div className="flex items-center gap-2 w-full pr-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editVal}
                            onChange={(e) => setEditVal(e.target.value)}
                            className="flex-1 rounded-md border-slate-300 border px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && saveQuestion(q.id)}
                          />
                          <button
                            onClick={() => saveQuestion(q.id)}
                            className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <h3 className={`font-medium pr-4 ${expandedQ === q.id ? 'text-brand-700' : 'text-slate-800'}`}>
                            {q.question}
                          </h3>
                          
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              {q.answers?.length || 0} ans
                            </span>
                            
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => startEditQuestion(q)}
                                className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                                title="Edit Question"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeQuestion(q.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete Question"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <ChevronDown 
                              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                                expandedQ === q.id ? 'rotate-180 text-brand-500' : ''
                              }`} 
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Accordion Body */}
                    {expandedQ === q.id && (
                      <div className="p-4 border-t border-slate-100 bg-white">
                        {q.answers?.length === 0 ? (
                          <div className="text-sm text-slate-500 italic py-2">
                            No answers yet. Expand the form on the left to add one.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {q.answers?.map((a) => (
                              <div
                                key={a.id}
                                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 group"
                              >
                                {editingA === a.id ? (
                                  <div className="flex items-start gap-2 w-full">
                                    <textarea
                                      value={editVal}
                                      onChange={(e) => setEditVal(e.target.value)}
                                      className="flex-1 rounded-md border-slate-300 border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
                                      autoFocus
                                    />
                                    <div className="flex flex-col gap-1 shrink-0">
                                      <button
                                        onClick={() => saveAnswer(a.id)}
                                        className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md transition-colors"
                                        title="Save"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={cancelEdit}
                                        className="p-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-md transition-colors"
                                        title="Cancel"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex-1 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                      {a.answer}
                                    </div>
                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                      <button 
                                        onClick={() => startEditAnswer(a)}
                                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                                        title="Edit Answer"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => removeAnswer(a.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Delete Answer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={() => setSelectedQ(selectedQ === q.id ? null : q.id)}
                            className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${
                              selectedQ === q.id 
                                ? 'bg-brand-100 text-brand-700 hover:bg-brand-200' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {selectedQ === q.id ? 'Selected for Answer' : 'Select to Add Answer'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}