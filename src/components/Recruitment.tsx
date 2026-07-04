import React, { useState } from "react";
import { 
  Plus, 
  Sparkles, 
  UploadCloud, 
  UserCheck, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  TrendingUp, 
  MessageSquare,
  AlertCircle,
  X
} from "lucide-react";
import { JobRequisition, Candidate, UserRole } from "../types";

interface RecruitmentProps {
  requisitions: JobRequisition[];
  activeRole: string;
  onCreateRequisition: (req: any) => void;
  onUpdateApplicant: (reqId: string, candId: string, update: Partial<Candidate>) => void;
  onAddApplicant: (reqId: string, cand: any) => void;
}

export default function Recruitment({
  requisitions,
  activeRole,
  onCreateRequisition,
  onUpdateApplicant,
  onAddApplicant
}: RecruitmentProps) {

  const [activeTab, setActiveTab] = useState<"requisitions" | "candidates">("requisitions");
  const [selectedReq, setSelectedReq] = useState<JobRequisition | null>(requisitions[0] || null);
  const [selectedCand, setSelectedCand] = useState<Candidate | null>(null);
  
  // Create Requisition Modal form state
  const [showReqForm, setShowReqForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDept, setNewDept] = useState("Engineering");
  const [newVacancies, setNewVacancies] = useState(1);
  const [newSalary, setNewSalary] = useState("80,000 - 120,000 BDT");
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low">("Medium");

  // CV Parse Simulator state
  const [simName, setSimName] = useState("");
  const [simSkills, setSimSkills] = useState("");
  const [simExp, setSimExp] = useState(3);
  const [simText, setSimText] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  // New interview scheduling states
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [interviewRound, setInterviewRound] = useState("Technical Core Interview");
  const [interviewDateTime, setInterviewDateTime] = useState("");
  const [interviewer, setInterviewer] = useState("Arafat Hamim");

  const handleCreateRequisitionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = {
      title: newTitle,
      department: newDept,
      vacancies: Number(newVacancies),
      status: activeRole === UserRole.CEO || activeRole === UserRole.HR_DIRECTOR ? "Approved" : "Pending Approval",
      priority: newPriority,
      salaryRange: newSalary
    };
    onCreateRequisition(newReq);
    setShowReqForm(false);
    // Reset
    setNewTitle("");
  };

  const handleSimulateResumeUpload = () => {
    if (!simName) return alert("Please enter Candidate Name to simulate.");
    setIsParsing(true);
    
    setTimeout(() => {
      // AI Score Formula: experience + matching core skills factor
      const skillCount = simSkills.split(",").length;
      const baseScore = 60 + (simExp * 4) + (skillCount * 3);
      const score = Math.min(98, Math.max(45, baseScore));

      const newCand: Partial<Candidate> = {
        name: simName,
        email: `${simName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        phone: "+880-1700-112233",
        skills: simSkills.split(",").map(s => s.trim()).filter(Boolean),
        experienceYears: Number(simExp),
        parsedSummary: `Parsed resume summary: ${simName} is a professional with ${simExp} years of hands-on experience. Primary skill domains include: ${simSkills}. Highly suited for structural alignment and BDT payroll compatibility checks.`,
        score,
        status: "CV Screened",
        salaryRecommendation: Math.round(45000 + (simExp * 12000) + (score * 600))
      };

      if (selectedReq) {
        onAddApplicant(selectedReq.id, newCand);
        // Reset parser state
        setSimName("");
        setSimSkills("");
        setSimExp(3);
        setSimText("");
        setIsParsing(false);
        // Refresh local selection view
        const updatedReq = requisitions.find(r => r.id === selectedReq.id);
        if (updatedReq) {
          setSelectedReq(updatedReq);
        }
      }
    }, 1200);
  };

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !selectedCand) return;

    const interviews = [
      ...(selectedCand.interviews || []),
      {
        round: interviewRound,
        dateTime: interviewDateTime,
        interviewer,
        feedback: "Scheduled - SLA Calendar Slot Allocated"
      }
    ];

    onUpdateApplicant(selectedReq.id, selectedCand.id, {
      interviews,
      status: "Interviewing"
    });

    setSelectedCand({
      ...selectedCand,
      interviews,
      status: "Interviewing"
    });

    setShowScheduleForm(false);
  };

  const handleStatusChange = (status: Candidate['status']) => {
    if (!selectedReq || !selectedCand) return;
    onUpdateApplicant(selectedReq.id, selectedCand.id, { status });
    setSelectedCand({ ...selectedCand, status });
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-transparent">
      
      {/* ATS Main Hub (Left) */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto border-r border-slate-200/60">
        
        {/* Module Title */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 bg-emerald-100/70 px-2.5 py-1 rounded-md uppercase">
              Talent Management System
            </span>
            <h2 className="text-2xl font-bold font-sans text-slate-900 tracking-tight mt-3">
              Recruitment & ATS Core
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Publish positions, run CV screening algorithms, and schedule technical panels.
            </p>
          </div>
          <button
            id="btn-create-req"
            onClick={() => setShowReqForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition"
          >
            <Plus className="w-4 h-4" />
            New Job Requisition
          </button>
        </div>

        {/* Inner ATS Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("requisitions")}
            className={`pb-3 text-xs font-semibold px-2 transition-all ${
              activeTab === "requisitions" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Job Requisitions ({requisitions.length})
          </button>
          <button
            onClick={() => setActiveTab("candidates")}
            className={`pb-3 text-xs font-semibold px-2 transition-all ${
              activeTab === "candidates" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            AI CV Parsing Hub
          </button>
        </div>

        {activeTab === "requisitions" ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Requisitions List */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Active Requisitions</h3>
              {requisitions.map((req) => {
                const isSelected = selectedReq?.id === req.id;
                return (
                  <div
                    key={req.id}
                    id={`req-card-${req.id}`}
                    onClick={() => { setSelectedReq(req); setSelectedCand(null); }}
                    className={`bg-white p-5 rounded-xl border cursor-pointer transition-all hover:border-emerald-300/60 ${
                      isSelected ? "border-emerald-500 ring-1 ring-emerald-500/10 shadow-sm" : "border-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-[10px] font-mono font-semibold text-slate-400">{req.id}</span>
                      </div>
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                        req.status === "Published" 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mt-2">{req.title}</h4>
                    <p className="text-xs text-slate-400 font-medium">{req.department} · {req.salaryRange}</p>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50 text-[11px] text-slate-500">
                      <span>Priority: <strong className="text-slate-700">{req.priority}</strong></span>
                      <span>Applicants: <strong className="text-emerald-600">{req.applicants.length} candidates</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Applicants List inside Selected Requisition */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              {selectedReq ? (
                <div>
                  <div className="border-b border-slate-100 pb-4 mb-4">
                    <h3 className="text-base font-bold text-slate-800 leading-none">{selectedReq.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{selectedReq.department} Pipeline applicants.</p>
                  </div>

                  <div className="space-y-3">
                    {selectedReq.applicants.map((cand) => {
                      const isCandSel = selectedCand?.id === cand.id;
                      return (
                        <div
                          key={cand.id}
                          id={`applicant-${cand.id}`}
                          onClick={() => setSelectedCand(cand)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all hover:bg-slate-50/50 flex items-center justify-between ${
                            isCandSel ? "border-emerald-500 bg-emerald-50/10" : "border-slate-100 bg-slate-50/30"
                          }`}
                        >
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{cand.name}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">{cand.experienceYears} Years Exp · {cand.status}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-mono">AI Score</span>
                              <span className="text-xs font-bold text-emerald-600 font-mono">{cand.score}/100</span>
                            </div>
                            <span className="text-slate-300">|</span>
                            <UserCheck className="w-4 h-4 text-emerald-500" />
                          </div>
                        </div>
                      );
                    })}

                    {selectedReq.applicants.length === 0 && (
                      <div className="py-12 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto stroke-1 text-slate-300 mb-2" />
                        <span className="text-xs font-medium block">No applicants logged for this requisition</span>
                        <button
                          onClick={() => setActiveTab("candidates")}
                          className="mt-3 text-emerald-600 font-semibold text-xs hover:underline"
                        >
                          Simulate Resume Parse to Apply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center text-slate-400">
                  <span>Select a Job Requisition to view applicant logs</span>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Interactive CV Parser Simulator Hub */
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs max-w-2xl">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
              <h3 className="text-base font-bold text-slate-800">SMI Fahim AI Parser Engine</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Upload simulated candidate assets directly to link them with our active recruitment mandates. The AI parser extracts capabilities and matches salary benchmarks in BDT.
            </p>

            <div className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Candidate Name</label>
                  <input
                    type="text"
                    id="sim-name-input"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    placeholder="e.g. Rafiqul Hasan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Requisition</label>
                  <select
                    id="sim-req-select"
                    value={selectedReq?.id || ""}
                    onChange={(e) => {
                      const found = requisitions.find(r => r.id === e.target.value);
                      if (found) setSelectedReq(found);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500"
                  >
                    {requisitions.map(r => (
                      <option key={r.id} value={r.id}>{r.title} ({r.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Primary Skill Domains (comma separated)</label>
                  <input
                    type="text"
                    id="sim-skills-input"
                    value={simSkills}
                    onChange={(e) => setSimSkills(e.target.value)}
                    placeholder="e.g. React, TypeScript, Node.js"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    id="sim-exp-input"
                    value={simExp}
                    onChange={(e) => setSimExp(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Simulated Resume Text Content</label>
                <textarea
                  id="sim-text-area"
                  rows={4}
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  placeholder="Paste or drop markdown curriculum vitae details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              <div className="pt-4">
                <button
                  id="btn-simulate-parse"
                  onClick={handleSimulateResumeUpload}
                  disabled={isParsing || !simName}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold flex items-center justify-center gap-2 hover:brightness-105 active:scale-98 transition disabled:opacity-50"
                >
                  <UploadCloud className="w-5 h-5" />
                  <span>{isParsing ? "AI Screening in progress..." : "Simulate Drag & Drop CV Parse"}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Applicant 360° Assessment scorecard Sidebar Panel (Right) */}
      <div className={`w-112 bg-white border-l border-slate-200 overflow-y-auto transform transition-all duration-300 ${
        selectedCand ? "translate-x-0" : "translate-x-full hidden"
      }`}>
        {selectedCand && (
          <div className="p-6 space-y-6 text-xs font-sans">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">Applicant ID: {selectedCand.id}</span>
                <h3 className="text-base font-bold text-slate-800 mt-1">{selectedCand.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedCand(null)} 
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Ranking Score */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-emerald-800 font-bold block">AI Fit Assessment</span>
                <p className="text-[10px] text-slate-500 mt-1">Calculated via matching skill ratios.</p>
              </div>
              <div className="text-center bg-emerald-600 text-white font-extrabold text-lg py-2 px-3 rounded-xl shadow-md font-mono shadow-emerald-500/10">
                {selectedCand.score}%
              </div>
            </div>

            {/* Pipeline State Selector */}
            <div className="space-y-2">
              <span className="text-slate-400 uppercase tracking-wider font-mono text-[10px]">Candidate Stage</span>
              <div className="flex flex-wrap gap-1">
                {(["Applied", "CV Screened", "Interviewing", "Offered", "Rejected"] as Candidate['status'][]).map(st => (
                  <button
                    key={st}
                    id={`btn-candidate-status-${st.toLowerCase()}`}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition ${
                      selectedCand.status === st 
                        ? "bg-emerald-600 text-white" 
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills & Parsed Bio */}
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 uppercase tracking-wider font-mono text-[10px]">Extracted Skills</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {selectedCand.skills.map(s => (
                    <span key={s} className="bg-slate-100 text-slate-700 font-mono text-[9px] px-2 py-0.5 rounded-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 uppercase tracking-wider font-mono text-[10px]">AI Parsed CV Brief</span>
                <p className="text-slate-600 leading-relaxed mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedCand.parsedSummary}
                </p>
              </div>
            </div>

            {/* BDT Salary Benchmarks */}
            {selectedCand.salaryRecommendation && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-400 uppercase tracking-wider font-mono text-[10px]">AI BDT Salary Benchmarking</span>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-semibold text-slate-700">Recommended Monthly Gross</span>
                  <span className="font-bold text-emerald-600 text-sm">৳ {selectedCand.salaryRecommendation.toLocaleString()} BDT</span>
                </div>
              </div>
            )}

            {/* Interviews Scheduled */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase tracking-wider font-mono text-[10px]">Schedules & Feedback</span>
                <button
                  id="btn-schedule-form-toggle"
                  onClick={() => setShowScheduleForm(!showScheduleForm)}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold text-[11px] flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule Interview
                </button>
              </div>

              {/* Schedule form */}
              {showScheduleForm && (
                <form onSubmit={handleScheduleInterview} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Interview Round</label>
                    <input
                      type="text"
                      id="input-interview-round"
                      value={interviewRound}
                      onChange={(e) => setInterviewRound(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      id="input-interview-time"
                      value={interviewDateTime}
                      onChange={(e) => setInterviewDateTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Interviewer (from Employees)</label>
                    <input
                      type="text"
                      id="input-interviewer-name"
                      value={interviewer}
                      onChange={(e) => setInterviewer(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5"
                    />
                  </div>
                  <button
                    type="submit"
                    id="btn-submit-interview-schedule"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
                  >
                    Confirm Calendar Slot
                  </button>
                </form>
              )}

              <div className="space-y-3 border-t border-slate-100 pt-3">
                {selectedCand.interviews?.map((int, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex justify-between">
                      <strong className="text-slate-800">{int.round}</strong>
                      <span className="font-mono text-[10px] text-slate-400">{int.dateTime}</span>
                    </div>
                    <p className="text-slate-500 text-[10px]">Interviewer: {int.interviewer}</p>
                    {int.feedback && <p className="italic text-emerald-700 font-medium">Feedback: {int.feedback}</p>}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Create Requisition Modal Form */}
      {showReqForm && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-md w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Initiate Job Requisition</h3>
              <button onClick={() => setShowReqForm(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateRequisitionSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Job Requisition Title</label>
                <input
                  type="text"
                  id="req-form-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Architect"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Vertical Department</label>
                  <select
                    id="req-form-dept"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Marketing & Communication">Marketing</option>
                    <option value="Finance & Accounts">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Vacancies Count</label>
                  <input
                    type="number"
                    id="req-form-vacancies"
                    value={newVacancies}
                    onChange={(e) => setNewVacancies(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3"
                    min={1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Salary Bracket (BDT)</label>
                  <input
                    type="text"
                    id="req-form-salary"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Workforce Priority</label>
                  <select
                    id="req-form-priority"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  id="btn-req-form-cancel"
                  onClick={() => setShowReqForm(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-req-form-submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                >
                  {activeRole === UserRole.CEO || activeRole === UserRole.HR_DIRECTOR ? "Approve & Publish" : "Submit for Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
