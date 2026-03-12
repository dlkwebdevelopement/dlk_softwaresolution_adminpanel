import React, { useEffect, useState } from "react";
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
  MessageSquare
} from "lucide-react";
import { GetRequest, DeleteRequest } from "../../apis/config";
import {
  ADMIN_GET_ALL_CONTACTS,
  ADMIN_DELETE_CONTACTS,
} from "../../apis/endpoints";

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // ✅ Show Toast
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  // ✅ Fetch Contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await GetRequest(ADMIN_GET_ALL_CONTACTS);
      setContacts(response?.data || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch contact messages. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // ✅ Delete Contact
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await DeleteRequest(ADMIN_DELETE_CONTACTS(deleteId));
      showToast("Contact message deleted successfully");
      setDeleteId(null);
      fetchContacts();
    } catch (err) {
      showToast("Failed to delete contact message", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Contact Messages</h1>
        <p className="text-slate-500">Manage inquiries and messages from website visitors.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-20 flex flex-col items-center justify-center text-slate-400">
           <Loader2 className="w-12 h-12 animate-spin mb-4 text-brand-500" />
           <p className="font-medium">Fetching messages...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center gap-4 text-red-600">
          <AlertCircle className="shrink-0" />
          <p className="font-medium">{error}</p>
          <button onClick={fetchContacts} className="ml-auto underline font-bold">Retry</button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sender</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Received At</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center text-slate-400">
                         <MessageSquare size={40} className="mb-4 opacity-20" />
                         <p className="font-medium text-slate-500">No contact messages found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                            <User size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{contact.first_name} {contact.last_name}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                          <Mail size={14} className="text-slate-400" />
                          <span>{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          <span>{contact.phone || "No phone"}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                         <div className="max-w-xs text-sm text-slate-600 line-clamp-2 italic" title={contact.message}>
                           "{contact.message}"
                         </div>
                      </td>

                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                           <Clock size={12} />
                           {new Date(contact.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                           })}
                         </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeleteId(contact.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Message"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete Message?</h3>
              <p className="text-slate-500 mb-8 font-medium">This action cannot be undone. Are you sure you want to remove this contact message from the database?</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-6 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  Keep It
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Custom Toast */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md border ${toast.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-red-500/90 text-white border-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="font-bold text-sm">{toast.message}</span>
          <button onClick={() => setToast({ ...toast, show: false })} className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;

