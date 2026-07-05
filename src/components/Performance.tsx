import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  Target, 
  UserCheck, 
  Award, 
  HelpCircle, 
  Zap, 
  ChevronRight, 
  ShieldAlert, 
  CheckSquare, 
  Sparkles,
  X,
  Calendar,
  Grid,
  Clock,
  Info,
  AlertTriangle,
  Bell
} from "lucide-react";
import { Goal, Employee, UserRole } from "../types";
import confetti from "canvas-confetti";

interface PerformanceProps {
  goals: Goal[];
  employees: Employee[];
  activeRole: string;
  currentUser: { name: string; id: string };
  onUpdateGoalProgress: (goalId: string, progress: number) => void;
  onAddGoal: (goal: any) => void;
}

export default function Performance({
  goals,
  employees,
  activeRole,
  currentUser,
  onUpdateGoalProgress,
  onAddGoal
}: PerformanceProps) {

  const [activeTab, setActiveTab] = useState<"okrs" | "grid9">("okrs");
  const [okrViewMode, setOkrViewMode] = useState<"card" | "timeline">("timeline");

  const triggerConfetti = () => {
    confetti({
      particleCount: 85,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: ["#10b981", "#6366f1", "#3b82f6", "#f59e0b"]
    });
    confetti({
      particleCount: 85,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: ["#10b981", "#6366f1", "#3b82f6", "#f59e0b"]
    });
  };

  const handleProgressChange = (goalId: string, value: number) => {
    const prevGoal = goals.find(g => g.id === goalId);
    const prevProgress = prevGoal ? prevGoal.progress : 0;
    
    onUpdateGoalProgress(goalId, value);
    
    if (value === 100 && prevProgress < 100) {
      triggerConfetti();
    }
  };

  const isImminent = (goal: Goal) => {
    if (goal.progress === 100) return false;
    if (!goal.targetDate) return false;
    
    try {
      const today = new Date("2026-07-04");
      const target = new Date(goal.targetDate);
      if (isNaN(target.getTime())) return false;
      
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= 7;
    } catch (e) {
      return false;
    }
  };

  const getDaysRemaining = (targetDateStr: string) => {
    try {
      const today = new Date("2026-07-04");
      const target = new Date(targetDateStr);
      if (isNaN(target.getTime())) return null;
      
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      return null;
    }
  };
  
  // New OKR Form State
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalKeyResult, setGoalKeyResult] = useState("");
  const [goalTargetEmployee, setGoalTargetEmployee] = useState(employees[0]?.id || "");
  const [goalStartDate, setGoalStartDate] = useState("2026-04-01");
  const [goalTargetDate, setGoalTargetDate] = useState("2026-07-15");
  const [goalCategory, setGoalCategory] = useState<"OKR" | "KPI">("OKR");

  // Timeline year boundaries (2026)
  const startMs = useMemo(() => new Date("2026-01-01").getTime(), []);
  const endMs = useMemo(() => new Date("2026-12-31").getTime(), []);

  const parseDate = (dateStr?: string) => {
    if (!dateStr) return new Date("2026-01-01");
    if (dateStr.toLowerCase().includes("q1")) return new Date("2026-03-31");
    if (dateStr.toLowerCase().includes("q2")) return new Date("2026-06-30");
    if (dateStr.toLowerCase().includes("q3")) return new Date("2026-09-30");
    if (dateStr.toLowerCase().includes("q4")) return new Date("2026-12-31");
    
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date("2026-01-01") : parsed;
  };

  const getPercent = (dateStr: string) => {
    const d = parseDate(dateStr);
    const ms = d.getTime();
    const pct = ((ms - startMs) / (endMs - startMs)) * 100;
    return Math.min(100, Math.max(0, pct));
  };

  const timelineMonths = useMemo(() => [
    { name: "Jan", pct: 0 },
    { name: "Feb", pct: 8.33 },
    { name: "Mar", pct: 16.66 },
    { name: "Apr", pct: 25 },
    { name: "May", pct: 33.33 },
    { name: "Jun", pct: 41.66 },
    { name: "Jul", pct: 50 },
    { name: "Aug", pct: 58.33 },
    { name: "Sep", pct: 66.66 },
    { name: "Oct", pct: 75 },
    { name: "Nov", pct: 83.33 },
    { name: "Dec", pct: 91.66 },
  ], []);

  // Filter goals for ESS
  const filteredGoals = useMemo(() => {
    if (activeRole === UserRole.CEO || activeRole === UserRole.HR_DIRECTOR) return goals;
    return goals.filter(g => g.employeeId === currentUser.id);
  }, [goals, activeRole, currentUser]);

  const imminentGoals = useMemo(() => {
    return filteredGoals.filter(isImminent);
  }, [filteredGoals, isImminent]);

  const handleCreateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = employees.find(emp => emp.id === goalTargetEmployee);
    const newGoal = {
      title: goalTitle,
      keyResult: goalKeyResult,
      employeeId: goalTargetEmployee,
      employeeName: targetEmp ? targetEmp.name : "Unknown",
      progress: 0,
      startDate: goalStartDate,
      targetDate: goalTargetDate,
      category: goalCategory,
      status: "In Progress"
    };
    onAddGoal(newGoal);
    setShowGoalForm(false);
    setGoalTitle("");
    setGoalKeyResult("");
  };

  // 9-Box Grid Mapping data based on employee performanceRating & simulated potential
  // We divide employees into 9 boxes:
  // Performance: High(>=4.5), Med(>=3.5), Low(<3.5)
  // Potential (simulated or matching ratings)
  const nineBoxGrid = useMemo(() => {
    const grid: Record<string, Employee[]> = {
      "High-High": [], // Star / High Performer, High Potential
      "High-Med": [],  // High Performer, Med Potential
      "High-Low": [],  // Solid Performer, Low Potential
      "Med-High": [],  // High Potential, Med Performer
      "Med-Med": [],   // Core Player / Med Performer, Med Potential
      "Med-Low": [],   // Effective / Med Performer, Low Potential
      "Low-High": [],  // Enigma / High Potential, Low Performer
      "Low-Med": [],   // Dilemma / Med Potential, Low Performer
      "Low-Low": [],   // Underperformer
    };

    employees.forEach(emp => {
      let perf = "Low";
      if (emp.performanceRating >= 4.4) perf = "High";
      else if (emp.performanceRating >= 3.5) perf = "Med";

      // Simulate potential for mapping depth
      let pot = "Med";
      if (emp.skills.length > 5 || emp.certifications.length > 1) pot = "High";
      else if (emp.skills.length < 3) pot = "Low";

      const key = `${perf}-${pot}`;
      if (grid[key]) {
        grid[key].push(emp);
      }
    });

    return grid;
  }, [employees]);

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-slate-50/50 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-600 uppercase bg-emerald-50 px-2.5 py-1 rounded-md">
            Organizational Growth
          </span>
          <h2 className="text-2xl font-bold font-sans text-slate-900 tracking-tight mt-2">
            Performance & OKR Suite
          </h2>
          <p className="text-slate-500 text-sm">
            Align strategic objectives, track weekly check-ins, and model succession metrics in the 9-Box Grid.
          </p>
        </div>
        
        {/* Create OKR Goal button */}
        {(activeRole === UserRole.CEO || activeRole === UserRole.HR_DIRECTOR) && (
          <button
            id="btn-create-goal"
            onClick={() => setShowGoalForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition"
          >
            <Target className="w-4 h-4" />
            Add Strategic Goal / OKR
          </button>
        )}
      </div>

      {/* Internal Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("okrs")}
          className={`pb-3 text-xs font-semibold px-2 transition-all ${
            activeTab === "okrs" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Company & Personal OKRs ({filteredGoals.length})
        </button>
        <button
          onClick={() => setActiveTab("grid9")}
          className={`pb-3 text-xs font-semibold px-2 transition-all ${
            activeTab === "grid9" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Succession planning: 9-Box Grid
        </button>
      </div>

      {activeTab === "okrs" ? (
        <div className="space-y-6">
          {/* Notification Alert System for Imminent Goals */}
          {imminentGoals.length > 0 && (
            <div id="imminent-goals-notifications" className="bg-amber-50/70 border border-yellow-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-yellow-100 text-yellow-800 border border-yellow-200 shrink-0">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
                    Strategic Milestone Alerts ({imminentGoals.length})
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    The following objectives have deadlines approaching within the next 7 days. Action is required to ensure timeline compliance.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {imminentGoals.map(goal => {
                  const daysLeft = getDaysRemaining(goal.targetDate);
                  return (
                    <div 
                      key={`alert-${goal.id}`} 
                      className="bg-white p-3.5 rounded-xl border border-yellow-200 shadow-xs flex flex-col justify-between hover:border-yellow-400 transition duration-200"
                    >
                      <div>
                        <div className="flex justify-between items-center gap-2 mb-1.5">
                          <span className="text-[9px] font-mono font-bold bg-yellow-50 text-yellow-800 border border-yellow-200 px-1.5 py-0.5 rounded">
                            {goal.id}
                          </span>
                          <span className={`text-[9px] font-mono font-black ${daysLeft !== null && daysLeft < 0 ? "text-rose-600" : "text-amber-600"}`}>
                            {daysLeft !== null ? (
                              daysLeft < 0 
                                ? `OVERDUE BY ${Math.abs(daysLeft)}D` 
                                : daysLeft === 0 
                                ? "DUE TODAY" 
                                : daysLeft === 1 
                                ? "DUE TOMORROW" 
                                : `DUE IN ${daysLeft} DAYS`
                            ) : "IMMINENT"}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">{goal.title}</h5>
                        <p className="text-[10px] text-slate-400 mt-1">Assignee: <span className="text-slate-600 font-semibold">{goal.employeeName}</span></p>
                      </div>
                      
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400 mb-1">
                            <span>Completion</span>
                            <span>{goal.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-yellow-500 h-full rounded-full transition-all duration-500" style={{ width: `${goal.progress}%` }} />
                          </div>
                        </div>
                        <button
                          onClick={() => handleProgressChange(goal.id, 100)}
                          className="px-2.5 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 border border-yellow-500 text-white text-[9px] font-bold tracking-tight whitespace-nowrap transition cursor-pointer animate-pulse"
                        >
                          Mark 100%
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Target className="w-4.5 h-4.5 text-emerald-600" />
                Assigned Strategic Performance Targets
              </h3>
              <p className="text-xs text-slate-400">Quarterly objectives and key milestones tracked across key corporate segments.</p>
            </div>

            {/* View Switcher Controls */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setOkrViewMode("card")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  okrViewMode === "card"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Card Grid
              </button>
              <button
                onClick={() => setOkrViewMode("timeline")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  okrViewMode === "timeline"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Milestone Timeline
              </button>
            </div>
          </div>

          {okrViewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredGoals.map((goal) => {
                const imminent = isImminent(goal);
                const daysLeft = getDaysRemaining(goal.targetDate);
                return (
                  <div 
                    key={goal.id} 
                    id={`goal-card-${goal.id}`}
                    className={`p-6 rounded-2xl flex flex-col justify-between space-y-4 transition-all duration-300 ${
                      imminent 
                        ? "bg-amber-50/10 border-2 border-yellow-400 shadow-sm shadow-yellow-100/50" 
                        : "bg-white border border-slate-200 shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {goal.id} {goal.startDate && `· ${goal.startDate}`} {goal.targetDate && `→ ${goal.targetDate}`}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {imminent && (
                            <span className="inline-flex items-center gap-1 text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse">
                              <Clock className="w-2.5 h-2.5" />
                              {daysLeft !== null && daysLeft < 0 ? "Overdue" : "Imminent"}
                            </span>
                          )}
                          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                            goal.progress === 100
                              ? "bg-indigo-50 text-indigo-600 border border-indigo-100" 
                              : goal.status === "On Track" || goal.status === "In Progress"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            {goal.progress === 100 ? "Completed" : goal.status}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mt-2">{goal.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Key Result: <strong className="text-slate-700">{goal.keyResult}</strong></p>
                    
                    {/* Assigned to badge */}
                    <div className="flex items-center gap-2 mt-4 bg-slate-50 p-2 rounded-xl border border-slate-100 w-fit">
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[10px] text-slate-500">Assignee: <strong className="text-slate-700">{goal.employeeName}</strong></span>
                    </div>
                  </div>

                  {/* Progress bar Slider */}
                  <div className="space-y-2 pt-2 border-t border-slate-50">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-400">Completion</span>
                      <span className="text-emerald-600">{goal.progress}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={goal.progress}
                        id={`progress-slider-${goal.id}`}
                        onChange={(e) => handleProgressChange(goal.id, Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-ew-resize h-1 bg-slate-100 rounded-lg"
                      />
                    </div>
                  </div>

                </div>
                );
              })}

              {filteredGoals.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                  <span>No OKRs defined for your employee context.</span>
                </div>
              )}
            </div>
          ) : (
            /* Visual Milestone Timeline / Gantt Chart View */
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-6">
              
              {/* Timeline Header Info Panel */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-wrap gap-4 items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Visualizing company milestones across fiscal year <strong>2026</strong>. Hover on timeline bars for precise details.
                  </span>
                </div>
                <div className="flex gap-4 items-center text-[10px] font-mono font-bold">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" /> On Track
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block" /> Completed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block" /> Behind
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-0.5 border-t-2 border-dashed border-rose-500 block w-5" /> Today Indicator
                  </span>
                </div>
              </div>

              {/* Gantt Scroll Container */}
              <div className="w-full overflow-x-auto">
                <div className="min-w-[850px] space-y-2">
                  
                  {/* Timeline Months Label Header Grid Row */}
                  <div className="flex border-b border-slate-100 pb-2">
                    <div className="w-80 shrink-0 font-mono text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                      Strategic Objective & Owner
                    </div>
                    <div className="flex-grow relative h-6">
                      {timelineMonths.map((m) => (
                        <span 
                          key={m.name} 
                          className="absolute text-[10px] font-mono font-black text-slate-400 select-none"
                          style={{ left: `${m.pct}%` }}
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Timeline Rows container */}
                  <div className="relative pt-2">
                    {/* Today vertical line indicator */}
                    <div 
                      className="absolute top-0 bottom-0 border-l-2 border-dashed border-rose-500 z-10 flex flex-col justify-start pointer-events-none"
                      style={{ left: `${getPercent("2026-07-04")}%` }}
                    >
                      <span className="bg-rose-500 text-white text-[8px] font-mono font-black px-1.5 py-0.5 rounded shadow-sm relative -left-1/2 -top-1 whitespace-nowrap uppercase tracking-wider">
                        Today (Jul 4)
                      </span>
                    </div>

                    {filteredGoals.map((goal) => {
                      const left = getPercent(goal.startDate || "2026-04-01");
                      const right = getPercent(goal.targetDate || "2026-07-15");
                      const width = Math.max(12, right - left);
                      
                      const isCompleted = goal.progress === 100;
                      const barBg = isCompleted 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                        : goal.status === "On Track" 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-amber-50 border-amber-200 text-amber-700";

                      const fillBg = isCompleted
                        ? "bg-indigo-500/15"
                        : goal.status === "On Track"
                        ? "bg-emerald-500/15"
                        : "bg-amber-500/15";

                      const strokeColor = isCompleted
                        ? "bg-indigo-500"
                        : goal.status === "On Track"
                        ? "bg-emerald-500"
                        : "bg-amber-500";

                      const imminent = isImminent(goal);
                      return (
                        <div 
                          key={goal.id} 
                          id={`timeline-goal-${goal.id}`}
                          className={`flex p-3 rounded-xl transition-all duration-300 border-2 ${
                            imminent 
                              ? "bg-amber-50/10 border-yellow-400 shadow-sm shadow-yellow-100/30 my-2" 
                              : "border-transparent border-b border-slate-100 last:border-b-0 hover:bg-slate-50/20"
                          }`}
                        >
                          {/* Left Metadata Side */}
                          <div className="w-80 shrink-0 pr-4 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                  {goal.id}
                                </span>
                                <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase ${
                                  goal.category === "OKR" ? "bg-purple-50 text-purple-600 border border-purple-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                                }`}>
                                  {goal.category || "OKR"}
                                </span>
                                <span className={`text-[9px] font-mono font-bold ${isCompleted ? "text-indigo-600" : "text-emerald-600"}`}>
                                  {goal.progress}%
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-slate-800 mt-1 line-clamp-1 hover:line-clamp-none transition-all duration-200">
                                {goal.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate leading-relaxed">
                                KR: <strong className="text-slate-500">{goal.keyResult}</strong>
                              </p>
                            </div>

                            {/* Assignee Footer */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 font-bold text-[9px] flex items-center justify-center border border-white uppercase shadow-xs">
                                {goal.employeeName ? goal.employeeName.charAt(0) : "U"}
                              </div>
                              <span className="text-[10px] font-bold text-slate-600 truncate">{goal.employeeName}</span>
                            </div>
                          </div>

                          {/* Right Timeline Grid Side */}
                          <div className="flex-grow relative h-20 bg-slate-50/10 rounded-xl overflow-hidden border border-slate-100/40">
                            
                            {/* Month grid lines */}
                            {timelineMonths.map((m) => (
                              <div 
                                key={m.name} 
                                className="absolute top-0 bottom-0 border-l border-dashed border-slate-200/40"
                                style={{ left: `${m.pct}%` }}
                              />
                            ))}

                            {/* Active Goal Milestone Bar */}
                            <div 
                              className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-full border flex items-center justify-between px-3 ${barBg} shadow-xs select-none group/bar transition-all duration-300`}
                              style={{ left: `${left}%`, width: `${width}%` }}
                              title={`${goal.title} (Start: ${goal.startDate || "N/A"} → Target: ${goal.targetDate})`}
                            >
                              {/* Progress Filled Overlay */}
                              <div 
                                className={`absolute left-0 top-0 bottom-0 rounded-full ${fillBg} transition-all duration-500`}
                                style={{ width: `${goal.progress}%` }}
                              />

                              {/* Start Milestone Pin */}
                              <div className="flex items-center gap-1 z-10 shrink-0">
                                <span className={`w-1.5 h-1.5 rounded-full ${strokeColor} animate-pulse`} />
                                <span className="text-[9px] font-mono font-bold opacity-80 truncate hidden md:inline">
                                  {goal.startDate ? goal.startDate.substring(5) : "01-01"}
                                </span>
                              </div>

                              {/* Goal Title / Progress Text Inside the bar */}
                              <span className="text-[10px] font-bold truncate mx-1 z-10 pointer-events-none drop-shadow-sm">
                                {goal.progress}% {isCompleted ? "Completed" : "Active"}
                              </span>

                              {/* Target Milestone Pin */}
                              <div className="flex items-center gap-1 z-10 shrink-0">
                                <span className="text-[9px] font-mono font-bold opacity-80 truncate hidden md:inline">
                                  {goal.targetDate ? goal.targetDate.substring(5) : "12-31"}
                                </span>
                                <Target className={`w-3 h-3 ${isCompleted ? "text-indigo-600" : "text-slate-600"}`} />
                              </div>

                              {/* Hover tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[9px] font-mono rounded-lg p-2 shadow-lg hidden group-hover/bar:block z-20 whitespace-nowrap border border-slate-700/50">
                                <div className="font-bold font-sans text-slate-300 text-[10px] mb-0.5 truncate max-w-xs">{goal.title}</div>
                                <div>Start Milestone: <strong className="text-emerald-400">{goal.startDate || "2026-01-01"}</strong></div>
                                <div>Target Milestone: <strong className="text-amber-400">{goal.targetDate}</strong></div>
                                <div>Progress: <strong className="text-indigo-400">{goal.progress}%</strong> ({goal.status})</div>
                              </div>
                            </div>

                            {/* Render Interactive progress slider directly on hover or as overlay */}
                            <div className="absolute bottom-1 right-2 z-10 opacity-0 hover:opacity-100 group-hover/bar:opacity-100 transition-opacity bg-white/95 px-2 py-1 rounded-md shadow-xs border border-slate-200 flex items-center gap-2">
                              <span className="text-[8px] font-mono text-slate-400 uppercase font-black">Progress Tweak:</span>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={goal.progress}
                                onChange={(e) => handleProgressChange(goal.id, Number(e.target.value))}
                                className="w-16 accent-emerald-500 cursor-ew-resize h-1"
                              />
                              <span className="text-[9px] font-mono font-black text-slate-600">{goal.progress}%</span>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>
      ) : (
        /* 9-Box Grid Succession Modeling Board */
        <div className="space-y-6">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
            <div>
              <h4 className="text-xs font-bold text-emerald-950">Succession Modeling Tool Active</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Automatically mapping the 41 employees by cross-referencing Performance scores with Skills weightages (Potential factor). Use this matrix to plan executive promotions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-slate-100 p-4 rounded-3xl border border-slate-200">
            {/* Top Row: Performance High */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 block text-center">High Performance, Low Potential</span>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 min-h-36 max-h-48 overflow-y-auto space-y-1">
                <span className="text-[9px] font-mono text-rose-600 block uppercase font-bold mb-1.5">Solid Performers</span>
                {nineBoxGrid["High-Low"].map(e => (
                  <div key={e.id} className="text-[10px] bg-slate-50 p-1 rounded-sm truncate font-medium">{e.name}</div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 block text-center">High Performance, Med Potential</span>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 min-h-36 max-h-48 overflow-y-auto space-y-1">
                <span className="text-[9px] font-mono text-amber-600 block uppercase font-bold mb-1.5">High Growth Prospects</span>
                {nineBoxGrid["High-Med"].map(e => (
                  <div key={e.id} className="text-[10px] bg-slate-50 p-1 rounded-sm truncate font-medium">{e.name}</div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-emerald-600 block text-center">High Performance, High Potential</span>
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 min-h-36 max-h-48 overflow-y-auto space-y-1">
                <span className="text-[9px] font-mono text-emerald-700 block uppercase font-bold mb-1.5">🏆 Star Talents / Successors</span>
                {nineBoxGrid["High-High"].map(e => (
                  <div key={e.id} className="text-[10px] bg-emerald-100/60 p-1 rounded-sm truncate font-bold text-emerald-950">{e.name}</div>
                ))}
              </div>
            </div>

            {/* Mid Row: Performance Med */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 block text-center">Med Performance, Low Potential</span>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 min-h-36 max-h-48 overflow-y-auto space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold mb-1.5">Effective Workers</span>
                {nineBoxGrid["Med-Low"].map(e => (
                  <div key={e.id} className="text-[10px] bg-slate-50 p-1 rounded-sm truncate font-medium">{e.name}</div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 block text-center">Med Performance, Med Potential</span>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 min-h-36 max-h-48 overflow-y-auto space-y-1">
                <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold mb-1.5">Core Players</span>
                {nineBoxGrid["Med-Med"].map(e => (
                  <div key={e.id} className="text-[10px] bg-slate-50 p-1 rounded-sm truncate font-medium">{e.name}</div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 block text-center">Med Performance, High Potential</span>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 min-h-36 max-h-48 overflow-y-auto space-y-1">
                <span className="text-[9px] font-mono text-emerald-600 block uppercase font-bold mb-1.5">High Potential Talent</span>
                {nineBoxGrid["Med-High"].map(e => (
                  <div key={e.id} className="text-[10px] bg-slate-50 p-1 rounded-sm truncate font-medium">{e.name}</div>
                ))}
              </div>
            </div>

            {/* Bottom Row: Performance Low */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 block text-center">Low Performance, Low Potential</span>
              <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 min-h-36 max-h-48 overflow-y-auto space-y-1">
                <span className="text-[9px] font-mono text-rose-700 block uppercase font-bold mb-1.5">⚠️ Risk / Actions Required</span>
                {nineBoxGrid["Low-Low"].map(e => (
                  <div key={e.id} className="text-[10px] bg-rose-100 p-1 rounded-sm truncate font-medium text-rose-950">{e.name}</div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 block text-center">Low Performance, Med Potential</span>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 min-h-36 max-h-48 overflow-y-auto space-y-1">
                <span className="text-[9px] font-mono text-amber-600 block uppercase font-bold mb-1.5">Dilemma / Realign</span>
                {nineBoxGrid["Low-Med"].map(e => (
                  <div key={e.id} className="text-[10px] bg-slate-50 p-1 rounded-sm truncate font-medium">{e.name}</div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 block text-center">Low Performance, High Potential</span>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 min-h-36 max-h-48 overflow-y-auto space-y-1">
                <span className="text-[9px] font-mono text-emerald-500 block uppercase font-bold mb-1.5">Enigmas / Retrain</span>
                {nineBoxGrid["Low-High"].map(e => (
                  <div key={e.id} className="text-[10px] bg-slate-50 p-1 rounded-sm truncate font-medium">{e.name}</div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Goal creation modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-md w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Add Corporate Strategic OKR Goal</h3>
              <button onClick={() => setShowGoalForm(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateGoalSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="text-slate-400 block mb-1">OKR Strategic Objective</label>
                <input
                  type="text"
                  id="goal-form-title"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Integrate WorkForceHub with SAP SuccessFactors"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Key Result Target</label>
                <input
                  type="text"
                  id="goal-form-kr"
                  value={goalKeyResult}
                  onChange={(e) => setGoalKeyResult(e.target.value)}
                  placeholder="e.g. 100% database triggers compiled successfully"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Assignee (from Employees)</label>
                <select
                  id="goal-form-assignee"
                  value={goalTargetEmployee}
                  onChange={(e) => setGoalTargetEmployee(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    id="goal-form-start-date"
                    value={goalStartDate}
                    onChange={(e) => setGoalStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 font-semibold text-xs text-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Date</label>
                  <input
                    type="date"
                    id="goal-form-target-date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 font-semibold text-xs text-slate-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Goal Category</label>
                <select
                  id="goal-form-category"
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 font-semibold text-xs"
                >
                  <option value="OKR">OKR (Objectives and Key Results)</option>
                  <option value="KPI">KPI (Key Performance Indicator)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  id="btn-goal-form-cancel"
                  onClick={() => setShowGoalForm(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-goal-form-submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                >
                  Publish Goal Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
