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
  X
} from "lucide-react";
import { Goal, Employee, UserRole } from "../types";

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
  
  // New OKR Form State
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalKeyResult, setGoalKeyResult] = useState("");
  const [goalTargetEmployee, setGoalTargetEmployee] = useState(employees[0]?.id || "");

  // Filter goals for ESS
  const filteredGoals = useMemo(() => {
    if (activeRole === UserRole.CEO || activeRole === UserRole.HR_DIRECTOR) return goals;
    return goals.filter(g => g.employeeId === currentUser.id);
  }, [goals, activeRole, currentUser]);

  const handleCreateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = employees.find(emp => emp.id === goalTargetEmployee);
    const newGoal = {
      title: goalTitle,
      keyResult: goalKeyResult,
      employeeId: goalTargetEmployee,
      employeeName: targetEmp ? targetEmp.name : "Unknown",
      progress: 0,
      targetDate: "Q3 2026",
      status: "On Track"
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
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Assigned Strategic Performance Targets</h3>
            <p className="text-xs text-slate-400">Quarterly key results tracked by managers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGoals.map((goal) => (
              <div key={goal.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{goal.id} · {goal.targetDate}</span>
                    <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                      goal.status === "On Track" 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                        : "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}>
                      {goal.status}
                    </span>
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
                      onChange={(e) => onUpdateGoalProgress(goal.id, Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-ew-resize h-1 bg-slate-100 rounded-lg"
                    />
                  </div>
                </div>

              </div>
            ))}

            {filteredGoals.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                <span>No OKRs defined for your employee context.</span>
              </div>
            )}
          </div>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                  ))}
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
