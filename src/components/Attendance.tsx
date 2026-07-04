import React, { useState, useMemo } from "react";
import { 
  Clock, 
  MapPin, 
  QrCode, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileEdit, 
  Compass, 
  TrendingUp, 
  Plus,
  HelpCircle,
  X
} from "lucide-react";
import { AttendanceRecord, Employee, UserRole } from "../types";

interface AttendanceProps {
  attendance: AttendanceRecord[];
  employees: Employee[];
  currentUser: { name: string; role: string; id: string };
  activeRole: string;
  onClockInOut: (location: string) => void;
  onApproveCorrection?: (id: string, decision: "Approved" | "Rejected") => void;
}

export default function Attendance({
  attendance,
  employees,
  currentUser,
  activeRole,
  onClockInOut,
  onApproveCorrection
}: AttendanceProps) {

  const [activeTab, setActiveTab] = useState<"logs" | "clock" | "corrections">("logs");
  const [selectedLocation, setSelectedLocation] = useState("GPS (Dhaka Head Office)");
  
  // Late Correction Form state
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("");
  const [correctionTargetDate, setCorrectionTargetDate] = useState("");

  // Filter logs for ESS (regular employees only see their own logs)
  const filteredLogs = useMemo(() => {
    if (activeRole === UserRole.CEO || activeRole === UserRole.HR_DIRECTOR) return attendance;
    return attendance.filter(log => log.employeeId === currentUser.id);
  }, [attendance, activeRole, currentUser]);

  // Is currently clocked in today?
  const todayRecord = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return attendance.find(r => r.employeeId === currentUser.id && r.date === todayStr);
  }, [attendance, currentUser]);

  // Simulated pending correction requests
  const [corrections, setCorrections] = useState([
    { id: "COR-01", employeeName: "Suchana", date: "2026-07-03", lateReason: "Traffic gridlock at Mohakhali Flyover", status: "Pending" },
    { id: "COR-02", employeeName: "Md. Mehedi Hasan", date: "2026-07-02", lateReason: "Ferry delays during storm on River route", status: "Pending" }
  ]);

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCor = {
      id: `COR-${Math.floor(Math.random() * 1000)}`,
      employeeName: currentUser.name,
      date: correctionTargetDate,
      lateReason: correctionReason,
      status: "Pending"
    };
    setCorrections([newCor, ...corrections]);
    setShowCorrectionForm(false);
    setCorrectionReason("");
  };

  const handleCorrectionDecision = (id: string, decision: "Approved" | "Rejected") => {
    setCorrections(corrections.map(c => c.id === id ? { ...c, status: decision } : c));
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-transparent">
      
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 bg-emerald-100/70 px-2.5 py-1 rounded-md uppercase">
            Operational Excellence
          </span>
          <h2 className="text-2xl font-bold font-sans text-slate-900 tracking-tight mt-3">
            Attendance Engine
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Monitor biometric logins, shifts, GPS clock-ins, and late excuse approvals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-clock-tab"
            onClick={() => setActiveTab("clock")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition"
          >
            <Compass className="w-4 h-4" />
            Interactive Clock-In Portal
          </button>
        </div>
      </div>

      {/* Internal Navigation tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("logs")}
          className={`pb-3 text-xs font-semibold px-2 transition-all ${
            activeTab === "logs" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          {activeRole === UserRole.CEO || activeRole === UserRole.HR_DIRECTOR ? "Headcount logs" : "My Logs"}
        </button>
        <button
          onClick={() => setActiveTab("clock")}
          className={`pb-3 text-xs font-semibold px-2 transition-all ${
            activeTab === "clock" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Biometric & GPS Simulator
        </button>
        <button
          onClick={() => setActiveTab("corrections")}
          className={`pb-3 text-xs font-semibold px-2 transition-all ${
            activeTab === "corrections" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Correction Workflow ({corrections.filter(c => c.status === "Pending").length})
        </button>
      </div>

      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-slate-800">
              {activeRole === UserRole.CEO || activeRole === UserRole.HR_DIRECTOR ? "Workforce Attendance Logs" : "Your Historical Logs"}
            </h3>
            {activeRole === UserRole.EMPLOYEE && (
              <button
                id="btn-trigger-correction-form"
                onClick={() => setShowCorrectionForm(true)}
                className="text-emerald-600 font-semibold text-xs flex items-center gap-1"
              >
                <FileEdit className="w-3.5 h-3.5" />
                Submit Late Correction Request
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="p-4">Employee ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Check-In</th>
                  <th className="p-4">Check-Out</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">OT Hours</th>
                  <th className="p-4">Justification Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono text-slate-400">{log.employeeId}</td>
                    <td className="p-4 font-bold text-slate-800">{log.employeeName}</td>
                    <td className="p-4">{log.department}</td>
                    <td className="p-4">{log.date}</td>
                    <td className="p-4">{log.checkIn}</td>
                    <td className="p-4">{log.checkOut || "--"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        log.status === "Present" 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : log.status === "Late" 
                            ? "bg-amber-50 text-amber-600 border border-amber-100" 
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4">{log.location}</td>
                    <td className="p-4 font-mono font-bold">{log.otHours} hrs</td>
                    <td className="p-4 italic text-slate-400 truncate max-w-48">{log.lateReason || "--"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "clock" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          
          {/* Action Card GPS / Biometric */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-800">Operational Check-In Portal</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Check in instantly via GPS Geo-fencing coordinates or biometric simulation. Ensure location features are allowed on mobile viewports.
              </p>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Check-In Location</label>
                <select
                  id="attendance-location-select"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-700"
                >
                  <option value="GPS (Dhaka Head Office)">Dhaka Head Office (Gulshan)</option>
                  <option value="Remote">Remote / Working from Home</option>
                  <option value="GPS (Chittagong Branch)">Chittagong Branch Office (Agrabad)</option>
                </select>
              </div>

              {/* Status details */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Current Login Status</span>
                  <span className="block font-bold text-slate-700 mt-1">
                    {todayRecord ? `Clocked In at ${todayRecord.checkIn} AM` : "Not logged in today"}
                  </span>
                </div>
                {todayRecord ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                )}
              </div>
            </div>

            <button
              id="btn-clock-action"
              onClick={() => onClockInOut(selectedLocation)}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md ${
                todayRecord 
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/10" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10"
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span>{todayRecord ? "Simulate CLOCK OUT" : "Simulate CLOCK IN"}</span>
            </button>
          </div>

          {/* QR badge card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
            <h4 className="text-sm font-bold text-slate-800 leading-none">Your Enterprise QR Badge</h4>
            <span className="text-[10px] text-slate-400 font-mono">{currentUser.id}</span>
            
            <div className="w-48 h-48 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200/60 p-4 relative overflow-hidden group">
              <QrCode className="w-full h-full text-emerald-950 animate-pulse" />
              <div className="absolute inset-0 bg-emerald-500/5 animate-ping duration-1000" />
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed max-w-56">
              Hold your mobile app or badge to any physical terminal scanner in the Gulshan or Agrabad branches to log biometric inputs instantly.
            </p>
          </div>

        </div>
      )}

      {activeTab === "corrections" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-slate-800">Pending Attendance Correction Requests</h3>
            <p className="text-xs text-slate-400">Approval workflow for traffic/commute late waivers.</p>
          </div>

          <div className="space-y-3">
            {corrections.map((cor) => (
              <div key={cor.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">{cor.id}</span>
                    <h4 className="text-xs font-bold text-slate-800">{cor.employeeName}</h4>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">Date: <strong className="text-slate-700">{cor.date}</strong></p>
                  <p className="italic text-slate-500 text-xs mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">" {cor.lateReason} "</p>
                </div>

                <div className="flex gap-2 shrink-0 self-end md:self-center">
                  {cor.status === "Pending" ? (
                    <>
                      <button
                        id={`btn-correction-reject-${cor.id}`}
                        onClick={() => handleCorrectionDecision(cor.id, "Rejected")}
                        className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                      >
                        Decline waiver
                      </button>
                      <button
                        id={`btn-correction-approve-${cor.id}`}
                        onClick={() => handleCorrectionDecision(cor.id, "Approved")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                      >
                        Approve waiver
                      </button>
                    </>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                      cor.status === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}>
                      {cor.status}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {corrections.length === 0 && (
              <div className="py-12 text-center text-slate-400 font-medium">
                <span>No active correction requests submitted</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Late Correction Form Modal */}
      {showCorrectionForm && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-md w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Submit Attendance Correction</h3>
              <button onClick={() => setShowCorrectionForm(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCorrectionSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Infraction Date</label>
                <input
                  type="date"
                  id="cor-form-date"
                  value={correctionTargetDate}
                  onChange={(e) => setCorrectionTargetDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Justification Reason (e.g. Traffic grids, Health emergency)</label>
                <textarea
                  id="cor-form-reason"
                  rows={4}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="Provide precise excuse details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  id="btn-cor-form-cancel"
                  onClick={() => setShowCorrectionForm(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-cor-form-submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                >
                  Submit Waiver Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
