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
  ChevronDown,
  MessageCircle
} from "lucide-react";
import {
  GetRequest,
  PostRequest,
  DeleteRequest,
  PutRequest,
} from "../../apis/api";
import {
  ADMIN_ADD_QUESTION,
  ADMIN_GET_ALL_QUESTIONS,
  ADMIN_UPDATE_QUESTION,
  ADMIN_DELETE_QUESTION,
} from "../../apis/endpoints";

export default function Faq() {
  const [questions, setQuestions] = useState([]);
  const [qVal, setQVal] = useState("");
  const [ansVal, setAnsVal] = useState("");
  const [editingQ, setEditingQ] = useState(null);
  const [editQVal, setEditQVal] = useState("");
  const [editAnsVal, setEditAnsVal] = useState("");
  const [expandedQ, setExpandedQ] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetch = async () => {
    try {
      const data = await GetRequest(ADMIN_GET_ALL_QUESTIONS);
      setQuestions(data || []);
    } catch (err) {
      console.error("Fetch FAQ error:", err);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleAddFaq = async () => {
    if (!qVal.trim() || !ansVal.trim()) {
      alert("Both question and answer are required");
      return;
    }
    try {
      await PostRequest(ADMIN_ADD_QUESTION, { question: qVal, answer: ansVal });
      setQVal(""); 
      setAnsVal("");
      fetch();
      setShowForm(false);
      alert("New FAQ added successfully!");
    } catch (err) {
      console.error("Add FAQ error:", err);
      alert("Failed to add FAQ. Make sure both fields are filled.");
    }
  };

  const startEdit = (q) => { 
    setEditingQ(q._id || q.id); 
    setEditQVal(q.question || ""); 
    setEditAnsVal(q.answer || "");
  };

  const saveEdit = async (id) => {
    const trimmedQ = editQVal?.trim();
    const trimmedAns = editAnsVal?.trim();
    
    if (!trimmedQ || !trimmedAns) {
      alert("Both question and answer are required to save.");
      return;
    }

    try {
      const targetId = id || editingQ;
      await PutRequest(ADMIN_UPDATE_QUESTION(targetId), { 
        question: trimmedQ,
        answer: trimmedAns
      });
      setEditingQ(null);
      fetch();
      alert("Changes saved successfully!");
    } catch (err) {
      console.error("Update FAQ error:", err);
      alert("Failed to update FAQ. Error: " + (err.response?.data?.message || err.message));
    }
  };

  const cancelEdit = () => { 
    setEditingQ(null); 
    setEditQVal(""); 
    setEditAnsVal("");
  };

  const removeFaq = async (id) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await DeleteRequest(ADMIN_DELETE_QUESTION(id));
      fetch();
      alert("Deleted successfully.");
    } catch (err) {
      console.error("Delete FAQ error:", err);
      alert("Failed to delete.");
    }
  };

  const toggleExpand = (id) => {
    setExpandedQ(expandedQ === id ? null : id);
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in py-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">FAQ Management</h1>
          <p className="text-slate-500">Create, edit and manage your FAQ directory in one streamlined interface.</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (editingQ) cancelEdit();
          }}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
            showForm 
              ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-slate-100' 
              : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-100'
          }`}
        >
          {showForm ? <X size={20} /> : <PlusCircle size={20} />}
          {showForm ? "Cancel" : "Add New FAQ"}
        </button>
      </div>

      {/* FORM SECTION */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-10 overflow-hidden animate-slide-up">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-brand-600" />
              Create New FAQ Entry
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Question</label>
                <input
                  type="text"
                  value={qVal}
                  onChange={(e) => setQVal(e.target.value)}
                  placeholder="e.g. Do you provide certificates?"
                  className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Answer</label>
                <textarea
                  value={ansVal}
                  onChange={(e) => setAnsVal(e.target.value)}
                  placeholder="Type the answer here..."
                  rows={4}
                  className="w-full rounded-xl border-slate-200 border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddFaq}
                  disabled={!qVal.trim() || !ansVal.trim()}
                  className="px-8 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md shadow-brand-100"
                >
                  Publish FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIST VIEW SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in list-faq-container">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">FAQ Directory</h2>
                <p className="text-sm text-slate-500">{questions.length} entries total</p>
              </div>
            </div>
            
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Question & Answer Content</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {questions
                .filter(q => 
                  (q.question?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                  (q.answer?.toLowerCase() || "").includes(searchTerm.toLowerCase())
                )
                .map((q) => (
                <tr key={q._id || q.id} className={`transition-colors ${editingQ === (q._id || q.id) ? 'bg-brand-50/30' : 'hover:bg-slate-50/50'}`}>
                  <td className="px-6 py-5">
                    {editingQ === (q._id || q.id) ? (
                      <div className="space-y-4 max-w-3xl animate-slide-up">
                        <div className="bg-white p-4 rounded-xl border border-brand-100 shadow-sm">
                          <label className="block text-[10px] font-bold text-brand-600 uppercase mb-1">Question</label>
                          <input
                            type="text"
                            value={editQVal}
                            onChange={(e) => setEditQVal(e.target.value)}
                            className="w-full rounded-lg border-slate-200 border px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                            autoFocus
                          />
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-brand-100 shadow-sm">
                          <label className="block text-[10px] font-bold text-brand-600 uppercase mb-1">Answer</label>
                          <textarea
                            value={editAnsVal}
                            onChange={(e) => setEditAnsVal(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border-slate-200 border px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                            placeholder="Add or update the answer..."
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => saveEdit(q._id || q.id)} className="inline-flex items-center gap-1.5 px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">
                            <Check className="w-4 h-4" /> Save Changes
                          </button>
                          <button onClick={cancelEdit} className="inline-flex items-center gap-1.5 px-6 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition-all">
                            <X className="w-4 h-4" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-4xl">
                        <p className="text-sm font-bold text-slate-900 mb-3 flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-brand-100 text-brand-700 text-[10px] shrink-0 mt-0.5">Q</span>
                          {q.question}
                        </p>
                        <div className="flex items-start gap-2 pl-1">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 text-slate-500 text-[10px] shrink-0 mt-0.5">A</span>
                          <div className="flex-1">
                            {q.answer ? (
                              <>
                                <p className={`text-sm text-slate-600 leading-relaxed ${expandedQ === (q._id || q.id) ? '' : 'line-clamp-2'}`}>
                                  {q.answer}
                                </p>
                                {q.answer.length > 150 && (
                                  <button 
                                    onClick={() => toggleExpand(q._id || q.id)}
                                    className="mt-2 text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                                  >
                                    {expandedQ === (q._id || q.id) ? "Show Less" : "Read Full Answer"}
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedQ === (q._id || q.id) ? 'rotate-180' : ''}`} />
                                  </button>
                                )}
                              </>
                            ) : (
                              <div className="flex flex-col items-start gap-2">
                                <span className="text-slate-400 italic text-sm">No answer provided yet</span>
                                <button 
                                  onClick={() => startEdit(q)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-600 rounded-lg text-xs font-bold hover:bg-brand-100 transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  Add Answer Now
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right align-top">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(q)}
                        disabled={editingQ !== null}
                        className="p-2.5 bg-white text-slate-400 hover:text-brand-600 hover:bg-brand-50 hover:border-brand-200 rounded-xl transition-all border border-slate-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit FAQ"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFaq(q._id || q.id)}
                        disabled={editingQ !== null}
                        className="p-2.5 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all border border-slate-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {questions.length === 0 && (
                <tr>
                  <td colSpan="2" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <HelpCircle size={40} />
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold">No FAQ entries found</p>
                        <p className="text-slate-500 text-sm">Every great service starts with answering simple questions.</p>
                      </div>
                      <button 
                        onClick={() => setShowForm(true)}
                        className="px-6 py-2 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-100"
                      >
                        Create Your First FAQ
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
