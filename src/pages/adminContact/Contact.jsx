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
  MessageSquare,
  Eye,
  Send,
  Inbox,
  CheckCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { GetRequest, DeleteRequest, PostRequest, PatchRequest } from "../../apis/api";
import {
  ADMIN_GET_ALL_CONTACTS,
  ADMIN_DELETE_CONTACTS,
  ADMIN_MARK_CONTACT_READ,
  ADMIN_REPLY_CONTACT,
} from "../../apis/endpoints";

import { useLocation } from "react-router-dom";

const Contact = () => {
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

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  // ✅ Navigation & Reply State
  const [view, setView] = useState("list"); // list, detail
  const [selectedContact, setSelectedContact] = useState(null);
  const [showReplyBox, setShowReplyBox] = useState(false);
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

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await GetRequest(ADMIN_GET_ALL_CONTACTS);
      setContacts(response?.data || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch contact messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await DeleteRequest(ADMIN_DELETE_CONTACTS(deleteId));
      showToast("Message deleted");
      setDeleteId(null);
      setSelectedIds(prev => prev.filter(id => id !== deleteId));
      if (view === "detail") setView("list");
      fetchContacts();
    } catch (err) {
      showToast("Delete failed", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Permanently purge ${selectedIds.length} selected records?`)) return;
    try {
      setIsBulkDeleting(true);
      for (const id of selectedIds) {
        await DeleteRequest(ADMIN_DELETE_CONTACTS(id));
      }
      showToast(`${selectedIds.length} records purged`);
      setSelectedIds([]);
      fetchContacts();
    } catch (err) {
      showToast("Bulk purge failed", "error");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = (paginatedContacts) => {
    if (selectedIds.length === paginatedContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedContacts.map(item => item.id));
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await PatchRequest(ADMIN_MARK_CONTACT_READ(id));
      setContacts(prev => prev.map(c => c.id === id ? { ...c, isRead: true } : c));
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  const handleViewDetails = (contact) => {
    setSelectedContact(contact);
    setView("detail");
    if (!contact.isRead) {
      handleMarkAsRead(contact.id);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return showToast("Enter reply", "error");

    try {
      setIsSending(true);
      await PostRequest(ADMIN_REPLY_CONTACT, {
        id: selectedContact.id,
        replyMessage: replyMessage
      });
      
      showToast("Reply sent to user inbox");
      setReplyMessage("");
      setShowReplyBox(false);
      fetchContacts();
      setSelectedContact(prev => ({...prev, isReply: true, isRead: true}));
    } catch (err) {
      showToast("Send failed", "error");
    } finally {
      setIsSending(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: contacts.length,
      new: contacts.filter(c => !c.isRead).length,
      viewed: contacts.filter(c => c.isRead && !c.isReply).length,
      replied: contacts.filter(c => c.isReply).length,
    };
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      if (filter === "new") return !c.isRead;
      if (filter === "viewed") return c.isRead && !c.isReply;
      if (filter === "replied") return c.isReply;
      return true;
    });
  }, [contacts, filter]);

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredContacts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredContacts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // ✅ Highlight-Aware Pagination
  useEffect(() => {
    if (highlightId && filteredContacts.length > 0) {
      const recordIndex = filteredContacts.findIndex(item => item.id === highlightId);
      if (recordIndex !== -1) {
        const targetPage = Math.floor(recordIndex / itemsPerPage) + 1;
        setCurrentPage(targetPage);
      }
    }
  }, [highlightId, filteredContacts]);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 animate-fade-in">
      
      {view === "list" ? (
        <>
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-1">Contact Messages</h1>
              <div className="flex items-center gap-4">
                <p className="text-slate-400 font-bold uppercase text-[12px] tracking-widest leading-relaxed">Enquiry Management Dashboard</p>
                {selectedIds.length > 0 && (
                  <button 
                    onClick={handleBulkDelete}
                    disabled={isBulkDeleting}
                    className="flex items-center gap-2 px-4 py-1.5 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                  >
                    {isBulkDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Delete {selectedIds.length} Selected
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
               {["all", "new", "viewed", "replied"].map((f) => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {f}
                 </button>
               ))}
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { id: 'all', label: 'Total', count: stats.total, icon: MessageSquare, color: 'slate' },
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
               <p className="font-bold text-base uppercase tracking-widest">Syncing Archives...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex items-center gap-6 text-red-600">
              <AlertCircle size={28} />
              <p className="font-bold text-base tracking-tight">{error}</p>
              <button onClick={fetchContacts} className="ml-auto font-black uppercase tracking-widest text-[12px] bg-red-600 text-white px-6 py-3 rounded-xl transition-all">Retry Sync</button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 font-black text-[11px] text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-5">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                          checked={paginatedContacts.length > 0 && selectedIds.length === paginatedContacts.length}
                          onChange={() => toggleSelectAll(paginatedContacts)}
                        />
                      </th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Sender Details</th>
                      <th className="px-8 py-5 hidden md:table-cell">Message Preview</th>
                      <th className="px-8 py-5">Received Date</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-base">
                    {paginatedContacts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-black uppercase text-[12px] tracking-widest italic">Empty Communication Log</td>
                      </tr>
                    ) : (
                      paginatedContacts.map((contact) => (
                        <tr 
                          key={contact.id} 
                          className={`hover:bg-slate-50/80 transition-all group ${selectedIds.includes(contact.id) ? 'bg-brand-50/30' : !contact.isRead ? 'bg-amber-50/20' : ''} ${highlightId === contact.id ? 'record-highlight border-y border-brand-500' : ''}`}
                        >
                          <td className="px-8 py-4">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                              checked={selectedIds.includes(contact.id)}
                              onChange={() => toggleSelect(contact.id)}
                            />
                          </td>
                          <td className="px-8 py-4">
                             {contact.isReply ? (
                               <span className="inline-flex items-center gap-1.5 text-blue-600 text-[10px] font-black uppercase tracking-tighter">
                                 <CheckCheck size={12} /> Replied
                               </span>
                             ) : contact.isRead ? (
                               <span className="inline-flex items-center gap-1.5 text-brand-600 text-[10px] font-black uppercase tracking-tighter">
                                 <Eye size={12} /> Viewed
                               </span>
                             ) : (
                               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase animate-pulse">
                                 New Inquiry
                               </span>
                             )}
                          </td>
                          <td className="px-8 py-4 text-base">
                            <div>
                               <div className="font-black text-slate-800 leading-none mb-1.5">{contact.first_name} {contact.last_name}</div>
                               <div className="text-[12px] font-bold text-slate-400 uppercase tracking-tight">{contact.email}</div>
                            </div>
                          </td>
                          <td className="px-8 py-4 hidden md:table-cell max-w-[280px]">
                             <p className="text-[14px] text-slate-500 line-clamp-1 italic font-medium">"{contact.message}"</p>
                          </td>
                          <td className="px-8 py-4">
                             <div className="text-[12px] font-bold text-slate-400 uppercase tracking-tight bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 inline-block">
                                {new Date(contact.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                             </div>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button onClick={() => handleViewDetails(contact)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all transform active:scale-90 shadow-sm border border-slate-100"><Eye size={18}/></button>
                              <button onClick={() => setDeleteId(contact.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all transform active:scale-90 shadow-sm border border-slate-100"><Trash2 size={18}/></button>
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
                      Displaying <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredContacts.length)}</span> of <span className="text-slate-900">{filteredContacts.length}</span> entries
                   </p>
                   <div className="flex items-center gap-2">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                      >
                         <ChevronLeft size={18} />
                      </button>
                      <div className="flex items-center gap-1">
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
                         className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
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
            onClick={() => { setView("list"); setShowReplyBox(false); }}
            className="flex items-center gap-2 mb-8 text-slate-400 hover:text-slate-900 transition-colors font-black uppercase text-[12px] tracking-widest"
          >
            <ArrowLeft size={20} /> Back to Communications Archive
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Left Column: Details */}
             <div className="lg:col-span-1 space-y-8">
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm text-center">
                   <div className="w-20 h-20 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-6 mx-auto shadow-sm">
                      <User size={38} />
                   </div>
                   <h2 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{selectedContact.first_name} {selectedContact.last_name}</h2>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Registered Contact Source</p>
                   
                   <div className="space-y-4 text-left bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                      <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                         <Mail size={16} className="text-brand-500 shrink-0" />
                         <span className="truncate">{selectedContact.email}</span>
                      </div>
                      {selectedContact.phone && (
                        <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                           <Phone size={16} className="text-brand-500 shrink-0" />
                           <span>{selectedContact.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                         <Clock size={16} className="text-brand-500 shrink-0" />
                         <span>{new Date(selectedContact.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                   </div>
                   
                   <button 
                     onClick={() => setDeleteId(selectedContact.id)}
                     className="w-full mt-8 py-4 rounded-2xl border border-red-50 text-red-400 hover:bg-red-50 transition-all font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 group transform active:scale-[0.98]"
                   >
                     <Trash2 size={16} className="group-hover:rotate-12 transition-transform" /> Purge Conversation
                   </button>
                </div>
             </div>

             {/* Right Column: Message & Reply */}
             <div className="lg:col-span-2 space-y-8">
                <div className="bg-slate-50/50 rounded-[32px] p-8 border border-slate-100 relative overflow-hidden">
                   <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] bg-white px-4 py-1.5 rounded-full border border-brand-100 shadow-sm">Verified Message Content</span>
                      {selectedContact.isReply && (
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 flex items-center gap-1.5">
                           <CheckCheck size={12}/> Protocol Replied
                        </span>
                      )}
                   </div>
                   <p className="text-base font-medium text-slate-700 leading-relaxed italic border-l-4 border-slate-200 pl-6 py-2">
                      "{selectedContact.message}"
                   </p>
                </div>

                {!selectedContact.isReply ? (
                  <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6 px-1">
                       <h3 className="text-base font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                          Dispatch Official Response <Send size={18} className="text-brand-500"/>
                       </h3>
                    </div>
                    <form onSubmit={handleSendReply} className="space-y-5">
                       <textarea
                         required
                         placeholder="Construct your official response here..."
                         value={replyMessage}
                         onChange={(e) => setReplyMessage(e.target.value)}
                         className="w-full min-h-[220px] rounded-[24px] bg-slate-50 border-slate-200 p-6 text-base text-slate-900 focus:ring-8 focus:ring-brand-500/10 focus:border-brand-500 focus:outline-none transition-all placeholder:text-slate-300 font-medium leading-relaxed resize-none"
                       />
                       <button
                         type="submit"
                         disabled={isSending}
                         className="w-full py-5 rounded-2xl bg-brand-600 text-white font-black uppercase text-sm tracking-widest shadow-xl shadow-brand-100 hover:bg-brand-700 hover:shadow-brand-300 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                       >
                         {isSending ? <Loader2 size={20} className="animate-spin" /> : <>Send Outgoing Dispatch <Send size={16}/></>}
                       </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-blue-50/50 rounded-[32px] p-12 border border-blue-100 flex flex-col items-center text-center animate-fade-in shadow-inner">
                     <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center text-blue-500 shadow-lg border border-blue-100 mb-6">
                       <CheckCheck size={40} />
                     </div>
                     <h4 className="font-black text-blue-600 text-sm uppercase tracking-widest mb-2">Transmission Successful</h4>
                     <p className="text-blue-500/80 font-bold text-xs uppercase tracking-[0.05em] leading-relaxed">The inquiry has been addressed and the sender has been<br/>officially notified via priority dispatch.</p>
                  </div>
                )}
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
            <h3 className="text-2xl font-black text-slate-900 mb-3">Verify Deletion?</h3>
            <p className="text-slate-400 mb-8 text-base font-medium leading-relaxed">This record will be permanently purged from the archive system.</p>
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

export default Contact;
