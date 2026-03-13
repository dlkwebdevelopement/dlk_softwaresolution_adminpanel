import React, { useEffect, useState, useMemo } from "react";
import { 
  Trash2, 
  Mail, 
  Phone, 
  User, 
  Clock, 
  X, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  Send,
  Inbox,
  CheckCheck,
  ArrowLeft,
  BookOpen,
  Calendar,
  Filter,
  Tag,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { GetRequest, DeleteRequest, PostRequest, PatchRequest } from "../../apis/config";
import {
  ADMIN_GET_REGISTER,
  ADMIN_MARK_REGISTER_READ,
  ADMIN_REPLY_REGISTER,
  ADMIN_DELETE_REGISTER,
} from "../../apis/endpoints";

import { useLocation } from "react-router-dom";

const Register = () => {
  const location = useLocation();
  const [highlightId, setHighlightId] = useState(null);

  // Handle highlighting from notifications
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlight = params.get("highlight");
    if (highlight) {
      setHighlightId(highlight);
      const timer = setTimeout(() => {
        setHighlightId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // ✅ Navigation & Reply State
  const [view, setView] = useState("list"); // list, detail
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  
  // ✅ Filter & Pagination State
  const [filter, setFilter] = useState("all"); 
  const [typeFilter, setTypeFilter] = useState("all"); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await GetRequest(ADMIN_GET_REGISTER);
      setList(data || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await DeleteRequest(ADMIN_DELETE_REGISTER(deleteId));
      showToast("Registration deleted");
      setDeleteId(null);
      if (view === "detail") setView("list");
      fetchRegistrations();
    } catch (err) {
      showToast("Delete failed", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await PatchRequest(ADMIN_MARK_REGISTER_READ(id));
      setList(prev => prev.map(r => r.id === id ? { ...r, isRead: true } : r));
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setView("detail");
    if (!student.isRead) {
      handleMarkAsRead(student.id);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return showToast("Enter reply", "error");

    try {
      setIsSending(true);
      await PostRequest(ADMIN_REPLY_REGISTER, {
        id: selectedStudent.id,
        replyMessage: replyMessage
      });
      
      showToast("Update sent to student inbox");
      setReplyMessage("");
      fetchRegistrations();
      setSelectedStudent(prev => ({...prev, isReply: true, isRead: true}));
    } catch (err) {
      showToast("Send failed", "error");
    } finally {
      setIsSending(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: list.length,
      new: list.filter(r => !r.isRead).length,
      viewed: list.filter(r => r.isRead && !r.isReply).length,
      replied: list.filter(r => r.isReply).length,
    };
  }, [list]);

  const filteredList = useMemo(() => {
    return list.filter(r => {
      const statusMatch = filter === "all" || 
        (filter === "new" && !r.isRead) ||
        (filter === "viewed" && r.isRead && !r.isReply) ||
        (filter === "replied" && r.isReply);
      const typeMatch = typeFilter === "all" || r.inquiryType === typeFilter;
      return statusMatch && typeMatch;
    });
  }, [list, filter, typeFilter]);

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredList, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [filter, typeFilter]);
  
  // ✅ Highlight-Aware Pagination
  useEffect(() => {
    if (highlightId && filteredList.length > 0) {
      const recordIndex = filteredList.findIndex(item => item.id === highlightId);
      if (recordIndex !== -1) {
        const targetPage = Math.floor(recordIndex / itemsPerPage) + 1;
        setCurrentPage(targetPage);
      }
    }
  }, [highlightId, filteredList]);

  const inquiryTypes = ["Online Courses", "Corporate Training", "Career Services"];

  const getTypeColor = (type) => {
    switch (type) {
      case "Online Courses": return "sky";
      case "Corporate Training": return "emerald";
      case "Career Services": return "violet";
      default: return "slate";
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 animate-fade-in">
      
      {view === "list" ? (
        <>
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-1">Student Admissions</h1>
              <p className="text-slate-400 font-bold uppercase text-[12px] tracking-widest leading-relaxed">Registration Management System</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Type Filter */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${typeFilter === "all" ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  All Types
                </button>
                {inquiryTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${typeFilter === type ? `bg-${getTypeColor(type)}-500 text-white shadow-sm` : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {type.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl shadow-lg border border-slate-700">
                 {["all", "new", "viewed", "replied"].map((f) => (
                   <button
                     key={f}
                     onClick={() => setFilter(f)}
                     className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                   >
                     {f}
                   </button>
                 ))}
              </div>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { id: 'all', label: 'Total', count: stats.total, icon: User, color: 'slate' },
              { id: 'new', label: 'New', count: stats.new, icon: Inbox, color: 'amber' },
              { id: 'viewed', label: 'Viewed', count: stats.viewed, icon: Eye, color: 'brand' },
              { id: 'replied', label: 'Replied', count: stats.replied, icon: CheckCheck, color: 'blue' }
            ].map((card) => (
              <div 
                key={card.id}
                onClick={() => setFilter(card.id)}
                className={`group bg-white p-6 rounded-2xl border transition-all cursor-pointer ${filter === card.id ? `border-${card.color === 'brand' ? 'brand-500' : card.color + '-500'} shadow-md` : 'border-slate-100 shadow-sm hover:border-slate-200'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-${card.color === 'brand' ? 'brand' : card.color}-50 text-${card.color === 'brand' ? 'brand' : card.color}-500 flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <card.icon size={20} />
                  </div>
                  <span className={`text-[11px] font-black uppercase text-slate-300 tracking-wider`}>{card.label}</span>
                </div>
                <div className="text-2xl font-black text-slate-900">{card.count}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-24 flex flex-col items-center justify-center text-slate-400">
               <Loader2 className="w-12 h-12 animate-spin mb-6 text-brand-500" />
               <p className="font-bold text-base uppercase tracking-widest">Synchronizing Records...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex items-center gap-6 text-red-600">
              <AlertCircle size={28} />
              <p className="font-bold text-base tracking-tight">{error}</p>
              <button onClick={fetchRegistrations} className="ml-auto font-black uppercase tracking-widest text-[12px] bg-red-600 text-white px-6 py-3 rounded-xl transition-all active:scale-95">Retry Sync</button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 font-black text-[11px] text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Student Information</th>
                      <th className="px-8 py-5">Service Category</th>
                      <th className="px-8 py-5 hidden md:table-cell">Admission Details</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-base">
                    {paginatedList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-black uppercase text-[12px] tracking-widest italic">No registration records discovered in this sector</td>
                      </tr>
                    ) : (
                      paginatedList.map((student) => (
                        <tr 
                          key={student.id} 
                          className={`hover:bg-slate-50/80 transition-all group ${!student.isRead ? 'bg-amber-50/20' : ''} ${highlightId === student.id ? 'record-highlight border-y border-brand-500' : ''}`}
                        >
                          <td className="px-8 py-4">
                             {student.isReply ? (
                               <span className="inline-flex items-center gap-1.5 text-blue-600 text-[10px] font-black uppercase tracking-tighter">
                                 <CheckCheck size={12} /> Notified
                               </span>
                             ) : student.isRead ? (
                               <span className="inline-flex items-center gap-1.5 text-brand-600 text-[10px] font-black uppercase tracking-tighter">
                                 <Eye size={12} /> Processed
                               </span>
                             ) : (
                               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase animate-pulse">
                                 Pending Admission
                               </span>
                             )}
                          </td>
                          <td className="px-8 py-4 text-base">
                            <div>
                              <div className="font-black text-slate-800 leading-none mb-1.5">{student.fullName}</div>
                              <div className="text-[12px] font-bold text-slate-400 uppercase tracking-tight">{student.email}</div>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                             <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-${getTypeColor(student.inquiryType)}-50 text-${getTypeColor(student.inquiryType)}-600 border border-${getTypeColor(student.inquiryType)}-100 shadow-sm`}>
                                <Tag size={12}/>
                                {student.inquiryType || "General Admission"}
                             </span>
                          </td>
                          <td className="px-8 py-4 hidden md:table-cell">
                             <div className="flex items-center gap-2.5">
                                <BookOpen size={16} className="text-brand-500 opacity-70"/>
                                <span className="text-[14px] font-bold text-slate-600">{student.courseName}</span>
                             </div>
                             <div className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-1 shadow-none">
                                <Calendar size={10}/> {new Date(student.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                             </div>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button onClick={() => handleViewDetails(student)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all transform active:scale-90 shadow-sm border border-slate-100"><Eye size={18}/></button>
                              <button onClick={() => setDeleteId(student.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all transform active:scale-90 shadow-sm border border-slate-100"><Trash2 size={18}/></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* ✅ PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                   <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
                      Showing <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredList.length)}</span> of <span className="text-slate-900">{filteredList.length}</span> students
                   </p>
                   <div className="flex items-center gap-2">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-600 disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                         <ChevronLeft size={18} />
                      </button>
                      <div className="flex items-center gap-1 capitalize">
                         {[...Array(totalPages)].map((_, i) => (
                           <button
                             key={i}
                             onClick={() => setCurrentPage(i + 1)}
                             className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${currentPage === i + 1 ? 'bg-brand-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                           >
                              {i + 1}
                           </button>
                         ))}
                      </div>
                      <button 
                         disabled={currentPage === totalPages}
                         onClick={() => setCurrentPage(p => p + 1)}
                         className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-600 disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                         <ChevronRight size={18} />
                      </button>
                   </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* ✅ DETAIL VIEW (In-page) */
        <div className="animate-fade-in">
          <button 
            onClick={() => { setView("list"); }}
            className="flex items-center gap-2 mb-8 text-slate-400 hover:text-slate-900 transition-colors font-black uppercase text-[12px] tracking-widest"
          >
            <ArrowLeft size={20} /> Return to Directory
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Left Column: Student Details */}
             <div className="lg:col-span-1 space-y-8">
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm text-center">
                   <div className={`w-24 h-24 rounded-3xl bg-${getTypeColor(selectedStudent.inquiryType)}-50 border border-${getTypeColor(selectedStudent.inquiryType)}-100 flex items-center justify-center text-${getTypeColor(selectedStudent.inquiryType)}-600 mb-6 mx-auto shadow-sm`}>
                      <User size={48} />
                   </div>
                   <h2 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{selectedStudent.fullName}</h2>
                   <span className={`inline-block mb-8 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest bg-${getTypeColor(selectedStudent.inquiryType)}-500 text-white shadow-xl shadow-${getTypeColor(selectedStudent.inquiryType)}-100`}>
                      {selectedStudent.inquiryType || "General Admission"}
                   </span>
                   
                   <div className="space-y-4 text-left bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                      <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                         <Mail size={16} className="text-brand-500 shrink-0" />
                         <span className="truncate">{selectedStudent.email}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                         <Phone size={16} className="text-brand-500 shrink-0" />
                         <span>{selectedStudent.phone}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                         <Clock size={16} className="text-brand-500 shrink-0" />
                         <span>{new Date(selectedStudent.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                   </div>
                   
                   <button 
                     onClick={() => setDeleteId(selectedStudent.id)}
                     className="w-full mt-8 py-4 rounded-2xl border border-red-50 text-red-400 hover:bg-red-50 transition-all font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 group transform active:scale-[0.98]"
                   >
                     <Trash2 size={16} className="group-hover:rotate-12 transition-transform"/> Purge Applicant Data
                   </button>
                </div>

                <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl shadow-slate-200">
                   <h3 className="text-[11px] font-black uppercase tracking-widest text-brand-400 mb-5 leading-none">Registered Objective</h3>
                   <div className="flex items-start gap-4">
                      <BookOpen size={24} className="text-brand-500 mt-1 shrink-0"/>
                      <div>
                         <div className="font-bold text-xl leading-[1.2] mb-2">{selectedStudent.courseName}</div>
                         <div className="text-[11px] text-slate-500 font-black uppercase tracking-widest border-t border-slate-800 pt-2 float-none">Service Sector: {selectedStudent.inquiryType || "General"}</div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Right Column: Communication */}
             <div className="lg:col-span-2 space-y-8">
                {!selectedStudent.isReply ? (
                  <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6 px-1">
                       <h3 className="text-base font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                          Initiate Communications <Send size={18} className="text-brand-500"/>
                       </h3>
                    </div>
                    <form onSubmit={handleSendReply} className="space-y-5">
                       <textarea
                         required
                         placeholder={`Construct your response for ${selectedStudent.fullName}...`}
                         value={replyMessage}
                         onChange={(e) => setReplyMessage(e.target.value)}
                         className="w-full min-h-[220px] rounded-[24px] bg-slate-50 border-slate-200 p-6 text-base text-slate-900 focus:ring-8 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all placeholder:text-slate-300 font-medium leading-relaxed resize-none"
                       />
                       <button
                         type="submit"
                         disabled={isSending}
                         className="w-full py-5 rounded-2xl bg-brand-600 text-white font-black uppercase text-sm tracking-widest shadow-xl shadow-brand-100 hover:bg-brand-700 hover:shadow-brand-300 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                       >
                         {isSending ? <Loader2 size={20} className="animate-spin" /> : <>Dispatch Official Update <Send size={16}/></>}
                       </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-blue-50/50 rounded-[32px] p-12 border border-blue-100 flex flex-col items-center text-center animate-fade-in shadow-inner">
                    <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center text-blue-500 shadow-lg border border-blue-100 mb-6">
                      <CheckCheck size={40} />
                    </div>
                    <h4 className="font-black text-blue-900 text-sm uppercase tracking-widest mb-2">Protocol Finalized</h4>
                    <p className="text-blue-500/80 font-bold text-xs uppercase tracking-[0.05em] leading-relaxed">System has successfully logged and dispatched the notification<br/>to the student's primary communications terminal.</p>
                  </div>
                )}

                <div className="bg-amber-50 rounded-[32px] p-8 border border-amber-100 flex items-start gap-6">
                   <AlertCircle className="text-amber-500 shrink-0" size={24}/>
                   <div>
                      <h4 className="font-black text-amber-900 text-[12px] uppercase tracking-widest mb-2 leading-none">Integrity Notification</h4>
                      <p className="text-amber-700 text-sm font-medium leading-relaxed">Processing these records maintains absolute synchronization with the global analytics engine. All communication logged here is permanent and encrypted.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-sm shadow-[0_32px_64px_-12px_rgba(15,23,42,0.3)] overflow-hidden p-10 text-center animate-slide-up border border-slate-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">Permanent Purge?</h3>
            <p className="text-slate-400 mb-8 text-base font-medium leading-relaxed">This record will be completely erased from the admissions database.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteId(null)} disabled={isDeleting} className="flex-1 py-4 px-6 rounded-2xl border border-slate-200 font-black text-slate-400 hover:bg-slate-50 transition-all uppercase text-[11px] tracking-widest">Abort</button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-4 px-6 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black shadow-xl shadow-red-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 uppercase text-[11px] tracking-widest">
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : "Verify Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Slim Toast System */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[250] transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-16 opacity-0 scale-90 pointer-events-none'}`}>
        <div className={`px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 backdrop-blur-xl border ${toast.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400 shadow-emerald-500/20' : 'bg-red-500/90 text-white border-red-400 shadow-red-500/20'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-black text-[12px] uppercase tracking-widest leading-none">{toast.message}</span>
          <div className="w-[1px] h-4 bg-white/20 ml-2" />
          <button onClick={() => setToast({ ...toast, show: false })} className="hover:bg-white/20 rounded-full p-1.5 transition-all"><X size={14} /></button>
        </div>
      </div>
    </div>
  );
};

export default Register;
