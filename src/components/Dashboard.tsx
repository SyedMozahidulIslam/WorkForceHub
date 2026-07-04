import React, { useMemo, useState, useEffect } from "react";
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
  TrendingUp,
  Clock,
  ArrowRight,
  Info,
  Layers,
  FileText,
  HelpCircle,
  FileCheck,
  UserPlus,
  LayoutGrid,
  Flame,
  Scale,
  ShieldAlert,
  Loader2
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

  const attritionRate = 3.2; // Corporate tech sector benchmark
  const satisfactionScore = 88; // Percentage out of 100

  const payrollSummaryBDT = useMemo(() => {
    return employees.reduce((sum, e) => sum + e.salary, 0);
  }, [employees]);

  // Interactive controls state
  const [chartTimeframe, setChartTimeframe] = useState<"3M" | "6M" | "YTD">("6M");
  const [urgencyFilter, setUrgencyFilter] = useState<"All" | "Critical" | "High" | "Medium">("All");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // CEO Strategic Workforce Projections state
  const [planningMode, setPlanningMode] = useState<"freeze" | "baseline" | "aggressive" | "downsize" | "custom">("baseline");
  const [customGrowth, setCustomGrowth] = useState<number>(5); // -15% to +25%
  const [customSalaryInflation, setCustomSalaryInflation] = useState<number>(2); // -10% to +15%

  // Bangladesh Labour Act (BLA) Real-Time Compliance Alerts
  const [complianceAlerts, setComplianceAlerts] = useState([
    {
      id: "bla-001",
      section: "Section 100 / 108",
      title: "Overtime Threshold Violation",
      description: "Engineering Department has 3 active FTEs exceeding the maximum legal cap of 60 working hours this week (including overtime limits).",
      riskLevel: "Critical" as const,
      status: "Active" as const,
      quickFixText: "Rebalance Shift Schedule"
    },
    {
      id: "bla-002",
      section: "Section 46 / 47",
      title: "Maternity Ledger Discrepancy",
      description: "Pending statutory maternal leave payout validation for Employee #EMP-042 (Marketing) within the required timeline.",
      riskLevel: "Critical" as const,
      status: "Active" as const,
      quickFixText: "Authorize Maternal Payout"
    },
    {
      id: "bla-003",
      section: "Section 103",
      title: "Consecutive Shifts No Holiday",
      description: "Operations Department scheduled 4 logistics personnel for 9 consecutive workdays without the mandatory 24-hour weekly holiday.",
      riskLevel: "High" as const,
      status: "Active" as const,
      quickFixText: "Enforce Rest-Day Schedule"
    },
    {
      id: "bla-004",
      section: "Section 121",
      title: "Delayed Wage Disbursement",
      description: "2 temporary contractual staff wage entries are pending past the 7th-day statutory deadline from the wage period expiration.",
      riskLevel: "High" as const,
      status: "Active" as const,
      quickFixText: "Run Off-cycle Payroll"
    },
    {
      id: "bla-005",
      section: "Section 115",
      title: "Sick Leave Documentation Gap",
      description: "Mismatched record: 2 sick leaves approved in Finance Department without standard registered medical practitioner certifications.",
      riskLevel: "Medium" as const,
      status: "Active" as const,
      quickFixText: "Request Medical Proof"
    }
  ]);

  const handleResolveAlert = (id: string) => {
    // Set status to "Resolving" to show a spinner
    setComplianceAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, status: "Resolving" as const } : alert
    ));

    // After 1.2 seconds, mark as "Resolved"
    setTimeout(() => {
      setComplianceAlerts(prev => prev.map(alert => 
        alert.id === id ? { ...alert, status: "Resolved" as const } : alert
      ));
    }, 1200);
  };

  // Keep a real-time clock running
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Bangladesh Standard Time or Local Time elegantly
  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  }, [currentTime]);

  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }, [currentTime]);

  // Data for Headcount trend (interactive filter support)
  const fullHeadcountTrendData = [
    { name: "Jan", count: 32, cost: 4.8 },
    { name: "Feb", count: 35, cost: 5.2 },
    { name: "Mar", count: 38, cost: 5.8 },
    { name: "Apr", count: 39, cost: 6.0 },
    { name: "May", count: 40, cost: 6.1 },
    { name: "Jun", count: 41, cost: 6.4 }
  ];

  const headcountTrendData = useMemo(() => {
    if (chartTimeframe === "3M") {
      return fullHeadcountTrendData.slice(3);
    }
    return fullHeadcountTrendData;
  }, [chartTimeframe]);

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

  const COLORS = ["#10b981", "#059669", "#047857", "#34d399", "#6ee7b7", "#064e3b"];

  // AI Insights Recommendations
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

  const filteredRecommendations = useMemo(() => {
    if (urgencyFilter === "All") return aiExecutiveRecommendations;
    return aiExecutiveRecommendations.filter(rec => rec.urgency === urgencyFilter);
  }, [urgencyFilter]);

  // Generate dynamic activities based on real application state (Leave, Job Requisitions, New hires)
  const recentActivities = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      desc: string;
      time: string;
      icon: React.ReactNode;
      badgeColor: string;
      badgeText: string;
    }> = [];

    // 1. Add Leave requests
    leaves.slice(0, 3).forEach((req) => {
      list.push({
        id: `leave-${req.id}`,
        title: req.employeeName,
        desc: `Requested ${req.days} days of ${req.type} leave: "${req.reason.substring(0, 45)}..."`,
        time: req.appliedDate || "1 day ago",
        icon: <CalendarClock className="w-4 h-4 text-amber-500" />,
        badgeColor: req.status === "Pending" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800",
        badgeText: req.status
      });
    });

    // 2. Add Requisition status updates
    requisitions.slice(0, 2).forEach((req) => {
      list.push({
        id: `req-${req.id}`,
        title: `${req.title}`,
        desc: `Recruitment vertical opened ${req.vacancies} vacancies in ${req.department}.`,
        time: req.postedDate || "Recent",
        icon: <Briefcase className="w-4 h-4 text-emerald-500" />,
        badgeColor: "bg-emerald-100 text-emerald-800",
        badgeText: req.status
      });
    });

    // 3. New Hires sorted by dynamic context
    employees.slice(0, 2).forEach((emp) => {
      list.push({
        id: `emp-new-${emp.id}`,
        title: emp.name,
        desc: `Onboarded as ${emp.role} within the ${emp.department} vertical.`,
        time: emp.joiningDate || "Joined recently",
        icon: <UserPlus className="w-4 h-4 text-emerald-500" />,
        badgeColor: "bg-emerald-50 text-emerald-700",
        badgeText: emp.status
      });
    });

    // Mix and slice to keep the feed super crisp and compact (top 5 activities)
    return list.slice(0, 5);
  }, [leaves, requisitions, employees]);

  // Operational metrics calculated
  const pendingLeavesCount = leaves.filter(l => l.status === "Pending").length;
  const highPriorityTicketsCount = 3;

  // Sparkline trend datasets representing real-time/historic fluctuations
  const headcountTrend = useMemo(() => [
    { value: Math.max(10, totalCount - 8) },
    { value: Math.max(12, totalCount - 5) },
    { value: Math.max(15, totalCount - 3) },
    { value: Math.max(18, totalCount - 2) },
    { value: Math.max(20, totalCount - 1) },
    { value: totalCount }
  ], [totalCount]);

  const recruitmentTrend = useMemo(() => [
    { value: Math.max(1, activeVacancyCount - 3) },
    { value: Math.max(2, activeVacancyCount + 1) },
    { value: Math.max(1, activeVacancyCount - 1) },
    { value: Math.max(3, activeVacancyCount + 2) },
    { value: Math.max(2, activeVacancyCount - 2) },
    { value: activeVacancyCount }
  ], [activeVacancyCount]);

  const attendanceTrend = useMemo(() => [
    { value: 92 },
    { value: 94 },
    { value: 91 },
    { value: 95 },
    { value: 93 },
    { value: attendanceRate }
  ], [attendanceRate]);

  const attritionTrend = useMemo(() => [
    { value: 3.5 },
    { value: 3.4 },
    { value: 3.6 },
    { value: 3.1 },
    { value: 3.3 },
    { value: attritionRate }
  ], [attritionRate]);

  const payrollTrend = useMemo(() => [
    { value: 4.8 },
    { value: 5.2 },
    { value: 5.5 },
    { value: 5.9 },
    { value: 6.1 },
    { value: Number((payrollSummaryBDT / 100000).toFixed(2)) }
  ], [payrollSummaryBDT]);

  const engagementTrend = useMemo(() => [
    { value: 85 },
    { value: 86 },
    { value: 88 },
    { value: 87 },
    { value: 89 },
    { value: satisfactionScore }
  ], [satisfactionScore]);

  // CEO Strategic Workforce Projections simulator calculation
  const simulatedQuarters = useMemo(() => {
    const qData = [];
    let currentHeadcount = totalCount || 30;
    let currentMonthlySalarySum = payrollSummaryBDT || 2500000;
    
    // Base rates depending on simulation mode
    let quarterlyHeadcountGrowth = 0.04; // default baseline
    let quarterlySalaryInflation = 0.02; // default baseline
    let organicRevenueGrowth = 0.05;     // default baseline
    
    if (planningMode === "freeze") {
      quarterlyHeadcountGrowth = 0;
      quarterlySalaryInflation = 0.01;
      organicRevenueGrowth = 0.035;
    } else if (planningMode === "aggressive") {
      quarterlyHeadcountGrowth = 0.12;
      quarterlySalaryInflation = 0.04;
      organicRevenueGrowth = 0.07;
    } else if (planningMode === "downsize") {
      quarterlyHeadcountGrowth = -0.05;
      quarterlySalaryInflation = 0.00;
      organicRevenueGrowth = -0.015;
    } else if (planningMode === "custom") {
      quarterlyHeadcountGrowth = customGrowth / 100;
      quarterlySalaryInflation = customSalaryInflation / 100;
      organicRevenueGrowth = 0.04 + (quarterlyHeadcountGrowth * 0.35);
    }

    // Baseline quarterly revenue per employee is around 750,000 BDT (250K per month)
    let currentRevenuePerEmployee = 750000;
    let currentTotalRevenue = currentHeadcount * currentRevenuePerEmployee;

    for (let q = 1; q <= 4; q++) {
      const qName = `Q${q} 25/26`;
      
      const prevHeadcount = currentHeadcount;
      currentHeadcount = Math.max(5, Math.round(currentHeadcount * (1 + quarterlyHeadcountGrowth)));
      
      // Inflate salaries
      currentMonthlySalarySum = currentMonthlySalarySum * (1 + quarterlySalaryInflation);
      const averageMonthlySalary = prevHeadcount > 0 ? (currentMonthlySalarySum / prevHeadcount) : 75000;
      
      // Estimated quarterly cost including 1.25x employer overhead (taxes, space, benefits, insurance)
      const estimatedQuarterlyCost = (averageMonthlySalary * 3 * 1.25) * currentHeadcount;
      
      // Calculate revenue growth
      let qRevenueGrowth = organicRevenueGrowth;
      // In aggressive, productivity lags in the first two quarters but pays off in Q3/Q4
      if (planningMode === "aggressive") {
        qRevenueGrowth = q <= 2 ? 0.04 : 0.15;
      } else if (planningMode === "downsize") {
        // Under downsizing, productivity first spikes slightly due to focus, then stabilizes
        qRevenueGrowth = q <= 1 ? 0.01 : -0.02;
      }
      
      currentTotalRevenue = currentTotalRevenue * (1 + qRevenueGrowth);
      const revenuePerEmployee = currentHeadcount > 0 ? Math.round(currentTotalRevenue / currentHeadcount) : 0;
      
      qData.push({
        name: qName,
        headcount: currentHeadcount,
        workforceCost: Number((estimatedQuarterlyCost / 1000000).toFixed(2)), // in Millions BDT
        revenuePerEmployee: Number((revenuePerEmployee / 1000).toFixed(1)), // in Thousands BDT
        totalRevenue: Number((currentTotalRevenue / 1000000).toFixed(2)) // in Millions BDT
      });
    }
    
    return qData;
  }, [totalCount, payrollSummaryBDT, planningMode, customGrowth, customSalaryInflation]);

  // Dynamic organization health matrix calculations for departments
  const orgHealthData = useMemo(() => {
    const depts = Array.from(new Set(employees.map(e => e.department))).filter(Boolean);
    const standardDepts = depts.length > 0 ? depts : ["Engineering", "Operations", "HR", "Sales", "Finance", "Marketing"];

    return standardDepts.map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept);
      const headcount = deptEmployees.length || Math.floor(Math.random() * 8) + 3;

      // Calculate Burnout Risk (0 - 100)
      // Indicator: Higher average OT hours + high ratings (overloaded performers) + low leave balance
      const deptAttendance = attendance.filter(a => a.department === dept);
      const avgOT = deptAttendance.length > 0 
        ? deptAttendance.reduce((sum, a) => sum + (a.otHours || 0), 0) / deptAttendance.length 
        : (dept === "Engineering" || dept === "Operations" ? 2.4 : 1.1);

      const avgLeaveBalance = deptEmployees.length > 0
        ? deptEmployees.reduce((sum, e) => {
            const lb = e.leaveBalance;
            return sum + (lb ? (lb.casual + lb.sick + lb.earned) : 22);
          }, 0) / deptEmployees.length
        : 22;

      const otFactor = Math.min(45, (avgOT / 3) * 45); 
      const leaveFactor = Math.min(25, (1 - Math.min(1, avgLeaveBalance / 30)) * 25);
      const baseBurnout = dept === "Engineering" ? 48 : dept === "Sales" ? 52 : 35;
      const burnout = Math.min(95, Math.max(15, Math.round(baseBurnout + otFactor + leaveFactor)));

      // Calculate Turnover Risk (0 - 100)
      // Indicator: High Burnout + salary levels or high perform ratings with lower salary
      const avgSalary = deptEmployees.length > 0
        ? deptEmployees.reduce((sum, e) => sum + e.salary, 0) / deptEmployees.length
        : 65000;

      const avgRating = deptEmployees.length > 0
        ? deptEmployees.reduce((sum, e) => sum + e.performanceRating, 0) / deptEmployees.length
        : (dept === "Engineering" ? 4.1 : 3.6);

      const salaryDisparity = avgSalary < 60000 ? 15 : avgSalary < 90000 ? 5 : -10;
      const ratingFactor = avgRating > 4.0 ? 12 : avgRating < 2.5 ? 18 : 0;
      const baseTurnover = Math.round(burnout * 0.4 + 10 + salaryDisparity + ratingFactor);
      const turnover = Math.min(92, Math.max(12, baseTurnover));

      // Calculate Engagement Score (0 - 100)
      // Indicator: High attendance rates + healthy leaves + positive rating averages
      const totalAttendanceCount = deptAttendance.length;
      const presentCount = deptAttendance.filter(a => a.status === "Present" || a.status === "Late" || a.status === "Half-Day").length;
      const attendanceRateValue = totalAttendanceCount > 0 ? (presentCount / totalAttendanceCount) * 100 : (dept === "HR" ? 98 : 94);

      const engagement = Math.min(98, Math.max(40, Math.round(
        (attendanceRateValue * 0.6) + 
        (avgRating * 6) + 
        (100 - burnout) * 0.15
      )));

      return {
        department: dept,
        headcount,
        burnout,
        turnover,
        engagement
      };
    });
  }, [employees, attendance]);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50/50">
      
      {/* Primary 12-Column Bento Grid Container */}
      <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
        
        {/* Row 1: Banner / Welcome Block (8-columns) */}
        <div className="col-span-12 lg:col-span-8 relative overflow-hidden p-6 lg:p-8 rounded-2xl border border-emerald-800/10 premium-gradient text-white flex flex-col justify-between shadow-lg shadow-emerald-500/10 select-none min-h-[220px]">
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
              <h2 className="text-2xl lg:text-3xl font-bold font-sans tracking-tight mt-3">
                WorkForceHub Executive Command Center
              </h2>
              <p className="text-green-100 max-w-2xl text-xs mt-2 leading-relaxed">
                AI Operational Digest: Technical department retention has risen 12% this quarter. Automated payroll simulations estimate Q3 compliance matching Bangladesh Standard hours with perfect accuracy.
              </p>
            </div>
          </div>

          <div className="z-10 flex flex-wrap gap-8 lg:gap-12 mt-6 pt-5 border-t border-white/10">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono font-bold text-green-200/90 tracking-wider">Total Headcount</span>
              <span className="text-2xl font-extrabold mt-0.5">{totalCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono font-bold text-green-200/90 tracking-wider">Hiring Velocity</span>
              <span className="text-2xl font-extrabold mt-0.5">+18.4%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono font-bold text-green-200/90 tracking-wider">Avg Tenure</span>
              <span className="text-2xl font-extrabold mt-0.5">3.2 Years</span>
            </div>
          </div>
        </div>

        {/* Row 1: Strategic Pulse & Live BST Clock (4-columns) */}
        <div className="col-span-12 lg:col-span-4 bento-card p-6 flex flex-col justify-between relative overflow-hidden bg-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-700 uppercase">Live Operations</span>
            </div>
            <span className="text-[10px] font-mono font-semibold text-slate-400">Dhaka HQ</span>
          </div>

          <div className="my-4">
            <div className="text-3xl font-extrabold text-slate-800 font-mono tracking-tight">{formattedTime}</div>
            <div className="text-xs text-slate-500 mt-1 font-sans">{formattedDate}</div>
          </div>

          <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Operational Index</span>
              <span className="text-lg font-bold text-slate-800 font-sans">94.2 / 100</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Action Items</span>
              <span className="text-lg font-bold text-slate-800 font-sans">
                {pendingLeavesCount + highPriorityTicketsCount} Pending
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Summary Metrics (6 separate 3-column bento-cards = 12 columns total per row) */}
        {/* Metric 1: Total Employees */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 bento-card p-5 flex flex-col justify-between hover:border-indigo-500/30 group bg-white">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <span className="pill-green scale-90 bg-indigo-50 text-indigo-700 border border-indigo-100">
              +14% YoY
            </span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <span className="text-[11px] text-slate-400 font-medium font-sans block">Total Headcount</span>
              <span className="text-2xl font-black text-slate-800 font-sans tracking-tight mt-0.5 block">{totalCount}</span>
            </div>
            <div className="h-10 w-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={headcountTrend} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id="sparklineHeadcount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={1.5} fillOpacity={1} fill="url(#sparklineHeadcount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Metric 2: Active Open Vacancies */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 bento-card p-5 flex flex-col justify-between hover:border-teal-500/30 group bg-white">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-mono font-bold text-teal-600 bg-teal-50/70 px-1.5 py-0.5 rounded-sm border border-teal-100/55">
              Live ATS
            </span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <span className="text-[11px] text-slate-400 font-medium font-sans block">Active Recruitment</span>
              <span className="text-2xl font-black text-slate-800 font-sans tracking-tight mt-0.5 block">{activeVacancyCount}</span>
            </div>
            <div className="h-10 w-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recruitmentTrend} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id="sparklineRecruitment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={1.5} fillOpacity={1} fill="url(#sparklineRecruitment)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Metric 3: Attendance Rate */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 bento-card p-5 flex flex-col justify-between hover:border-emerald-500/30 group bg-white">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CalendarClock className="w-5 h-5" />
            </div>
            <span className="pill-green scale-90 bg-emerald-50 text-emerald-700 border border-emerald-100">
              96% KPI
            </span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <span className="text-[11px] text-slate-400 font-medium font-sans block">Attendance Rate</span>
              <span className="text-2xl font-black text-slate-800 font-sans tracking-tight mt-0.5 block">{attendanceRate}%</span>
            </div>
            <div className="h-10 w-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrend} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id="sparklineAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#sparklineAttendance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Metric 4: Attrition Rate */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 bento-card p-5 flex flex-col justify-between hover:border-amber-500/30 group bg-white">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-100/55">
              Healthy
            </span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <span className="text-[11px] text-slate-400 font-medium font-sans block">Attrition Rate</span>
              <span className="text-2xl font-black text-slate-800 font-sans tracking-tight mt-0.5 block">{attritionRate}%</span>
            </div>
            <div className="h-10 w-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attritionTrend} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id="sparklineAttrition" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#sparklineAttrition)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Metric 5: Monthly Payroll Ledger */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 bento-card p-5 flex flex-col justify-between hover:border-rose-500/30 group bg-white">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-sm border border-rose-100/55">
              BDT
            </span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <span className="text-[11px] text-slate-400 font-medium font-sans block">Monthly Ledger</span>
              <span className="text-2xl font-black text-slate-800 font-sans tracking-tight mt-0.5 block">
                {(payrollSummaryBDT / 100000).toFixed(2)}M ৳
              </span>
            </div>
            <div className="h-10 w-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={payrollTrend} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id="sparklinePayroll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={1.5} fillOpacity={1} fill="url(#sparklinePayroll)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Metric 6: Engagement Index */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 bento-card p-5 flex flex-col justify-between hover:border-violet-500/30 group bg-white">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-mono font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-sm border border-violet-100/55">
              Excellent
            </span>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <span className="text-[11px] text-slate-400 font-medium font-sans block">Engagement</span>
              <span className="text-2xl font-black text-slate-800 font-sans tracking-tight mt-0.5 block">{satisfactionScore}%</span>
            </div>
            <div className="h-10 w-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementTrend} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id="sparklineEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={1.5} fillOpacity={1} fill="url(#sparklineEngagement)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 3: Workforce Area Chart (8-columns) */}
        <div className="col-span-12 lg:col-span-8 bento-card p-6 flex flex-col justify-between bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold font-sans text-slate-800 tracking-tight flex items-center gap-1.5">
                <Layers className="w-4.5 h-4.5 text-emerald-600" />
                Workforce Growth & Financial Commitment
              </h3>
              <p className="text-xs text-slate-400">Headcount expansion matched against monthly expense metrics (Millions ৳).</p>
            </div>
            
            {/* Interactive Timeline Tabs */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg select-none">
              {(["3M", "6M"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartTimeframe(t)}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                    chartTimeframe === t 
                      ? "bg-white text-emerald-700 shadow-xs" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {t}
                </button>
              ))}
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
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" name="Headcount (FTEs)" />
                <Area type="monotone" dataKey="cost" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" name="Ledger (Million ৳)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 3: Active Recruitment Pipeline Funnel (4-columns) */}
        <div className="col-span-12 lg:col-span-4 bento-card p-6 flex flex-col justify-between bg-white">
          <div>
            <h3 className="text-base font-bold font-sans text-slate-800 tracking-tight flex items-center gap-1.5">
              <Activity className="w-4.5 h-4.5 text-emerald-600" />
              Active Recruitment Funnel
            </h3>
            <p className="text-xs text-slate-400">Total sourced applicants converting across critical hiring stages.</p>
          </div>
          
          <div className="h-72 w-full mt-4">
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

        {/* Row 4: AI Executive Recommendations (8-columns) */}
        <div className="col-span-12 lg:col-span-8 bento-card p-6 flex flex-col justify-between bg-white">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse shrink-0" />
                <div>
                  <h3 className="text-base font-bold font-sans text-slate-800 tracking-tight">AI Executive Recommendations</h3>
                  <p className="text-xs text-slate-400">Actionable opportunities and mitigation strategies compiled in real-time.</p>
                </div>
              </div>

              {/* Urgency Filter Tabs */}
              <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-100 shrink-0">
                {(["All", "Critical", "High", "Medium"] as const).map((urg) => (
                  <button
                    key={urg}
                    onClick={() => setUrgencyFilter(urg)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all ${
                      urgencyFilter === urg 
                        ? "bg-white text-emerald-700 shadow-xs border border-slate-100" 
                        : "text-slate-400 hover:text-slate-800"
                    }`}
                  >
                    {urg}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredRecommendations.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  No recommendations match the current filters.
                </div>
              ) : (
                filteredRecommendations.map((rec) => (
                  <div 
                    key={rec.id} 
                    className={`p-4 rounded-xl border flex gap-3.5 transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                      rec.urgency === "Critical" 
                        ? "border-rose-100 bg-rose-50/10" 
                        : rec.urgency === "High" 
                          ? "border-amber-100 bg-amber-50/10" 
                          : "border-slate-100 bg-slate-50/10"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      rec.urgency === "Critical" 
                        ? "bg-rose-100/60 text-rose-600" 
                        : rec.urgency === "High" 
                          ? "bg-amber-100/60 text-amber-600" 
                          : "bg-emerald-100/60 text-emerald-600"
                    }`}>
                      {rec.urgency === "Critical" ? (
                        <AlertTriangle className="w-4.5 h-4.5" />
                      ) : rec.urgency === "High" ? (
                        <Zap className="w-4.5 h-4.5" />
                      ) : (
                        <ShieldCheck className="w-4.5 h-4.5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-800">{rec.title}</h4>
                        <span className={`text-[9px] font-mono uppercase font-black px-1.5 py-0.5 rounded-sm ${
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
                ))
              )}
            </div>
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

        {/* Row 4: Recent Operational Activity Feed (4-columns - BRAND NEW ACTIVITY FEED BENTO CARD) */}
        <div className="col-span-12 lg:col-span-4 bento-card p-6 flex flex-col justify-between bg-white">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold font-sans text-slate-800 tracking-tight flex items-center gap-1.5">
                <FileText className="w-4.5 h-4.5 text-emerald-600" />
                Operational Feed
              </h3>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                Live Log
              </span>
            </div>

            <div className="space-y-4">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex gap-3 group transition-all duration-200">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-50/50 group-hover:border-emerald-100">
                    {act.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 truncate block">
                        {act.title}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 shrink-0 uppercase">
                        {act.time}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">
                      {act.desc}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full ${act.badgeColor}`}>
                        {act.badgeText}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Dynamic workspace ledger</span>
              <span className="font-mono text-[10px] text-emerald-600 font-bold uppercase">Ready</span>
            </div>
          </div>
        </div>

        {/* Row 4.5: Organization Health Heatmap (12-columns - BRAND NEW BENTO CARD) */}
        <div className="col-span-12 bento-card p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-base font-bold font-sans text-slate-800 tracking-tight">Organization Health Heatmap</h3>
                  <p className="text-xs text-slate-400">Departmental stress markers, turnover risk, and active cultural engagement models.</p>
                </div>
              </div>

              {/* Color Code Legend */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-mono font-bold">
                <span className="text-slate-400 uppercase tracking-wider mr-1">Legend:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 border border-emerald-600/10 inline-block"></span>
                  <span className="text-emerald-700">Optimal (&ge;85% Engagement / &lt;40% Risk)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500 border border-amber-600/10 inline-block"></span>
                  <span className="text-amber-700">Monitor (70-84% Engagement / 40-65% Risk)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500 border border-rose-600/10 inline-block"></span>
                  <span className="text-rose-700">Elevated Stress (&lt;70% Engagement / &ge;65% Risk)</span>
                </span>
              </div>
            </div>

            {/* Heatmap Matrix Grid/Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-mono text-slate-500 uppercase font-black">
                    <th className="py-3.5 px-4 font-black">Department</th>
                    <th className="py-3.5 px-4 text-center font-black">Active FTEs</th>
                    <th className="py-3.5 px-4 font-black">Burnout Index</th>
                    <th className="py-3.5 px-4 font-black">Turnover Risk</th>
                    <th className="py-3.5 px-4 font-black">Engagement Score</th>
                    <th className="py-3.5 px-4 font-black text-right">Operational Health Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {orgHealthData.map((data) => {
                    // Burnout colors & levels
                    const isBurnoutHigh = data.burnout >= 75;
                    const isBurnoutMed = data.burnout >= 50 && data.burnout < 75;
                    const burnoutColor = isBurnoutHigh 
                      ? "bg-rose-50 text-rose-700 border-rose-100/70" 
                      : isBurnoutMed 
                        ? "bg-amber-50 text-amber-700 border-amber-100/70" 
                        : "bg-emerald-50 text-emerald-700 border-emerald-100/70";
                    const burnoutLevel = isBurnoutHigh ? "High Stress" : isBurnoutMed ? "Moderate" : "Healthy";

                    // Turnover colors & levels
                    const isTurnoverHigh = data.turnover >= 65;
                    const isTurnoverMed = data.turnover >= 40 && data.turnover < 65;
                    const turnoverColor = isTurnoverHigh 
                      ? "bg-rose-50 text-rose-700 border-rose-100/70" 
                      : isTurnoverMed 
                        ? "bg-amber-50 text-amber-700 border-amber-100/70" 
                        : "bg-emerald-50 text-emerald-700 border-emerald-100/70";
                    const turnoverLevel = isTurnoverHigh ? "Critical Risk" : isTurnoverMed ? "Elevated" : "Stable";

                    // Engagement colors & levels
                    const isEngagementLow = data.engagement < 70;
                    const isEngagementMed = data.engagement >= 70 && data.engagement < 85;
                    const engagementColor = isEngagementLow 
                      ? "bg-rose-50 text-rose-700 border-rose-100/70" 
                      : isEngagementMed 
                        ? "bg-amber-50 text-amber-700 border-amber-100/70" 
                        : "bg-emerald-50 text-emerald-700 border-emerald-100/70";
                    const engagementLevel = isEngagementLow ? "Disengaged" : isEngagementMed ? "Average" : "Thriving";

                    // Overall Health Verdict
                    let verdictText = "Stable Operations";
                    let verdictClass = "bg-slate-50 text-slate-700 border-slate-200";
                    let VerdictIcon = ShieldCheck;

                    if (isBurnoutHigh || isTurnoverHigh) {
                      verdictText = "Critical Action Required";
                      verdictClass = "bg-rose-50 text-rose-700 border-rose-200";
                      VerdictIcon = AlertTriangle;
                    } else if (isBurnoutMed || isTurnoverMed || isEngagementLow) {
                      verdictText = "Intervention Recommended";
                      verdictClass = "bg-amber-50 text-amber-700 border-amber-200";
                      VerdictIcon = Zap;
                    } else if (data.engagement >= 85) {
                      verdictText = "Exemplary Cultural Health";
                      verdictClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                      VerdictIcon = CheckCircle;
                    }

                    return (
                      <tr key={data.department} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-800">{data.department}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 text-slate-600 font-mono font-bold border border-slate-100">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {data.headcount}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 w-32 md:w-40">
                            <div className={`flex items-center justify-between px-2 py-1 rounded-lg border text-[11px] font-medium ${burnoutColor}`}>
                              <span className="font-mono font-bold">{data.burnout}%</span>
                              <span className="text-[10px] opacity-90">{burnoutLevel}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full">
                              <div 
                                className={`h-full rounded-full ${isBurnoutHigh ? "bg-rose-500" : isBurnoutMed ? "bg-amber-500" : "bg-emerald-500"}`}
                                style={{ width: `${data.burnout}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 w-32 md:w-40">
                            <div className={`flex items-center justify-between px-2 py-1 rounded-lg border text-[11px] font-medium ${turnoverColor}`}>
                              <span className="font-mono font-bold">{data.turnover}%</span>
                              <span className="text-[10px] opacity-90">{turnoverLevel}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full">
                              <div 
                                className={`h-full rounded-full ${isTurnoverHigh ? "bg-rose-500" : isTurnoverMed ? "bg-amber-500" : "bg-emerald-500"}`}
                                style={{ width: `${data.turnover}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 w-32 md:w-40">
                            <div className={`flex items-center justify-between px-2 py-1 rounded-lg border text-[11px] font-medium ${engagementColor}`}>
                              <span className="font-mono font-bold">{data.engagement}%</span>
                              <span className="text-[10px] opacity-90">{engagementLevel}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full">
                              <div 
                                className={`h-full rounded-full ${isEngagementLow ? "bg-rose-500" : isEngagementMed ? "bg-amber-500" : "bg-emerald-500"}`}
                                style={{ width: `${data.engagement}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${verdictClass}`}>
                            <VerdictIcon className="w-3.5 h-3.5" />
                            {verdictText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Row 4.7: CEO Workforce Planning Simulator (12-columns - BRAND NEW BENTO CARD) */}
        <div className="col-span-12 bento-card p-6 bg-white flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Coins className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold font-sans text-slate-800 tracking-tight flex items-center gap-1.5">
                    Strategic Workforce Planning Simulator
                  </h3>
                  <p className="text-xs text-slate-400">Evaluate impact of hiring freezes or business expansions on corporate efficiency models.</p>
                </div>
              </div>
              
              {/* Target User Segment Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                CEO Executive Suite
              </span>
            </div>

            {/* Main Interactive Workspace Grid */}
            <div className="grid grid-cols-12 gap-6">
              
              {/* Left Column: Interactive Controls Panel (4-cols) */}
              <div className="col-span-12 lg:col-span-4 bg-slate-50/70 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between gap-5">
                <div>
                  <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block mb-3">Simulation Scenarios</span>
                  
                  {/* Segmented Controls */}
                  <div className="space-y-2">
                    {[
                      { id: "baseline", name: "Moderate Expansion", desc: "Default operational growth model (+4%/qtr)", icon: TrendingUp },
                      { id: "freeze", name: "Hiring Freeze", desc: "Freeze all new headcounts, optimize active pods", icon: Flame },
                      { id: "aggressive", name: "Aggressive Expansion", desc: "High velocity scale-up across verticals (+12%/qtr)", icon: Sparkles },
                      { id: "downsize", name: "Strategic Downsizing", desc: "Rationalize active FTE footprint (-5%/qtr)", icon: TrendingDown },
                      { id: "custom", name: "Custom Sandbox Mode", desc: "Fully adjust hiring rate and compensation ratios", icon: Activity }
                    ].map((mode) => {
                      const ModeIcon = mode.icon;
                      const isSelected = planningMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setPlanningMode(mode.id as any)}
                          className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected 
                              ? "bg-white border-emerald-500 shadow-sm shadow-emerald-500/5 text-slate-800" 
                              : "bg-transparent border-slate-200/60 text-slate-600 hover:bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isSelected ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-100 border-slate-200/50 text-slate-500"
                          }`}>
                            <ModeIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold">{mode.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate leading-none">{mode.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Parameters Block */}
                <div className={`border-t border-slate-200/60 pt-4 mt-2 transition-all duration-300 ${
                  planningMode === "custom" ? "opacity-100 scale-100" : "opacity-40 scale-[0.98] pointer-events-none"
                }`}>
                  <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block mb-3">Custom Sandbox Controls</span>
                  
                  <div className="space-y-4">
                    {/* Hiring Rate Slider */}
                    <div>
                      <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-600 mb-1.5">
                        <span>Headcount Growth Rate:</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${customGrowth >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                          {customGrowth >= 0 ? "+" : ""}{customGrowth}% / quarter
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="-15" 
                        max="25" 
                        value={customGrowth}
                        onChange={(e) => setCustomGrowth(parseInt(e.target.value))}
                        disabled={planningMode !== "custom"}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                    </div>

                    {/* Salary Inflation Slider */}
                    <div>
                      <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-600 mb-1.5">
                        <span>Salary Adjustments:</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${customSalaryInflation >= 0 ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"}`}>
                          {customSalaryInflation >= 0 ? "+" : ""}{customSalaryInflation}% / quarter
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="-10" 
                        max="15" 
                        value={customSalaryInflation}
                        onChange={(e) => setCustomSalaryInflation(parseInt(e.target.value))}
                        disabled={planningMode !== "custom"}
                        className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Outcomes, Projections & Dual-Axis Visualization (8-cols) */}
              <div className="col-span-12 lg:col-span-8 flex flex-col justify-between gap-6">
                
                {/* 4th Quarter Output Highlights Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Projected Headcount */}
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Year-End Headcount</span>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="text-2xl font-black font-sans text-slate-800 tracking-tight">
                        {simulatedQuarters[3]?.headcount}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">FTEs</span>
                    </div>
                    <div className="text-[10px] font-mono mt-1 text-slate-500">
                      Delta: <span className={`font-bold ${
                        (simulatedQuarters[3]?.headcount - totalCount) >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {(simulatedQuarters[3]?.headcount - totalCount) >= 0 ? "+" : ""}
                        {simulatedQuarters[3]?.headcount - totalCount} ({Math.round(((simulatedQuarters[3]?.headcount - totalCount) / (totalCount || 1)) * 100)}%)
                      </span>
                    </div>
                  </div>

                  {/* Total Workforce Cost */}
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Q4 Workforce Cost</span>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-[10px] font-bold text-slate-400">BDT</span>
                      <span className="text-2xl font-black font-sans text-slate-800 tracking-tight">
                        ৳{simulatedQuarters[3]?.workforceCost}M
                      </span>
                    </div>
                    <div className="text-[10px] font-mono mt-1 text-slate-500">
                      Proj. Annual: <span className="font-bold text-slate-700">
                        ৳{(simulatedQuarters.reduce((sum, q) => sum + q.workforceCost, 0)).toFixed(1)}M BDT
                      </span>
                    </div>
                  </div>

                  {/* Revenue Per Employee */}
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Q4 Revenue / FTE</span>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-[10px] font-bold text-slate-400">BDT</span>
                      <span className="text-2xl font-black font-sans text-slate-800 tracking-tight">
                        ৳{simulatedQuarters[3]?.revenuePerEmployee}K
                      </span>
                    </div>
                    <div className="text-[10px] font-mono mt-1 text-slate-500">
                      Efficiency: <span className={`font-bold ${
                        (simulatedQuarters[3]?.revenuePerEmployee - 750) >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {(simulatedQuarters[3]?.revenuePerEmployee - 750) >= 0 ? "↑ " : "↓ "}
                        {Math.round(((simulatedQuarters[3]?.revenuePerEmployee - 750) / 750) * 100)}% vs Base
                      </span>
                    </div>
                  </div>
                </div>

                {/* Projections Area / Line Chart */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/20">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">Quarterly Trend Projections</span>
                    <div className="flex gap-4 text-[10px] font-mono font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
                        <span className="text-emerald-700">Quarterly Cost (M BDT)</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block"></span>
                        <span className="text-indigo-700">Revenue/Employee (K BDT)</span>
                      </span>
                    </div>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={simulatedQuarters} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="simCostGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="simRevGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis yAxisId="left" stroke="#10b981" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#6366f1" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1.5px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                          labelStyle={{ fontWeight: 'bold', color: '#1e293b', fontSize: '11px' }}
                          itemStyle={{ fontSize: '11px', padding: '1px 0' }}
                        />
                        <Area yAxisId="left" type="monotone" dataKey="workforceCost" name="Workforce Cost (M BDT)" stroke="#10b981" fillOpacity={1} fill="url(#simCostGrad)" strokeWidth={2} />
                        <Area yAxisId="right" type="monotone" dataKey="revenuePerEmployee" name="Rev Per FTE (K BDT)" stroke="#6366f1" fillOpacity={1} fill="url(#simRevGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tabular Output */}
                <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white">
                  <table className="w-full text-left border-collapse text-[11px] font-sans">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-500 uppercase font-bold">
                        <th className="py-2.5 px-4">Quarter</th>
                        <th className="py-2.5 px-4 text-center">Simulated FTEs</th>
                        <th className="py-2.5 px-4 text-right">Workforce Cost</th>
                        <th className="py-2.5 px-4 text-right">Total Revenue</th>
                        <th className="py-2.5 px-4 text-right">Revenue / FTE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {simulatedQuarters.map((row, index) => {
                        return (
                          <tr key={row.name} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2.5 px-4 font-bold text-slate-700">{row.name}</td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold">
                                {row.headcount}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">৳{row.workforceCost}M</td>
                            <td className="py-2.5 px-4 text-right font-mono text-slate-600">৳{row.totalRevenue}M</td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-600">৳{row.revenuePerEmployee}K</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Row 5: Department Headcount Distribution Donut Chart (6-columns) */}
        <div className="col-span-12 lg:col-span-6 bento-card p-6 flex flex-col justify-between bg-white">
          <div>
            <h3 className="text-base font-bold font-sans text-slate-800 tracking-tight flex items-center gap-1.5">
              <Info className="w-4.5 h-4.5 text-emerald-600" />
              Workforce Allocation
            </h3>
            <p className="text-xs text-slate-400">Active headcounts distributed by business department.</p>
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
            <div className="absolute flex flex-col items-center select-none">
              <span className="text-2xl font-black text-slate-800 leading-none">{totalCount}</span>
              <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase mt-1">FTE Headcount</span>
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

        {/* Row 5: AI-Driven Compliance Matrix (6-columns - BRAND NEW BENTO CARD) */}
        <div className="col-span-12 lg:col-span-6 bento-card p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Scale className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold font-sans text-slate-800 tracking-tight flex items-center gap-1.5">
                    AI-driven Compliance Matrix
                  </h3>
                  <p className="text-xs text-slate-400">Statutory BLA 2006 audits scanned in real-time.</p>
                </div>
              </div>

              {/* Active Violation Count Badges */}
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 border border-rose-100 text-[10px] font-mono font-black text-rose-700">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  {complianceAlerts.filter(a => a.status !== "Resolved").length} ACTIVE BREACHES
                </span>
              </div>
            </div>

            {/* Matrix / List of Real-time violations */}
            <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
              {complianceAlerts.map((alert) => {
                const isResolved = alert.status === "Resolved";
                const isResolving = alert.status === "Resolving";

                // Determine risk-level classes
                let riskClass = "bg-rose-50 text-rose-700 border-rose-100";
                if (alert.riskLevel === "High") {
                  riskClass = "bg-amber-50 text-amber-700 border-amber-100";
                } else if (alert.riskLevel === "Medium") {
                  riskClass = "bg-sky-50 text-sky-700 border-sky-100";
                }

                return (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                      isResolved 
                        ? "bg-slate-50/50 border-slate-150 opacity-60" 
                        : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                          isResolved ? "bg-slate-100 text-slate-400 border-slate-250" : riskClass
                        }`}>
                          {alert.riskLevel} Risk
                        </span>
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          {alert.section}
                        </span>
                      </div>
                      <h4 className={`text-xs font-bold mt-1.5 ${isResolved ? "text-slate-400 line-through" : "text-slate-800"}`}>
                        {alert.title}
                      </h4>
                      <p className={`text-[11px] mt-0.5 leading-snug ${isResolved ? "text-slate-400" : "text-slate-500"}`}>
                        {alert.description}
                      </p>
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      {isResolved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-100 text-[10px] font-mono font-bold text-emerald-700">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          Remediated
                        </span>
                      ) : (
                        <button
                          disabled={isResolving}
                          onClick={() => handleResolveAlert(alert.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                            isResolving 
                              ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed" 
                              : "bg-slate-50 border border-slate-100 text-slate-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-600 cursor-pointer"
                          }`}
                        >
                          {isResolving ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                              Fixing...
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5" />
                              {alert.quickFixText}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>Scan Frequency: 30s auto-refresh</span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              All Engines Nominal
            </span>
          </div>
        </div>

        {/* Row 6: Corporate Quick Access & Compliance Directory (12-columns) */}
        <div className="col-span-12 bento-card p-6 flex flex-col justify-between bg-white">
          <div>
            <h3 className="text-base font-bold font-sans text-slate-800 tracking-tight flex items-center gap-1.5">
              <FileCheck className="w-4.5 h-4.5 text-emerald-600" />
              Corporate Compliance Registry & Quick Actions
            </h3>
            <p className="text-xs text-slate-400">Standard references under Chapter IX of the Bangladesh Labour Act matching our Q3 operational structure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between hover:border-emerald-500/10 transition-colors">
              <div>
                <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">Labour Standard IX</span>
                <h4 className="text-xs font-bold text-slate-800 mt-2">Maximum Weekly Working Limits</h4>
                <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">Section 108 regulates overtime calculations. Workforce average currently stays 14% below maximum threshold.</p>
              </div>
              <div className="mt-3 flex justify-between items-center text-[10px] font-mono font-bold text-emerald-600">
                <span>Compliance Level: 100%</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between hover:border-emerald-500/10 transition-colors">
              <div>
                <span className="text-[9px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase">Welfare & Safety</span>
                <h4 className="text-xs font-bold text-slate-800 mt-2">Maternity & Medical Benefit Registry</h4>
                <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">Automated calculations for leave ledger assignments based on verified medical certification submissions.</p>
              </div>
              <div className="mt-3 flex justify-between items-center text-[10px] font-mono font-bold text-teal-600">
                <span>Active Ledger Coverage: 100%</span>
                <CheckCircle className="w-4 h-4 text-teal-500" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between hover:border-emerald-500/10 transition-colors">
              <div>
                <span className="text-[9px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">Benefits & Bonuses</span>
                <h4 className="text-xs font-bold text-slate-800 mt-2">Festival Bonus Regulations</h4>
                <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">Section 111 / Rules enforce twice-yearly festival bonus distribution for contractual and permanent staff.</p>
              </div>
              <div className="mt-3 flex justify-between items-center text-[10px] font-mono font-bold text-indigo-600">
                <span>Distribution Status: Active</span>
                <CheckCircle className="w-4 h-4 text-indigo-500" />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
            <span className="text-slate-400 font-medium">Quick Workspace Navigation:</span>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => {
                  const leaveBtn = document.getElementById("btn-tab-attendance");
                  if (leaveBtn) leaveBtn.click();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-slate-900 text-slate-600 font-bold text-[10px] font-mono uppercase tracking-wider transition-all"
              >
                Track Attendance
              </button>
              <button 
                onClick={() => {
                  const payrollBtn = document.getElementById("btn-tab-payroll");
                  if (payrollBtn) payrollBtn.click();
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] font-mono uppercase tracking-wider transition-all"
              >
                Process Payroll
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

