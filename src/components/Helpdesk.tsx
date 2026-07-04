import React, { useState } from "react";
import { 
  HelpCircle, 
  Plus, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Search,
  ChevronRight,
  ShieldAlert,
  X
} from "lucide-react";
import { Ticket, UserRole } from "../types";

interface HelpdeskProps {
  tickets: Ticket[];
  activeRole: string;
  currentUser: { name: string; id: string };
  onCreateTicket: (ticket: any) => void;
  onResolveTicket: (ticketId: string, reply: string) => void;
}

export default function Helpdesk({
  tickets,
  activeRole,
  currentUser,
  onCreateTicket,
  onResolveTicket
}: HelpdeskProps) {

  const [activeTab, setActiveTab] = useState<"tickets" | "docs">("tickets");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Ticket Form States
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCat, setNewCat] = useState("Payroll & Accounts");
  const [newPri, setNewPri] = useState<"High" | "Medium" | "Low">("Medium");

  // Admin resolution state
  const [adminReply, setAdminReply] = useState("");

  // Document viewer states
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket = {
      title: newTitle,
      description: newDesc,
      category: newCat,
      priority: newPri,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      status: "Open"
    };
    onCreateTicket(newTicket);
    setShowForm(false);
    setNewTitle("");
    setNewDesc("");
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTicket) {
      onResolveTicket(selectedTicket.id, adminReply);
      setSelectedTicket({
        ...selectedTicket,
        status: "Resolved",
        resolutionNotes: adminReply
      });
      setAdminReply("");
    }
  };

  // Standard enterprise document templates
  const documentTemplates = [
    { id: "doc-1", title: "Enterprise Employee Handbook", version: "v2.4", date: "Jan 2026", description: "Comprehensive corporate guidelines, holiday slabs, and workplace policies compliant with National rules.", content: "WorkForceHub Corporate Handbook...\n\nSection 1: Working Hours & Attendance\nDaily standard shifts at Dhaka Head office begin at 09:00 AM sharp, with a 15-minute grace period. Late logins after 09:15 AM require correction waivers approved by Abrar Ishraq.\n\nSection 2: Bangladesh Labour Act Integration\nAll employees are contractually aligned under statutory separation gratuity slabs, provident fund provisions, and maternity leave rights." },
    { id: "doc-2", title: "Mutual Non-Disclosure Agreement (NDA)", version: "v1.1", date: "Mar 2026", description: "Standard corporate confidentiality template for vendor alignment and contractor onboarding.", content: "MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis NDA is compiled to protect trade secrets of WorkForceHub, its CEO SMI Fahim, and subsidiary software teams.\n\nTerm: Continuous confidentiality duration of 5 years following termination of service." },
    { id: "doc-3", title: "Standard Maternity Leave Policy Form", version: "v3.0", date: "Jun 2026", description: "Standard form template for filing prenatal leaves under Section 46 guidelines.", content: "MATERNITY BENEFIT NOTIFICATION FORM\n\nTo: HOD HR, Abrar Ishraq\nRe: Filing of prenatal leave benefits\n\nRequires formal doctor signature certifying Expected Delivery Date (EDD) for statutory 16 weeks leave allocation." }
  ];

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50/50">
      
      {/* Helpdesk Workspace (Left) */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto border-r border-slate-200/60">
        
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-600 uppercase bg-emerald-50 px-2.5 py-1 rounded-md">
              SLA Operations Center
            </span>
            <h2 className="text-2xl font-bold font-sans text-slate-900 tracking-tight mt-2">
              Helpdesk & Document Portal
            </h2>
            <p className="text-slate-500 text-sm">
              File support tickets with strict SLA counters, download legal templates, and view company handbooks.
            </p>
          </div>
          <button
            id="btn-file-ticket-toggle"
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition"
          >
            <Plus className="w-4 h-4" />
            File Support Ticket
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`pb-3 text-xs font-semibold px-2 transition-all ${
              activeTab === "tickets" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            SLA Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`pb-3 text-xs font-semibold px-2 transition-all ${
              activeTab === "docs" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Template Documents ({documentTemplates.length})
          </button>
        </div>

        {activeTab === "tickets" ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Tickets list */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Active Tickets Pipeline</h3>
              
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    id={`ticket-card-${t.id}`}
                    onClick={() => { setSelectedTicket(t); }}
                    className={`bg-white p-5 rounded-2xl border cursor-pointer transition-all hover:border-emerald-300/60 flex items-center justify-between ${
                      isSelected ? "border-emerald-500 ring-1 ring-emerald-500/10" : "border-slate-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{t.id} · {t.category}</span>
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          t.priority === "Critical" 
                            ? "bg-rose-50 text-rose-600 border border-rose-100" 
                            : "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mt-2">{t.title}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Filed by {t.employeeName}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                        t.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {t.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ticket detail / Reply */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              {selectedTicket ? (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-mono text-slate-400">{selectedTicket.id} · SLA Target 4hrs</span>
                    <h3 className="text-base font-bold text-slate-800 mt-1">{selectedTicket.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">Status: <strong className="text-emerald-600 font-bold uppercase">{selectedTicket.status}</strong></p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Description Detail</span>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                      {selectedTicket.description}
                    </p>
                  </div>

                  {/* Resolution notes display */}
                  {selectedTicket.resolutionNotes && (
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">HR Resolution Notes</span>
                      <p className="text-emerald-800 font-medium leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-xs">
                        {selectedTicket.resolutionNotes}
                      </p>
                    </div>
                  )}

                  {/* Reply Form for HR Admins */}
                  {selectedTicket.status === "Open" && (activeRole === UserRole.CEO || activeRole === UserRole.HR_DIRECTOR) && (
                    <form onSubmit={handleResolveSubmit} className="space-y-3 pt-3 border-t border-slate-100">
                      <div>
                        <label className="text-slate-400 block mb-1">Reply & Close Ticket (SLA Waiver Confirmation)</label>
                        <textarea
                          id="ticket-reply-textarea"
                          rows={3}
                          value={adminReply}
                          onChange={(e) => setAdminReply(e.target.value)}
                          placeholder="Provide details on ticket resolution..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        id="btn-resolve-ticket"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm"
                      >
                        Approve & Mark Resolved
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="py-24 text-center text-slate-400">
                  <span>Select a Ticket to view resolution logs</span>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Template docs center */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {documentTemplates.map((doc) => (
              <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <FileText className="w-8 h-8 text-emerald-600" />
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">{doc.version}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mt-3">{doc.title}</h4>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{doc.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-mono">Updated: {doc.date}</span>
                  <button
                    id={`btn-view-doc-${doc.id}`}
                    onClick={() => setViewingDoc(doc)}
                    className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 hover:underline"
                  >
                    Open Document <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Document View Drawer Panel (Right) */}
      <div className={`w-112 bg-white border-l border-slate-200 overflow-y-auto transform transition-all duration-300 ${
        viewingDoc ? "translate-x-0" : "translate-x-full hidden"
      }`}>
        {viewingDoc && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400">SMI Fahim Document Center</span>
                <h3 className="text-base font-bold text-slate-800 mt-1">{viewingDoc.title}</h3>
              </div>
              <button 
                onClick={() => setViewingDoc(null)} 
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl font-mono text-[11px] text-slate-700 whitespace-pre-line leading-relaxed h-[500px] overflow-y-auto">
              {viewingDoc.content}
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
              <button
                id="btn-doc-download-mock"
                onClick={() => alert(`Simulated template download for: ${viewingDoc.title}.docx`)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                Download Template (.docx)
              </button>
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
              >
                Close View
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Ticket Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-md w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">File Support Ticket</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Ticket Subject / Title</label>
                <input
                  type="text"
                  id="ticket-form-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Discrepancy on BDT increment tax slab"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    id="ticket-form-category"
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3"
                  >
                    <option value="Payroll & Accounts">Payroll & Accounts</option>
                    <option value="Biometric Attendance">Biometric Attendance</option>
                    <option value="Compliance Policy">Compliance Policy</option>
                    <option value="Hardware / Dhaka HQ">Hardware / Dhaka HQ</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Priority</label>
                  <select
                    id="ticket-form-priority"
                    value={newPri}
                    onChange={(e) => setNewPri(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical (SLA 2hrs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Full Description</label>
                <textarea
                  id="ticket-form-desc"
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide precise details of your support requirement..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  id="btn-ticket-form-cancel"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-ticket-form-submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                >
                  File Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
