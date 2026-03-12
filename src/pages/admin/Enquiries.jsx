// Enquiries.jsx - Fully Furnished UI
import { useEffect, useState } from "react";
import {
  Contact2,
  Mail,
  User,
  Phone,
  MapPin,
  Clock,
  GraduationCap,
  Trash2,
  MailOpen
} from "lucide-react";
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
    <div className="max-w-[1200px] mx-auto animate-fade-in py-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Customer Enquiries</h1>
        <p className="text-slate-500">Manage and respond to customer inquiries efficiently.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Contact2 className="w-6 h-6 text-brand-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              All Enquiries <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-sm font-medium ml-1">{list.length}</span>
            </h2>
          </div>

          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <MailOpen className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-1">No enquiries yet</h3>
              <p className="text-slate-500">Customer enquiries will appear here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {list.map((e, index) => (
                <div
                  key={e.id || index}
                  className="bg-white rounded-xl border border-slate-200 p-5 transition-all duration-200 hover:border-brand-300 hover:shadow-md group relative"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {e.name || "Anonymous User"}
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <a href={`mailto:${e.email}`} className="hover:text-brand-600 transition-colors">
                              {e.email || "No email"}
                            </a>
                          </div>
                          <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 self-center"></div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <a href={`tel:${e.mobile}`} className="hover:text-brand-600 transition-colors">
                              {e.mobile || "No mobile"}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200 shrink-0">
                      New
                    </span>
                  </div>

                  <hr className="border-slate-100 my-4" />

                  <div className="flex flex-wrap gap-x-6 gap-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span>{e.course || "N/A"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{e.location || "N/A"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{e.timeslot || "N/A"}</span>
                    </div>
                  </div>

                  {e.message && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 mb-4">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {e.message}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-slate-400">
                      Received recently
                    </span>
                    <button 
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete Enquiry"
                      aria-label="Delete Enquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
