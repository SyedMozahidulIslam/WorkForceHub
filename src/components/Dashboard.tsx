import React, { useMemo } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  Users, 
  Briefcase, 
  CalendarClock, 
  TrendingDown, 
  Coins, 
  Sparkles, 
  ArrowUpRight, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { Employee, JobRequisition, LeaveRequest, AttendanceRecord, PayrollRun } from "../types";

interface DashboardProps {
  employees: Employee[];
  requisitions: JobRequisition[];
  leaves: LeaveRequest[];
  attendance: AttendanceRecord[];
  payroll: PayrollRun[];
  activeRole: string;
}

export default function Dashboard({
  employees,
  requisitions,
  leaves,
  attendance,
  payroll,
  activeRole
}: DashboardProps) {

  // Dynamic calculations for enterprise dashboard stats
  const totalCount = employees.length;
  const activeVacancyCount = requisitions.reduce((acc, curr) => acc + (curr.status === "Published" ? curr.vacancies : 0), 0);
  
  const attendanceRate = useMemo(() => {
    if (attendance.length === 0) return 96.5;
    const present = attendance.filter(r => r.status === "Present" || r.status === "Late" || r.status === "Half-Day").length;
    return Math.round((present / attendance.length) * 100);
  }, [attendance]);

  const attritionRate = 3.2; // Optimized corporate average BDT tech sector
  const satisfactionScore = 88; // Percentage out of 100

  const payrollSummaryBDT = useMemo(() => {
    return employees.reduce((sum, e) => sum + e.salary, 0);
  }, [employees]);

  // Data for Headcount trend (last 6 months)
  const headcountTrendData = [
    { name: "Jan", count: 32, cost: 4.8 },
    { name: "Feb", count: 35, cost: 5.2 },
    { name: "Mar", count: 38, cost: 5.8 },
    { name: "Apr", count: 39, cost: 6.0 },
    { name: "May", count: 40, cost: 6.1 },
    { name: "Jun", count: 41, cost: 6.4 }
  ];

  // Data for Recruitment pipeline funnel
  const funnelData = [
    { stage: "Sourced", count: 120, fill: "#10b981" },
    { stage: "Screened", count: 85, fill: "#059669" },
    { stage: "Interview", count: 35, fill: "#047857" },
    { stage: "Offered", count: 12, fill: "#065f46" },
    { stage: "Accepted", count: 8, fill: "#064e3b" }
  ];

  // Department distribution
  const deptData = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(e => {
      counts[e.department] = (counts[e.department] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const COLORS = ["#34d399", "#059669", "#047857", "#10b981", "#6ee7b7", "#064e3b"];

  // AI Insights Recommendation
  const aiExecutiveRecommendations = [
    {
      id: "rec-1",
      title: "Hiring Velocity Optimizations",
      description: "Our Lead Architect **Arafat Hamim** has pointed out talent gaps in the Engineering vertical. We suggest fast-tracking the **Senior React Developer (REQ-001)** requisition to sustain Q3 velocity.",
      type: "opportunity",
      urgency: "Medium"
    },
    {
      id: "rec-2",
      title: "Bangladesh Labour Compliance Notice",
      description: "With summer shifts, standard overtime limits under Section 108 of the Labour Act should be verified. Our Compliance Officer **Sagor Ghosh** reports average OT logs at 1.8 hrs/day.",
      type: "compliance",
      urgency: "High"
    },
    {
      id: "rec-3",
      title: "Succession Risk Warning",
      description: "Our succession model identifies a potential transition vulnerability in SAP modules. **MD. Shah Sultan** is currently the single point of failure. Recommend enrolling junior developers in SAP Basis courses.",
      type: "risk",
      urgency: "Critical"
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-transparent">
      
      <div className="grid grid-cols-12 gap-4">
        
        {/* Upper Banner / Welcome Block */}
        <div className="col-span-12 relative overflow-hidden p-6 rounded-2xl border border-emerald-800/10 premium-gradient text-white flex flex-col justify-between shadow-lg shadow-emerald-500/5 select-none">
          {/* Abstract Background Ring */}
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4 pointer-events-none">
            <svg width="240" height="240" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="1"/>
              <circle cx="50" cy="50" r="25" fill="none" stroke="white" strokeWidth="2"/>
            </svg>
          </div>

          <div className="z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-white/95 bg-emerald-950/45 border border-white/10 px-2.5 py-1 rounded-md uppercase">
                Executive Command Center
              </span>
              <h2 className="text-2xl font-bold font-sans tracking-tight mt-3">
                WorkForceHub Executive Command Center
              </h2>
              <p className="text-green-100 max-w-2xl text-xs mt-1 leading-relaxed">
                AI Insights: Retention in the Tech department is up 12% this quarter. Salary benchmarking suggests a 5% adjustment for Middle Management to maintain market competitiveness under Bangladesh Labour standards.
              </p>
            </div>
            
            <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-3 shrink-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-900 font-mono">Workforce Health</div>
              <div className="text-xl font-extrabold text-emerald-950">94.2</div>
            </div>
          </div>

          <div className="z-10 flex gap-10 mt-6 pt-4 border-t border-white/10">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-green-200">Total Headcount</span>
              <span className="text-2xl font-extrabold">{employees.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-green-200">Hiring Velocity</span>
              <span className="text-2xl font-extrabold">+18.4%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-green-200">Avg Tenure</span>
              <span className="text-2xl font-extrabold">3.2Y</span>
            </div>
          </div>
        </div>

        {/* Metric Card 1: Total Employees */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2 bento-card p-5 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="pill-green">
              +14% YoY
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 font-medium font-sans">Total Headcount</span>
            <h3 className="text-2xl font-extrabold text-slate-800 font-sans tracking-tight mt-0.5">{totalCount}</h3>
          </div>
        </div>

        {/* Metric Card 2: Active Open Vacancies */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2 bento-card p-5 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-sm">
              Live ATS
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 font-medium font-sans">Active Vacancies</span>
            <h3 className="text-2xl font-extrabold text-slate-800 font-sans tracking-tight mt-0.5">{activeVacancyCount}</h3>
          </div>
        </div>

        {/* Metric Card 3: Attendance Rate */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2 bento-card p-5 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
            <span className="pill-green">
              9 AM target
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 font-medium font-sans">Attendance Rate</span>
            <h3 className="text-2xl font-extrabold text-slate-800 font-sans tracking-tight mt-0.5">{attendanceRate}%</h3>
          </div>
        </div>

        {/* Metric Card 4: Attrition Rate */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2 bento-card p-5 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
              Stable
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 font-medium font-sans">Attrition Rate</span>
            <h3 className="text-2xl font-extrabold text-slate-800 font-sans tracking-tight mt-0.5">{attritionRate}%</h3>
          </div>
        </div>

        {/* Metric Card 5: Monthly Payroll Commitment */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2 bento-card p-5 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm">
              BDT Supported
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 font-medium font-sans">Monthly Ledger</span>
            <h3 className="text-[17px] font-extrabold text-slate-800 font-sans tracking-tight mt-1.5">
              {(payrollSummaryBDT / 100000).toFixed(2)}M ৳
            </h3>
          </div>
        </div>

        {/* Metric Card 6: Engagement Index */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-2 bento-card p-5 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-sm">
              Excellent
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-400 font-medium font-sans">Engagement</span>
            <h3 className="text-2xl font-extrabold text-slate-800 font-sans tracking-tight mt-0.5">{satisfactionScore}%</h3>
          </div>
        </div>

        {/* Headcount Area Chart (Col span 8) */}
        <div className="col-span-12 lg:col-span-8 bento-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold font-sans text-slate-800 tracking-tight">Workforce Demographics & Financial Cost</h3>
              <p className="text-xs text-slate-400">Headcount expansion matched against BDT monthly expense (Million ৳).</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                <span>Headcount</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 block"></span>
                <span>Cost (Million ৳)</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={headcountTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
                <Area type="monotone" dataKey="cost" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hiring Funnel Bar Chart (Col span 4) */}
        <div className="col-span-12 lg:col-span-4 bento-card p-6 flex flex-col">
          <div>
            <h3 className="text-base font-bold font-sans text-slate-800 tracking-tight">Active Recruitment Pipeline</h3>
            <p className="text-xs text-slate-400">Yield conversion ratio across current sourced applicants.</p>
          </div>
          <div className="h-72 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="stage" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Executive AI copilot Recommendations (Col span 8) */}
        <div className="col-span-12 lg:col-span-8 bento-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
              <h3 className="text-base font-bold font-sans text-slate-800 tracking-tight">AI Executive Recommendations</h3>
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
              Updated Realtime
            </span>
          </div>

          <div className="space-y-4">
            {aiExecutiveRecommendations.map((rec) => (
              <div 
                key={rec.id} 
                className={`p-4 rounded-xl border flex gap-3.5 transition-all hover:bg-slate-50/50 ${
                  rec.urgency === "Critical" 
                    ? "border-rose-100 bg-rose-50/10" 
                    : rec.urgency === "High" 
                      ? "border-amber-100 bg-amber-50/10" 
                      : "border-slate-100 bg-slate-50/10"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  rec.urgency === "Critical" 
                    ? "bg-rose-50 text-rose-600" 
                    : rec.urgency === "High" 
                      ? "bg-amber-50 text-amber-600" 
                      : "bg-emerald-50 text-emerald-600"
                }`}>
                  {rec.urgency === "Critical" ? <AlertTriangle className="w-4.5 h-4.5" /> : rec.urgency === "High" ? <Zap className="w-4.5 h-4.5" /> : <ShieldCheck className="w-4.5 h-4.5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-800">{rec.title}</h4>
                    <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-xs ${
                      rec.urgency === "Critical" 
                        ? "bg-rose-100 text-rose-700" 
                        : rec.urgency === "High" 
                          ? "bg-amber-100 text-amber-700" 
                          : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {rec.urgency}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: rec.description }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Have other strategic or labor queries?</span>
            <button 
              onClick={() => {
                const copilotBtn = document.getElementById("btn-sidebar-ai-copilot");
                if (copilotBtn) copilotBtn.click();
              }}
              className="text-emerald-600 font-semibold flex items-center gap-1 hover:text-emerald-700 transition"
            >
              Ask WFH Copilot <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Department Headcount Pie Chart (Col span 4) */}
        <div className="col-span-12 lg:col-span-4 bento-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-sans text-slate-800 tracking-tight">Workforce Distribution</h3>
            <p className="text-xs text-slate-400">Current active headcounts allocated across strategic business verticals.</p>
          </div>
          <div className="h-48 w-full relative flex items-center justify-center my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-extrabold text-slate-800 leading-none">{totalCount}</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-1">Headcount</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 border-t border-slate-100 pt-4">
            {deptData.slice(0, 4).map((d, index) => (
              <div key={d.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full block shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="truncate">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
