import React, { useState, useMemo } from "react";
import { 
  Heart, 
  MessageSquare, 
  Plus, 
  Award, 
  Megaphone, 
  Send, 
  CheckCircle, 
  ThumbsUp, 
  Users,
  X
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Employee, Announcement, UserRole } from "../types";

interface EngagementProps {
  employees: Employee[];
  announcements: Announcement[];
  activeRole: string;
  currentUser: { name: string; avatar: string };
  onAddAnnouncement: (ann: any) => void;
}

export default function Engagement({
  employees,
  announcements,
  activeRole,
  currentUser,
  onAddAnnouncement
}: EngagementProps) {

  const [activeSubTab, setActiveSubTab] = useState<"kudos" | "pulse" | "bulletin">("kudos");
  
  // New Kudos state
  const [kudosRecipient, setKudosRecipient] = useState(employees[0]?.id || "");
  const [kudosBadge, setKudosBadge] = useState("🏆 Leadership Excellence");
  const [kudosMsg, setKudosMsg] = useState("");
  const [kudosList, setKudosList] = useState([
    { id: "kd-1", senderName: "SMI Fahim", senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", receiverName: "Abrar Ishraq", message: "Amazing coordination in resolving Bangladesh Labour Act policy transitions on maternity leaves. Standard setting SLA turnaround!", badge: "🏆 Leadership Excellence" },
    { id: "kd-2", senderName: "Suchana", senderAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150", receiverName: "Sagor Ghosh", message: "Fantastic speed in screening over 80 CV applicants for the Lead Architect opening in 48 hours!", badge: "⚡ Speed Demon" }
  ]);

  // Pulse Survey voting state
  const [surveyVote, setSurveyVote] = useState<string | null>(null);
  const [surveyResults, setSurveyResults] = useState([
    { name: "Highly Satisfied", votes: 24, fill: "#10b981" },
    { name: "Neutral / Fair", votes: 12, fill: "#f59e0b" },
    { name: "Unsatisfied", votes: 5, fill: "#ef4444" }
  ]);

  // Bulletin Announcement State
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annPriority, setAnnPriority] = useState<"High" | "Medium">("Medium");

  const handleSendKudos = (e: React.FormEvent) => {
    e.preventDefault();
    const receiver = employees.find(e => e.id === kudosRecipient);
    const newKudos = {
      id: `kd-${Date.now()}`,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      receiverName: receiver ? receiver.name : "Team Member",
      message: kudosMsg,
      badge: kudosBadge
    };
    setKudosList([newKudos, ...kudosList]);
    setKudosMsg("");
  };

  const handleCastVote = (option: string) => {
    if (surveyVote) return; // single vote simulation
    setSurveyVote(option);
    setSurveyResults(surveyResults.map(opt => 
      opt.name === option ? { ...opt, votes: opt.votes + 1 } : opt
    ));
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const newAnn = {
      title: annTitle,
      content: annContent,
      author: currentUser.name,
      priority: annPriority,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };
    onAddAnnouncement(newAnn);
    setShowAnnForm(false);
    setAnnTitle("");
    setAnnContent("");
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-slate-50/50 font-sans text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-600 uppercase bg-emerald-50 px-2.5 py-1 rounded-md">
            Culture & Community
          </span>
          <h2 className="text-2xl font-bold font-sans text-slate-900 tracking-tight mt-2">
            Engagement Hub
          </h2>
          <p className="text-slate-500 text-sm">
            Celebrate achievements with corporate Kudos, check company sentiment in Pulse surveys, and view bulletins.
          </p>
        </div>
      </div>

      {/* Internal Navigation tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("kudos")}
          className={`pb-3 text-xs font-semibold px-2 transition-all ${
            activeSubTab === "kudos" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Kudos Recognition Wall ({kudosList.length})
        </button>
        <button
          onClick={() => setActiveSubTab("pulse")}
          className={`pb-3 text-xs font-semibold px-2 transition-all ${
            activeSubTab === "pulse" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Pulse Sentiment Survey
        </button>
        <button
          onClick={() => setActiveSubTab("bulletin")}
          className={`pb-3 text-xs font-semibold px-2 transition-all ${
            activeSubTab === "bulletin" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Company bulletins & Board
        </button>
      </div>

      {activeSubTab === "kudos" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Kudos sender (Col 5) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs h-fit">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-800">Appreciate a Colleague</h3>
            </div>
            <p className="text-slate-400 leading-relaxed mb-6">
              Recognize peer initiatives instantly. Celebrated feedback shows up on the global stream dashboard.
            </p>

            <form onSubmit={handleSendKudos} className="space-y-4 font-sans text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select recipient</label>
                <select
                  id="kudos-receiver-select"
                  value={kudosRecipient}
                  onChange={(e) => setKudosRecipient(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Select Award category badge</label>
                <select
                  id="kudos-badge-select"
                  value={kudosBadge}
                  onChange={(e) => setKudosBadge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500"
                >
                  <option value="🏆 Leadership Excellence">🏆 Leadership Excellence</option>
                  <option value="⚡ Speed Demon">⚡ Speed Demon</option>
                  <option value="🧠 Problem Solver">🧠 Problem Solver</option>
                  <option value="🤝 Team Player">🤝 Team Player</option>
                  <option value="🌟 Customer First">🌟 Customer First</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Kudos Appreciation Message</label>
                <textarea
                  id="kudos-message-textarea"
                  rows={4}
                  value={kudosMsg}
                  onChange={(e) => setKudosMsg(e.target.value)}
                  placeholder="Tell them why they are awesome..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                id="btn-send-kudos"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition"
              >
                <Send className="w-4 h-4" />
                <span>Send Corporate Kudos badge</span>
              </button>
            </form>
          </div>

          {/* Kudos Wall (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Recognition wall stream</h3>
            <div className="space-y-4">
              {kudosList.map((kd) => (
                <div key={kd.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex gap-4 transition hover:bg-slate-50/10">
                  <img
                    src={kd.senderAvatar}
                    alt={kd.senderName}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 justify-between">
                      <p className="text-slate-800 font-bold leading-none">
                        {kd.senderName} <span className="text-slate-400 font-medium">sent Kudos to</span> {kd.receiverName}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-700 font-mono bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">
                        {kd.badge}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-2.5 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100 italic">
                      " {kd.message} "
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeSubTab === "pulse" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          
          {/* Pulse survey card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-800">Sentiment Pulse Survey</h3>
              </div>
              <p className="text-slate-400 leading-relaxed mb-4">
                Tell us what you think! This pulse is anonymous. Resulting graphs are compiled in real-time across the corporate team.
              </p>
              
              <div className="p-4 bg-emerald-50/50 border border-emerald-100/60 rounded-xl">
                <strong className="text-emerald-950 font-bold text-xs block mb-1">Weekly Question:</strong>
                <span className="text-slate-700 font-semibold leading-relaxed">
                  "How would you rate the current workflow flexibility and hybrid alignment provided under WorkForceHub?"
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {surveyResults.map(opt => (
                <button
                  key={opt.name}
                  id={`btn-vote-${opt.name.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => handleCastVote(opt.name)}
                  disabled={surveyVote !== null}
                  className={`w-full py-3.5 px-4 rounded-xl border text-left font-semibold flex justify-between items-center transition ${
                    surveyVote === opt.name 
                      ? "bg-emerald-600 text-white border-emerald-600" 
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 disabled:opacity-50"
                  }`}
                >
                  <span>{opt.name}</span>
                  {surveyVote === opt.name && <CheckCircle className="w-4 h-4" />}
                </button>
              ))}

              {surveyVote && (
                <p className="text-emerald-700 italic text-[10px] mt-2 block font-medium">
                  Thanks for voting! Your sentiment has been anonymously dispatched.
                </p>
              )}
            </div>
          </div>

          {/* Recharts Bar chart metrics */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-slate-400 font-mono tracking-wider uppercase">Live Sentiment Dashboard</span>
              <p className="text-[10px] text-slate-400 mt-1">Total compiled votes: {surveyResults.reduce((acc, c) => acc + c.votes, 0)}</p>
            </div>

            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={surveyResults} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }} />
                  <Bar dataKey="votes" radius={[8, 8, 0, 0]} barSize={28}>
                    {surveyResults.map((entry, idx) => (
                      <rect key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[10px] text-slate-400 mt-4 text-center leading-normal">
              Sentiment data feeds into the global Workforce Health score shown on the HR executive dashboard.
            </p>
          </div>

        </div>
      )}

      {activeSubTab === "bulletin" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Corporate Bulletins & Announcements</h3>
            {(activeRole === UserRole.CEO || activeRole === UserRole.HR_DIRECTOR) && (
              <button
                id="btn-ann-form-toggle"
                onClick={() => setShowAnnForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Megaphone className="w-3.5 h-3.5" />
                Post Announcement
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-xs relative">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-mono">{ann.date} · by {ann.author}</span>
                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-xs ${
                    ann.priority === "High" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {ann.priority}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm leading-snug">{ann.title}</h4>
                <p className="text-slate-500 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcement form modal */}
      {showAnnForm && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-md w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Publish Corporate Bulletin</h3>
              <button onClick={() => setShowAnnForm(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 font-sans text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Bulletin Title</label>
                <input
                  type="text"
                  id="ann-form-title"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Eid holidays announcement"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Message Content</label>
                <textarea
                  id="ann-form-content"
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Provide precise notification details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Priority level</label>
                <select
                  id="ann-form-priority"
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                >
                  <option value="Medium">Standard Notification</option>
                  <option value="High">Urgent / Important Alert</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  id="btn-ann-form-cancel"
                  onClick={() => setShowAnnForm(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-ann-form-submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                >
                  Post Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
