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
  GraduationCap,
  MapPin,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { GetRequest, DeleteRequest, PostRequest, PatchRequest } from "../../apis/api";
import {
  ADMIN_GET_ENQUIRIES,
  ADMIN_MARK_ENQUIRY_READ,
  ADMIN_REPLY_ENQUIRY,
  ADMIN_DELETE_ENQUIRY,
} from "../../apis/endpoints";

import { useLocation } from "react-router-dom";

const Enquiries = () => {
  const location = useLocation();
  const [highlightId, setHighlightId] = useState(null);
  
  // Handle highlighting from notifications
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlight = params.get("highlight");
    if (highlight) {
      setHighlightId(highlight);
      // Auto-clear highlight after 5 seconds
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
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  
  // ✅ Filter & Pagination State
  const [filter, setFilter] = useState("all"); 
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

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const data = await GetRequest(ADMIN_GET_ENQUIRIES);
      setList(data || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch course enquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await DeleteRequest(ADMIN_DELETE_ENQUIRY(deleteId));
      showToast("Purged successfully");
      setDeleteId(null);
      if (view === "detail") setView("list");
      fetchEnquiries();
    } catch (err) {
      showToast("Purge failed", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await PatchRequest(ADMIN_MARK_ENQUIRY_READ(id));
      setList(prev => prev.map(e => e.id === id ? { ...e, isRead: true } : e));
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  const handleViewDetails = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setView("detail");
    if (!enquiry.isRead) {
      handleMarkAsRead(enquiry.id);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return showToast("Response required", "error");

    try {
      setIsSending(true);
      await PostRequest(ADMIN_REPLY_ENQUIRY, {
        id: selectedEnquiry.id,
        replyMessage: replyMessage
      });
      
      showToast("Reply dispatched");
      setReplyMessage("");
      fetchEnquiries();
      setSelectedEnquiry(prev => ({...prev, isReply: true, isRead: true}));
    } catch (err) {
      showToast("Dispatch failed", "error");
    } finally {
      setIsSending(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: list.length,
      new: list.filter(e => !e.isRead).length,
      viewed: list.filter(e => e.isRead && !e.isReply).length,
      replied: list.filter(e => e.isReply).length,
    };
  }, [list]);

  const filteredList = useMemo(() => {
    return list.filter(e => {
      if (filter === "new") return !e.isRead;
      if (filter === "viewed") return e.isRead && !e.isReply;
      if (filter === "replied") return e.isReply;
      return true;
    });
  }, [list, filter]);

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredList, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

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

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 animate-fade-in">
      
      {view === "list" ? (
        <>
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 mb-0.5">Course Enquiries</h1>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-none">Management Terminal</p>
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
               {["all", "new", "viewed", "replied"].map((f) => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {f}
                 </button>
               ))}
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { id: 'all', label: 'Total', count: stats.total, icon: MessageSquare, color: 'slate' },
              { id: 'new', label: 'New', count: stats.new, icon: Inbox, color: 'amber' },
              { id: 'viewed', label: 'Review', count: stats.viewed, icon: Eye, color: 'brand' },
              { id: 'replied', label: 'Replied', count: stats.replied, icon: CheckCheck, color: 'blue' }
            ].map((card) => (
              <div 
                key={card.id}
                onClick={() => setFilter(card.id)}
                className={`group bg-white p-4 rounded-2xl border transition-all cursor-pointer ${filter === card.id ? `border-${card.color === 'brand' ? 'brand-500' : card.color + '-500'} shadow-sm` : 'border-slate-100 shadow-sm hover:border-slate-200'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-${card.color === 'brand' ? 'brand' : card.color}-50 text-${card.color === 'brand' ? 'brand' : card.color}-500 flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner`}>
                    <card.icon size={16} />
                  </div>
                  <span className={`text-[9px] font-black uppercase text-slate-300 tracking-wider`}>{card.label}</span>
                </div>
                <div className="text-xl font-black text-slate-900">{card.count}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="bg-white rounded-[24px] border border-slate-100 p-20 flex flex-col items-center justify-center text-slate-400 shadow-sm">
               <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-500" />
               <p className="font-bold text-sm uppercase tracking-widest">Syncing...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-[20px] p-6 flex items-center gap-4 text-red-600 shadow-sm">
              <AlertCircle size={24} />
              <p className="font-bold text-sm">{error}</p>
              <button onClick={fetchEnquiries} className="ml-auto font-black uppercase tracking-widest text-[10px] bg-red-600 text-white px-4 py-2 rounded-lg transition-all active:scale-95">Retry</button>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Sender</th>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4">Origin</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest italic">Empty Workspace</td>
                      </tr>
                    ) : (
                      paginatedList.map((enquiry) => (
                        <tr 
                          key={enquiry.id} 
                          className={`hover:bg-slate-50 transition-all group ${!enquiry.isRead ? 'bg-amber-50/20' : ''} ${highlightId === enquiry.id ? 'record-highlight border-y border-brand-500' : ''}`}
                        >
                          <td className="px-6 py-3">
                             {enquiry.isReply ? (
                               <span className="inline-flex items-center gap-1.5 text-blue-600 text-[9px] font-black uppercase tracking-tighter">
                                 <CheckCheck size={10} /> Replied
                               </span>
                             ) : enquiry.isRead ? (
                               <span className="inline-flex items-center gap-1.5 text-brand-600 text-[9px] font-black uppercase tracking-tighter">
                                 <Eye size={10} /> Viewed
                               </span>
                             ) : (
                               <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase animate-pulse">
                                 New Inbound
                               </span>
                             )}
                          </td>
                          <td className="px-6 py-3">
                            <div>
                              <div className="font-black text-slate-800 leading-tight mb-0.5 text-sm">{enquiry.name}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-[150px]">
                                {enquiry.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                             <div className="flex items-center gap-2">
                                <GraduationCap size={14} className="text-indigo-500"/>
                                <span className="text-[13px] font-bold text-slate-700 truncate max-w-[180px]">{enquiry.course}</span>
                             </div>
                          </td>
                          <td className="px-6 py-3">
                             <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                               <div className="flex items-center gap-1">
                                 <MapPin size={10} className="text-slate-400"/> {enquiry.location}
                               </div>
                               <div className="text-slate-300 px-1 font-normal opacity-50">|</div>
                               <div className="flex items-center gap-1">
                                 <Clock size={10} className="text-slate-400"/> {enquiry.timeslot}
                               </div>
                             </div>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleViewDetails(enquiry)} className="p-2 bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all border border-slate-100 shadow-xs"><Eye size={16}/></button>
                              <button onClick={() => setDeleteId(enquiry.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-slate-100 shadow-xs"><Trash2 size={16}/></button>
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
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                   <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      Showing <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredList.length)}</span> of <span className="text-slate-900">{filteredList.length}</span> entries
                   </p>
                   <div className="flex items-center gap-2">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-600 disabled:opacity-30 transition-all"
                      >
                         <ChevronLeft size={16} />
                      </button>
                      <div className="flex items-center gap-1 px-1">
                         {[...Array(totalPages)].map((_, i) => (
                           <button
                             key={i}
                             onClick={() => setCurrentPage(i + 1)}
                             className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                           >
                              {i + 1}
                           </button>
                         ))}
                      </div>
                      <button 
                         disabled={currentPage === totalPages}
                         onClick={() => setCurrentPage(p => p + 1)}
                         className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-600 disabled:opacity-30 transition-all"
                      >
                         <ChevronRight size={16} />
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
            className="flex items-center gap-2 mb-6 text-slate-400 hover:text-slate-900 transition-colors font-black uppercase text-[10px] tracking-widest"
          >
            <ArrowLeft size={16} /> Return to List
          </button>
 
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Left Column: Details */}
             <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm text-center relative overflow-hidden">
                   <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-4 mx-auto shadow-inner">
                      <User size={32} />
                   </div>
                   <h2 className="text-xl font-black text-slate-900 mb-1 leading-tight">{selectedEnquiry.name}</h2>
                   <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-6">Inquiry Candidate</p>
                   
                   <div className="space-y-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                         <Mail size={14} className="text-brand-500 shrink-0" />
                         <span className="truncate">{selectedEnquiry.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                         <Phone size={14} className="text-brand-500 shrink-0" />
                         <span>{selectedEnquiry.mobile}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                         <MapPin size={14} className="text-brand-500 shrink-0" />
                         <span>{selectedEnquiry.location}</span>
                      </div>
                   </div>
                   
                   <button 
                     onClick={() => setDeleteId(selectedEnquiry.id)}
                     className="w-full py-3.5 rounded-xl border border-red-50 text-red-400 hover:bg-red-50 transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                   >
                     <Trash2 size={14}/> Purge Record
                   </button>
                </div>
 
                <div className="bg-slate-900 rounded-[24px] p-6 text-white shadow-xl shadow-slate-100">
                   <h3 className="text-[9px] font-black uppercase tracking-widest text-brand-400 mb-4 leading-none font-sans">Enquired Course</h3>
                   <div className="space-y-4">
                      <div className="flex items-start gap-4">
                         <GraduationCap size={22} className="text-brand-500 shrink-0"/>
                         <div>
                            <div className="font-black text-lg leading-tight mb-1">{selectedEnquiry.course}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Preferred: {selectedEnquiry.timeslot}</div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
 
             {/* Right Column: Communication Interface */}
             <div className="lg:col-span-2 space-y-6">
                {!selectedEnquiry.isReply ? (
                  <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-4 px-1">
                       <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                          Post Official Reply <Send size={14} className="text-brand-500"/>
                       </h3>
                    </div>
                    <form onSubmit={handleSendReply} className="space-y-4">
                       <textarea
                         required
                         placeholder={`Respond to the enquiry...`}
                         value={replyMessage}
                         onChange={(e) => setReplyMessage(e.target.value)}
                         className="w-full min-h-[220px] rounded-2xl bg-slate-50 border-slate-200 p-4 text-sm text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all placeholder:text-slate-300 font-medium leading-relaxed resize-none shadow-inner"
                       />
                       <button
                         type="submit"
                         disabled={isSending}
                         className="w-full py-4 rounded-xl bg-brand-600 text-white font-black uppercase text-[11px] tracking-widest shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                       >
                         {isSending ? <Loader2 size={18} className="animate-spin" /> : <>Dispatch Reply <Send size={14}/></>}
                       </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-blue-50/50 rounded-[24px] p-10 border border-blue-100 flex flex-col items-center text-center animate-fade-in">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-100 mb-4">
                      <CheckCheck size={32} />
                    </div>
                    <h4 className="font-black text-blue-900 text-xs uppercase tracking-widest mb-1.5">Reply Dispatched</h4>
                    <p className="text-blue-500/80 font-bold text-[10px] uppercase tracking-widest leading-relaxed">System addressed the candidate's query successfully.</p>
                  </div>
                )}
 
                <div className="bg-indigo-50 border-l-[6px] border-indigo-400 rounded-2xl p-6 flex items-start gap-4">
                   <AlertCircle className="text-indigo-500 shrink-0" size={20}/>
                   <div>
                      <h4 className="font-black text-indigo-900 text-[10px] uppercase tracking-widest mb-1 leading-none">Management Log</h4>
                      <p className="text-indigo-700 text-xs font-medium leading-relaxed">Engagement stats are updated in real-time. Replying marks this enquiry as Concluded.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
 
      {/* ✅ Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden p-8 text-center animate-slide-up border border-slate-100">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Purge Request</h3>
            <p className="text-slate-400 mb-6 text-sm font-medium">Permanently remove this record?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} disabled={isDeleting} className="flex-1 py-3 px-4 rounded-xl border border-slate-100 font-black text-slate-400 hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest">Abort</button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black shadow-lg shadow-red-100 transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest">
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* ✅ Slim Toast System */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[250] transition-all transform ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className={`px-6 py-3 rounded-full shadow-xl flex items-center gap-3 backdrop-blur-md border ${toast.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-red-500/90 text-white border-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="font-black text-[10px] uppercase tracking-widest leading-none">{toast.message}</span>
          <button onClick={() => setToast({ ...toast, show: false })} className="hover:bg-white/10 rounded-full p-1 transition-all"><X size={12} /></button>
        </div>
      </div>
    </div>
  );
};

export default Enquiries;
