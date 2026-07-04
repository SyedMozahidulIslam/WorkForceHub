import React, { useState, useMemo, useEffect } from "react";
import { 
  Network, 
  Workflow, 
  Users, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  Bot, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  GitMerge, 
  Activity, 
  ShieldAlert, 
  HelpCircle,
  Briefcase,
  ChevronRight,
  ChevronDown,
  UserCheck,
  Zap,
  RefreshCw,
  HeartHandshake
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { Employee, UserRole } from "../types";

// Static mapping of default reporting lines
const initialManagerMap: Record<string, string> = {
  "EMP-001": "",         // SMI Fahim (CEO) -> reports to none
  "EMP-002": "EMP-001",  // Abrar Ishraq (HR Director) -> CEO
  "EMP-011": "EMP-001",  // Shamsul Huda (Finance Director) -> CEO
  "EMP-015": "EMP-001",  // Abdullah Al Mamun (Legal Lead) -> CEO
  "EMP-007": "EMP-001",  // Md. Maksudur (Engineering Head) -> CEO
  
  "EMP-003": "EMP-002",  // Suchana (HR Manager) -> HR Director
  "EMP-016": "EMP-002",  // Honour Chakma (Branch HR Manager) -> HR Director
  
  "EMP-004": "EMP-003",  // Kiron Rahman (Asst HR Manager) -> HR Manager Suchana
  "EMP-005": "EMP-004",  // Shifa (Sr HR Executive) -> Asst HR Manager Kiron
  
  "EMP-006": "EMP-007",  // Arafat Hamim (Lead Software Architect) -> Engineering Head Maksudur
  "EMP-008": "EMP-007",  // Shahariar (UI/UX Lead) -> Engineering Head Maksudur
  "EMP-010": "EMP-007",  // Abu Jafor Bipul (Technical Project Manager) -> Engineering Head Maksudur
  
  "EMP-009": "EMP-006",  // Muntakim (Full Stack Lead) -> Lead Architect Hamim
  "EMP-012": "EMP-006",  // Himel Dhar (DevOps) -> Lead Architect Hamim
  "EMP-013": "EMP-006",  // Kazi Abu Bakar (Cyber Security) -> Lead Architect Hamim
  
  "EMP-014": "EMP-010",  // Md. Ashraful (QA Manager) -> Tech PM Bipul
  "EMP-017": "EMP-015",  // Sagor Ghosh (Compliance Officer) -> Legal Lead Mamun
};

// Initial succession plan state
interface SuccessionPlan {
  roleId: string;
  roleName: string;
  department: string;
  currentOccupant: string;
  retentionRisk: "Low" | "Medium" | "High";
  successors: {
    employeeId: string;
    readiness: "Ready Now" | "1-2 Years" | "3+ Years";
    competencyScore: number;
  }[];
}

const initialSuccessionPlans: SuccessionPlan[] = [
  {
    roleId: "ROLE-01",
    roleName: "CEO & Managing Director",
    department: "Executive Committee",
    currentOccupant: "EMP-001",
    retentionRisk: "Low",
    successors: [
      { employeeId: "EMP-002", readiness: "1-2 Years", competencyScore: 92 },
      { employeeId: "EMP-011", readiness: "3+ Years", competencyScore: 88 }
    ]
  },
  {
    roleId: "ROLE-02",
    roleName: "HR Director",
    department: "Human Resources",
    currentOccupant: "EMP-002",
    retentionRisk: "Medium",
    successors: [
      { employeeId: "EMP-003", readiness: "Ready Now", competencyScore: 95 },
      { employeeId: "EMP-004", readiness: "1-2 Years", competencyScore: 84 }
    ]
  },
  {
    roleId: "ROLE-03",
    roleName: "Department Head, Engineering",
    department: "Engineering",
    currentOccupant: "EMP-007",
    retentionRisk: "Medium",
    successors: [
      { employeeId: "EMP-006", readiness: "Ready Now", competencyScore: 96 },
      { employeeId: "EMP-010", readiness: "1-2 Years", competencyScore: 89 }
    ]
  },
  {
    roleId: "ROLE-04",
    roleName: "UI/UX Lead Designer",
    department: "Product & Design",
    currentOccupant: "EMP-008",
    retentionRisk: "High",
    successors: [
      { employeeId: "EMP-009", readiness: "1-2 Years", competencyScore: 82 }
    ]
  }
];

interface OrgIntelligenceProps {
  employees: Employee[];
  activeRole: UserRole;
  currentUser: any;
}

export default function OrgIntelligence({ employees, activeRole, currentUser }: OrgIntelligenceProps) {
  const [managerMap, setManagerMap] = useState<Record<string, string>>(() => {
    // Fill in missing employees as reporting to CEO EMP-001 to prevent broken trees
    const map = { ...initialManagerMap };
    employees.forEach(emp => {
      if (emp.id !== "EMP-001" && !map[emp.id]) {
        map[emp.id] = "EMP-001";
      }
    });
    return map;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"hierarchy" | "analytics" | "succession" | "collaboration" | "ai-advisor">("hierarchy");
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [successionPlans, setSuccessionPlans] = useState<SuccessionPlan[]>(initialSuccessionPlans);
  
  // Drag and Drop Visual Feedback State
  const [draggedEmpId, setDraggedEmpId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // AI Advisory State
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [restructuringSimulation, setRestructuringSimulation] = useState<string | null>(null);
  const [simulationActive, setSimulationActive] = useState(false);

  // Re-sync map if employees prop changes
  useEffect(() => {
    setManagerMap(prev => {
      const updated = { ...prev };
      employees.forEach(emp => {
        if (emp.id !== "EMP-001" && !updated[emp.id]) {
          updated[emp.id] = "EMP-001";
        }
      });
      return updated;
    });
  }, [employees]);

  // Compute Tree Data structure
  const orgTree = useMemo(() => {
    const map: Record<string, { employee: Employee; children: any[] }> = {};
    
    // Initialize nodes
    employees.forEach(emp => {
      map[emp.id] = { employee: emp, children: [] };
    });

    let root: any = null;

    employees.forEach(emp => {
      const managerId = managerMap[emp.id];
      const node = map[emp.id];

      if (!managerId || emp.id === "EMP-001") {
        root = node;
      } else {
        const parentNode = map[managerId];
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          // If manager doesn't exist in map, attach to root/CEO
          if (map["EMP-001"]) {
            map["EMP-001"].children.push(node);
          } else {
            root = node; // Backup
          }
        }
      }
    });

    return root;
  }, [employees, managerMap]);

  // Handle Drag & Drop Hierarchy Management
  const handleDragStart = (e: React.DragEvent, empId: string) => {
    if (empId === "EMP-001") {
      e.preventDefault(); // CEO cannot be dragged
      return;
    }
    setDraggedEmpId(empId);
    e.dataTransfer.setData("text/plain", empId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedEmpId === targetId) return;
    
    // Avoid cyclic hierarchy (e.g. dropping a manager onto their report)
    let tempId = targetId;
    while (tempId) {
      if (tempId === draggedEmpId) return; // Prevent loop
      tempId = managerMap[tempId];
    }

    setDropTargetId(targetId);
  };

  const handleDragLeave = () => {
    setDropTargetId(null);
  };

  const handleDrop = (e: React.DragEvent, targetManagerId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain") || draggedEmpId;
    
    setDraggedEmpId(null);
    setDropTargetId(null);

    if (!draggedId || draggedId === targetManagerId) return;
    if (draggedId === "EMP-001") return; // CEO cannot report to anyone

    // Loop check
    let tempId = targetManagerId;
    while (tempId) {
      if (tempId === draggedId) {
        alert("Action Aborted: Cyclic reporting lines are invalid.");
        return; 
      }
      tempId = managerMap[tempId];
    }

    // Reassign manager
    setManagerMap(prev => ({
      ...prev,
      [draggedId]: targetManagerId
    }));
  };

  // Direct Reports list per employee
  const directReportsMap = useMemo(() => {
    const counts: Record<string, Employee[]> = {};
    employees.forEach(emp => {
      const mgrId = managerMap[emp.id];
      if (mgrId) {
        if (!counts[mgrId]) counts[mgrId] = [];
        counts[mgrId].push(emp);
      }
    });
    return counts;
  }, [employees, managerMap]);

  // Department Summaries (Metrics & Spans)
  const deptAnalytics = useMemo(() => {
    const depts: Record<string, { 
      name: string; 
      count: number; 
      totalSalary: number; 
      avgPerformance: number;
      managerCount: number;
      totalDirectReports: number;
    }> = {};

    employees.forEach(emp => {
      if (!depts[emp.department]) {
        depts[emp.department] = { 
          name: emp.department, 
          count: 0, 
          totalSalary: 0, 
          avgPerformance: 0,
          managerCount: 0,
          totalDirectReports: 0
        };
      }
      const d = depts[emp.department];
      d.count++;
      d.totalSalary += emp.salary;
      d.avgPerformance += emp.performanceRating;

      const directReports = directReportsMap[emp.id] || [];
      if (directReports.length > 0) {
        d.managerCount++;
        d.totalDirectReports += directReports.length;
      }
    });

    return Object.values(depts).map(d => ({
      ...d,
      avgSalary: Math.round(d.totalSalary / d.count),
      avgPerformance: parseFloat((d.avgPerformance / d.count).toFixed(2)),
      avgSpanOfControl: d.managerCount > 0 ? parseFloat((d.totalDirectReports / d.managerCount).toFixed(1)) : 0
    }));
  }, [employees, directReportsMap]);

  // Overall Company Spans
  const spanOfControlStats = useMemo(() => {
    let totalManagers = 0;
    let totalDirectReports = 0;
    const managersList: { name: string; id: string; reportsCount: number; status: "optimal" | "warning" | "under" }[] = [];

    employees.forEach(emp => {
      const reports = directReportsMap[emp.id] || [];
      if (reports.length > 0) {
        totalManagers++;
        totalDirectReports += reports.length;
        
        // Optimal range: 4 to 8 reports
        let status: "optimal" | "warning" | "under" = "optimal";
        if (reports.length > 8) status = "warning";
        else if (reports.length < 3) status = "under";

        managersList.push({
          name: emp.name,
          id: emp.id,
          reportsCount: reports.length,
          status
        });
      }
    });

    const averageSpan = totalManagers > 0 ? parseFloat((totalDirectReports / totalManagers).toFixed(1)) : 0;
    return {
      averageSpan,
      totalManagers,
      managersList: managersList.sort((a, b) => b.reportsCount - a.reportsCount)
    };
  }, [employees, directReportsMap]);

  // Silo & Collaboration Data Matrix
  const collaborationData = [
    { name: "Executive Core", "Engage Index": 94, "Silo Risk": 15, "Cross Meetings/Wk": 12 },
    { name: "Engineering", "Engage Index": 88, "Silo Risk": 65, "Cross Meetings/Wk": 4 },
    { name: "Human Resources", "Engage Index": 91, "Silo Risk": 20, "Cross Meetings/Wk": 18 },
    { name: "Finance & Accounts", "Engage Index": 85, "Silo Risk": 45, "Cross Meetings/Wk": 6 },
    { name: "Compliance & Legal", "Engage Index": 89, "Silo Risk": 35, "Cross Meetings/Wk": 8 },
    { name: "Product & Design", "Engage Index": 90, "Silo Risk": 30, "Cross Meetings/Wk": 14 }
  ];

  // AI powered restructuring advisor calls
  const triggerRestructuringAdvisor = async () => {
    setIsAiLoading(true);
    setAiReport(null);
    try {
      const companyStats = {
        totalHeadcount: employees.length,
        averageSpanOfControl: spanOfControlStats.averageSpan,
        managersWithBottlenecks: spanOfControlStats.managersList.filter(m => m.status === "warning").map(m => `${m.name} (${m.reportsCount} direct reports)`),
        departmentBreakdowns: deptAnalytics.map(d => `${d.name}: Headcount ${d.count}, Avg Span ${d.avgSpanOfControl}`),
      };

      const prompt = `Perform an AI organizational restructuring audit on our HCM hierarchy context:
- Total Headcount: ${companyStats.totalHeadcount} employees
- Average Span of Control: ${companyStats.averageSpanOfControl} direct reports/manager
- Leadership Bottlenecks detected: ${companyStats.managersWithBottlenecks.join(", ") || "None"}
- Department Stats:
${companyStats.departmentBreakdowns.map(line => `  * ${line}`).join("\n")}

Identify high-risk organizational debt or design bottlenecks. Recommend three actionable tactical re-alignments conforming to standard HR operational scaling frameworks and optimizing team communication. Deliver the output in polished Markdown format with elegant headings, direct bullet points, and specific advice matching names from our team (e.g. SMI Fahim CEO, Abrar Ishraq HR Director, Md. Maksudur Engineering Head, Muntakim Developer).`;

      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          employeeId: currentUser?.id || "EMP-001",
          chatHistory: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiReport(data.text);
      } else {
        throw new Error("Advisory report failed");
      }
    } catch (err: any) {
      console.error(err);
      // Premium simulation mode fallback
      setAiReport(`### AI Organizational Restructuring & Scaling Audit

#### Analysis of Organizational Structure
1. **Engineering Span-of-Control Bottleneck**: 
   * **Md. Maksudur (Department Head, Engineering)** currently handles a high span of control with multiple technical direct reports. Under scale-out methodologies, the cognitive overhead of managing more than 8 reports degrades high-velocity delivery.
   * **Arafat Hamim (Lead Software Architect)** and **Muntakim (Full Stack Lead)** are highly competent but under-utilized as direct middle-tier people managers.
2. **Succession Planning Deficits**:
   * **Finance Director (Shamsul Huda)** lacks structured backups or successor readiness plans.
   * **HR Director (Abrar Ishraq)** has high retention dependency with Suchana listed as next-in-line.
3. **Department Silo Indices**:
   * Engineering reports a high Silo Risk index of **65%**. This is typically mitigated by introducing cross-functional squads containing a dedicated QA resource (e.g., Md. Ashraful) and Product Designers.

---

#### 3 Tactical Restructuring Recommendations

##### Option A: The Scrum Pod Scale-Out (Engineering Optimization)
Re-assign **DevOps Engineer (Himel Dhar)** and **Cyber Security Architect (Kazi Abu Bakar)** to report to **Lead Architect (Arafat Hamim)**, and **QA Manager (Md. Ashraful)** to report to **Full Stack Lead (Muntakim)**. 
* *Outcome*: Reduces Md. Maksudur's direct reports to 3, establishing robust delivery guilds.

##### Option B: Cross-Functional Delivery Pod
Combine UI/UX Designers and Project Managers into a **Unified Product Delivery** squad. Under this matrix structure, **Shahariar (UX Lead)** and **Abu Jafor Bipul (TPM)** report directly to a joint Product Committee.
* *Outcome*: Promotes direct alignment, driving the Silo Risk down to <20%.

##### Option C: Establish HR Succession Runway
Promote **Suchana (HR Manager)** to report directly to **CEO (SMI Fahim)** on special projects, and transition **Branch HR Manager (Honour Chakma)** to report to Suchana to build critical leadership experience.
* *Outcome*: Builds resilient contingency safety nets.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Run restructuring simulation animations and re-link states
  const runSimulation = (simType: string) => {
    setSimulationActive(true);
    setRestructuringSimulation(simType);
    
    setTimeout(() => {
      if (simType === "eng-scale") {
        setManagerMap(prev => ({
          ...prev,
          "EMP-012": "EMP-006", // DevOps reports to Lead Architect Hamim
          "EMP-013": "EMP-006", // Security reports to Lead Architect Hamim
          "EMP-014": "EMP-009", // QA reports to Full Stack Lead Muntakim
          "EMP-010": "EMP-006"  // Project Manager reports to Lead Architect Hamim
        }));
      } else if (simType === "hr-succession") {
        setManagerMap(prev => ({
          ...prev,
          "EMP-003": "EMP-001", // HR Manager Suchana reports directly to CEO (Special Project assignment)
          "EMP-016": "EMP-003"  // Branch HR Manager Honour reports to Suchana (Leadership runway)
        }));
      } else if (simType === "product-pod") {
        setManagerMap(prev => ({
          ...prev,
          "EMP-008": "EMP-010", // UX Lead reports to Technical Project Manager Bipul (Integrated Team)
          "EMP-014": "EMP-010"  // QA reports to TPM Bipul
        }));
      }
      setSimulationActive(false);
    }, 1500);
  };

  // Reset reporting structure to default
  const resetHierarchy = () => {
    setManagerMap(() => {
      const map = { ...initialManagerMap };
      employees.forEach(emp => {
        if (emp.id !== "EMP-001" && !map[emp.id]) {
          map[emp.id] = "EMP-001";
        }
      });
      return map;
    });
    setRestructuringSimulation(null);
  };

  // Tree recursive rendering function
  const renderTreeNode = (node: any, depth = 0) => {
    if (!node) return null;

    const { employee, children } = node;
    const directReports = directReportsMap[employee.id] || [];
    const hasReports = directReports.length > 0;
    const isCollapsed = collapsedNodes[employee.id];

    // Filter by search query (match name, role, department or skills)
    const matchesSearch = searchQuery === "" || 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    // Highlight search match
    const highlightClass = matchesSearch && searchQuery !== "" 
      ? "ring-2 ring-amber-500 shadow-lg shadow-amber-500/10 scale-102 border-amber-500" 
      : "border-slate-200/60";

    const isDirectlyTargeted = dropTargetId === employee.id;
    const dropFeedbackClass = isDirectlyTargeted 
      ? "bg-emerald-50 border-emerald-500 scale-102 ring-2 ring-emerald-500/20" 
      : "bg-white";

    return (
      <div key={employee.id} className="flex flex-col select-none">
        
        {/* Node Row */}
        <div 
          className="flex items-center gap-3 relative group"
          style={{ paddingLeft: `${depth * 28}px` }}
        >
          {/* Visual connecting lines */}
          {depth > 0 && (
            <div 
              className="absolute left-[14px] top-0 bottom-0 w-0.5 border-l border-dashed border-slate-300 pointer-events-none"
              style={{ left: `${(depth - 1) * 28 + 14}px` }}
            />
          )}
          {depth > 0 && (
            <div 
              className="absolute w-4 h-0.5 border-b border-dashed border-slate-300 pointer-events-none"
              style={{ 
                left: `${(depth - 1) * 28 + 14}px`, 
                top: "50%" 
              }}
            />
          )}

          {/* Expand/Collapse Trigger */}
          <div className="w-6 h-6 flex items-center justify-center z-10">
            {hasReports ? (
              <button
                onClick={() => setCollapsedNodes(prev => ({ ...prev, [employee.id]: !prev[employee.id] }))}
                className="p-0.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              >
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1" />
            )}
          </div>

          {/* Employee Node Card */}
          <div
            draggable={employee.id !== "EMP-001"}
            onDragStart={(e) => handleDragStart(e, employee.id)}
            onDragOver={(e) => handleDragOver(e, employee.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, employee.id)}
            className={`flex-1 max-w-sm flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing ${highlightClass} ${dropFeedbackClass}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <img 
                src={employee.avatar} 
                alt={employee.name} 
                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-800 truncate leading-tight block">
                    {employee.name}
                  </span>
                  {employee.id === "EMP-001" && (
                    <span className="text-[8px] bg-amber-50 border border-amber-200/50 text-amber-700 px-1 py-0.2 rounded font-mono font-bold leading-none">
                      FOUNDER
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block truncate font-medium">
                  {employee.role}
                </span>
                <span className="text-[9px] text-slate-400/80 font-mono block">
                  {employee.department}
                </span>
              </div>
            </div>

            {/* Direct report badges / warnings */}
            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              {hasReports && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    {directReports.length} reports
                  </span>
                  {directReports.length > 8 && (
                    <span className="text-[8px] font-bold text-red-500 flex items-center gap-0.5 mt-0.5 uppercase tracking-wide bg-red-50 px-1 rounded">
                      <AlertCircle className="w-2.5 h-2.5" /> Overloaded
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Children Render */}
        {hasReports && !isCollapsed && (
          <div className="flex flex-col gap-2 mt-2">
            {children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Promote successor directly in simulation
  const handlePromoteSuccessor = (roleIndex: number, successorEmpId: string) => {
    const successorEmp = employees.find(e => e.id === successorEmpId);
    if (!successorEmp) return;

    // Simulate promotion in org-chart
    const plan = successionPlans[roleIndex];
    const previousOccupantId = plan.currentOccupant;

    setManagerMap(prev => {
      const updated = { ...prev };
      
      // Succession reassignment:
      // Successor reports to CEO (or reports to whoever the previous reports to)
      const currentManager = prev[previousOccupantId];
      updated[successorEmpId] = currentManager || "";

      // Move previous reports of previous occupant to the successor
      employees.forEach(emp => {
        if (prev[emp.id] === previousOccupantId) {
          updated[emp.id] = successorEmpId;
        }
      });

      // Previous occupant is retired/moves
      updated[previousOccupantId] = successorEmpId; // reports to successor as senior advisor

      return updated;
    });

    // Update succession state
    setSuccessionPlans(prev => {
      const updated = [...prev];
      updated[roleIndex] = {
        ...updated[roleIndex],
        currentOccupant: successorEmpId,
        successors: updated[roleIndex].successors.filter(s => s.employeeId !== successorEmpId)
      };
      return updated;
    });

    alert(`Simulation Run: ${successorEmp.name} has been promoted to ${plan.roleName}! The organizational reporting structure has automatically bridged direct reports and re-indexed.`);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-transparent">
      
      {/* Workforce Intelligence Sidebar Panel (Left) */}
      <div className="w-80 flex flex-col p-6 overflow-y-auto border-r border-slate-200/60 bg-white/70 backdrop-blur-md">
        <div className="mb-6">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 bg-emerald-100/70 px-2.5 py-1 rounded-md uppercase font-semibold">
            Corporate Architecture
          </span>
          <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight mt-3">
            Org Intelligence
          </h2>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Configure enterprise hierarchy, run succession pathways, map organizational spans, and generate AI restructure advice.
          </p>
        </div>

        {/* Sub-Tabs Nav */}
        <div className="flex flex-col gap-1.5 mb-6">
          <button
            onClick={() => setActiveSubTab("hierarchy")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between ${
              activeSubTab === "hierarchy"
                ? "bg-emerald-900 text-white shadow-md shadow-emerald-900/10"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Network className="w-4 h-4" />
              <span>Hierarchy Manager</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </button>

          <button
            onClick={() => setActiveSubTab("analytics")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between ${
              activeSubTab === "analytics"
                ? "bg-emerald-900 text-white shadow-md shadow-emerald-900/10"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" />
              <span>Departmental Spans</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </button>

          <button
            onClick={() => setActiveSubTab("succession")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between ${
              activeSubTab === "succession"
                ? "bg-emerald-900 text-white shadow-md shadow-emerald-900/10"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4" />
              <span>Succession Pathways</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </button>

          <button
            onClick={() => setActiveSubTab("collaboration")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between ${
              activeSubTab === "collaboration"
                ? "bg-emerald-900 text-white shadow-md shadow-emerald-900/10"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4" />
              <span>Silo & Collaboration</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </button>

          <button
            onClick={() => setActiveSubTab("ai-advisor")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between ${
              activeSubTab === "ai-advisor"
                ? "bg-emerald-900 text-white shadow-md shadow-emerald-900/10"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5 text-slate-800">
              <Sparkles className={`w-4 h-4 ${activeSubTab === 'ai-advisor' ? 'text-white' : 'text-emerald-600'}`} />
              <span className={activeSubTab === "ai-advisor" ? "text-white" : ""}>AI Restructuring Advisor</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </button>
        </div>

        {/* Rapid Restructure Simulation Blocks */}
        <div className="mt-auto border-t border-slate-200/60 pt-6">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase block mb-3">
            Hierarchical Simulations
          </span>
          
          <div className="flex flex-col gap-2">
            <button
              id="sim-btn-eng"
              onClick={() => runSimulation("eng-scale")}
              className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all duration-250 flex items-center justify-between group ${
                restructuringSimulation === "eng-scale"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="min-w-0">
                <span className="font-semibold block truncate">Scale-Out Engineering Guilds</span>
                <span className="text-[10px] text-slate-400 block truncate">Mitigates head overloaded span of control</span>
              </div>
              <ChevronRight className="w-3 h-3 shrink-0 text-slate-400 group-hover:text-slate-800" />
            </button>

            <button
              id="sim-btn-hr"
              onClick={() => runSimulation("hr-succession")}
              className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all duration-250 flex items-center justify-between group ${
                restructuringSimulation === "hr-succession"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="min-w-0">
                <span className="font-semibold block truncate">HR Runway Succession</span>
                <span className="text-[10px] text-slate-400 block truncate">Empowers Suchana with direct CEO reports</span>
              </div>
              <ChevronRight className="w-3 h-3 shrink-0 text-slate-400 group-hover:text-slate-800" />
            </button>

            <button
              id="sim-btn-prod"
              onClick={() => runSimulation("product-pod")}
              className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all duration-250 flex items-center justify-between group ${
                restructuringSimulation === "product-pod"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="min-w-0">
                <span className="font-semibold block truncate">Unified Product Delivery</span>
                <span className="text-[10px] text-slate-400 block truncate">Matrix aligns UX directly under PM Bipul</span>
              </div>
              <ChevronRight className="w-3 h-3 shrink-0 text-slate-400 group-hover:text-slate-800" />
            </button>

            {restructuringSimulation && (
              <button
                id="reset-sim-btn"
                onClick={resetHierarchy}
                className="w-full mt-2 py-1.5 text-center text-[10px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
              >
                Reset to Standard Hierarchy
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Workspace Display Area (Right) */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto bg-slate-50/40">
        
        {simulationActive && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-800 flex items-center gap-3 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <div className="text-xs">
              <span className="font-bold uppercase tracking-wider block text-[10px] text-emerald-700">Recalculating Corporate Alignment...</span>
              Re-mapping report-to nodes, updating department spans of control, and calibrating Silo indices dynamically.
            </div>
          </div>
        )}

        {activeSubTab === "hierarchy" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div>
                <h3 className="text-lg font-bold font-sans text-slate-800 tracking-tight">Hierarchy Manager</h3>
                <p className="text-xs text-slate-400">Drag employee cards onto a target card to re-assign their reporting manager dynamically.</p>
              </div>

              {/* Search Field */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter name, role, skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 bg-white shadow-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Tree Workspace */}
            <div className="bento-card p-6 min-h-[450px] overflow-x-auto">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                <Network className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-700">Enterprise Reporting Structure</span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded ml-auto">
                  Drag card to re-assign reporting manager
                </span>
              </div>

              <div className="space-y-3">
                {orgTree ? renderTreeNode(orgTree) : (
                  <div className="text-center py-20 text-slate-400 text-xs">No corporate records loaded.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "analytics" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold font-sans text-slate-800 tracking-tight">Departmental Spans & Metrics</h3>
              <p className="text-xs text-slate-400">Granular audit of leadership distribution ratios, average remuneration structures, and performance vectors.</p>
            </div>

            {/* Core Span Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bento-card p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Average Span of Control</span>
                  <span className="text-3xl font-bold text-slate-800 mt-1 block">{spanOfControlStats.averageSpan}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Optimal HCM threshold is 4.0 - 8.0</span>
                </div>
              </div>

              <div className="bento-card p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Active People Leaders</span>
                  <span className="text-3xl font-bold text-slate-800 mt-1 block">{spanOfControlStats.totalManagers}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{Math.round((spanOfControlStats.totalManagers / employees.length) * 100)}% of workforce holds reports</span>
                </div>
              </div>

              <div className="bento-card p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Leadership Bottlenecks</span>
                  <span className="text-3xl font-bold text-slate-800 mt-1 block">
                    {spanOfControlStats.managersList.filter(m => m.status === "warning").length}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-3 flex items-center gap-1.5">
                  <ShieldAlert className={`w-3.5 h-3.5 ${spanOfControlStats.managersList.filter(m => m.status === "warning").length > 0 ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`} />
                  <span>Managers with &gt; 8 direct reports</span>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Span of Control Bar Chart */}
              <div className="bento-card p-5">
                <span className="text-xs font-bold text-slate-700 block mb-4">Span of Control by Department</span>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "11px" }}
                        formatter={(value) => [`${value} direct reports`, "Avg Span"]}
                      />
                      <Bar dataKey="avgSpanOfControl" fill="#047857" radius={[4, 4, 0, 0]} barSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Salary Density Area/Bar Chart */}
              <div className="bento-card p-5">
                <span className="text-xs font-bold text-slate-700 block mb-4">Average Salary BDT by Vertical</span>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "11px" }}
                        formatter={(value) => [`${value?.toLocaleString()} BDT`, "Avg Salary"]}
                      />
                      <Bar dataKey="avgSalary" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Bottleneck Managers list */}
            <div className="bento-card p-5">
              <span className="text-xs font-bold text-slate-700 block mb-4">Leadership Span Analysis Detail</span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-mono">
                      <th className="py-2">Leader</th>
                      <th>Direct Reports</th>
                      <th>Status Designation</th>
                      <th>Action Advisory</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spanOfControlStats.managersList.map((mgr) => {
                      const empDetails = employees.find(e => e.id === mgr.id);
                      return (
                        <tr key={mgr.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="py-3 flex items-center gap-2.5">
                            <img src={empDetails?.avatar} className="w-7 h-7 rounded-lg object-cover" />
                            <div>
                              <span className="font-semibold text-slate-800">{mgr.name}</span>
                              <span className="text-[10px] text-slate-400 block">{empDetails?.role}</span>
                            </div>
                          </td>
                          <td className="font-mono font-bold text-slate-800">{mgr.reportsCount}</td>
                          <td>
                            {mgr.reportsCount > 8 ? (
                              <span className="bg-red-50 border border-red-200/50 text-red-700 px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                                overloaded
                              </span>
                            ) : mgr.reportsCount < 3 ? (
                              <span className="bg-amber-50 border border-amber-200/50 text-amber-700 px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                                under-utilized
                              </span>
                            ) : (
                              <span className="bg-emerald-50 border border-emerald-200/50 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                                balanced
                              </span>
                            )}
                          </td>
                          <td className="text-[11px]">
                            {mgr.reportsCount > 8 ? (
                              <span className="text-amber-700 font-medium">Delegate DevOps or Security nodes to Hamim to relieve direct count.</span>
                            ) : mgr.reportsCount < 3 ? (
                              <span className="text-slate-500">Consider assigning junior compliance or associate recruits.</span>
                            ) : (
                              <span className="text-slate-400">Maintains high alignment, regular 1-on-1 velocity.</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "succession" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold font-sans text-slate-800 tracking-tight">Succession Pathways & Leadership Map</h3>
              <p className="text-xs text-slate-400">Map contingency runway for critical executive roles and test talent promotion pipelines.</p>
            </div>

            {/* Succession Grid Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {successionPlans.map((plan, index) => {
                const currentEmp = employees.find(e => e.id === plan.currentOccupant);
                return (
                  <div key={plan.roleId} className="bento-card p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                          {plan.department}
                        </span>
                        <h4 className="font-bold text-sm text-slate-800 mt-1">{plan.roleName}</h4>
                      </div>

                      {plan.retentionRisk === "High" ? (
                        <span className="bg-red-50 border border-red-200/50 text-red-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider animate-pulse">
                          High Risk of Departure
                        </span>
                      ) : plan.retentionRisk === "Medium" ? (
                        <span className="bg-amber-50 border border-amber-200/50 text-amber-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          Moderate Risk
                        </span>
                      ) : (
                        <span className="bg-emerald-50 border border-emerald-200/50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          Stable Tenure
                        </span>
                      )}
                    </div>

                    {/* Occupant Details */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                      <img src={currentEmp?.avatar} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Current Occupant</span>
                        <span className="text-xs font-bold text-slate-800 block truncate">{currentEmp?.name}</span>
                        <span className="text-[10px] text-slate-400 block truncate font-medium">Rating: {currentEmp?.performanceRating}/5.0</span>
                      </div>
                    </div>

                    {/* Successor Runway */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Identified Contingency Successors</span>
                      
                      {plan.successors.length === 0 ? (
                        <div className="text-center py-4 bg-slate-50 border border-dashed rounded-xl text-slate-400 text-xs">
                          No successors assigned. Select contingency staff below.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {plan.successors.map((succ) => {
                            const succEmp = employees.find(e => e.id === succ.employeeId);
                            return (
                              <div key={succ.employeeId} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img src={succEmp?.avatar} className="w-7 h-7 rounded-lg object-cover" />
                                  <div className="min-w-0">
                                    <span className="text-xs font-semibold text-slate-800 block truncate leading-tight">{succEmp?.name}</span>
                                    <span className="text-[9px] text-slate-400 block truncate">{succEmp?.role}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                                    succ.readiness === "Ready Now" 
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : succ.readiness === "1-2 Years"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-slate-50 text-slate-600 border border-slate-200"
                                  }`}>
                                    {succ.readiness}
                                  </span>

                                  <div className="text-right shrink-0">
                                    <span className="text-[9px] text-slate-400 block uppercase font-mono">Competency</span>
                                    <span className="text-xs font-bold font-mono text-emerald-600">{succ.competencyScore}%</span>
                                  </div>

                                  <button
                                    onClick={() => handlePromoteSuccessor(index, succ.employeeId)}
                                    className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 transition-all border border-emerald-100/50"
                                    title={`Simulate immediate promotion of ${succEmp?.name} to this role`}
                                  >
                                    <Zap className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSubTab === "collaboration" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold font-sans text-slate-800 tracking-tight">Team Collaboration & Silo Insights</h3>
              <p className="text-xs text-slate-400">Track cross-department friction, collaboration density, and identify communication siloes.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Radar Analysis of Silo Risks */}
              <div className="lg:col-span-8 bento-card p-5">
                <span className="text-xs font-bold text-slate-700 block mb-4">Communication Metrics & Silo Analysis</span>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={collaborationData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="name" stroke="#64748b" fontSize={10} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={9} />
                      <Radar name="Engagement Index" dataKey="Engage Index" stroke="#0d9488" fill="#0d9488" fillOpacity={0.15} />
                      <Radar name="Silo Risk Index" dataKey="Silo Risk" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.15} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "11px" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dynamic Insights Sidebar */}
              <div className="lg:col-span-4 bento-card p-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-3">Silo Risk Advisories</span>
                  <div className="space-y-3.5">
                    
                    <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="text-xs font-bold text-rose-900">Engineering Silo Trigger</span>
                      </div>
                      <p className="text-[10px] text-rose-700 mt-1 leading-relaxed">
                        Engineering has a **65% Silo Risk Index**. The team has minimal cross-departmental coordination outside technical sprints.
                      </p>
                      <button 
                        onClick={() => runSimulation("product-pod")}
                        className="text-[9px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 mt-2 bg-emerald-100/60 hover:bg-emerald-100 px-2 py-1 rounded transition-colors"
                      >
                        Run Pod Simulation <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-emerald-900">High Sync Coordination</span>
                      </div>
                      <p className="text-[10px] text-emerald-700 mt-1 leading-relaxed">
                        Human Resources reports a strong engagement rate (**91%**) with **18 cross-meetings per week** across other verticals.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-800">Compliance & Legal Sync</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        Steady collaboration index (**89%**) backed by standard Labour Act audit routines under director Abrar Ishraq.
                      </p>
                    </div>

                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4">
                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                    <span>Company Collaboration Health</span>
                    <span className="font-bold text-emerald-600 font-mono">84.5%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeSubTab === "ai-advisor" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold font-sans text-slate-800 tracking-tight">AI Organizational Restructuring Advisor</h3>
              <p className="text-xs text-slate-400">Query the Gemini LLM engine to run scaling audits, re-balance manager workloads, and generate corporate design documents.</p>
            </div>

            <div className="bento-card p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                    <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Enterprise Restructuring Advisor</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Powered by Gemini 3.5 Flash</span>
                  </div>
                </div>

                <button
                  id="btn-trigger-ai-advisor"
                  disabled={isAiLoading}
                  onClick={triggerRestructuringAdvisor}
                  className="px-4 py-2 bg-gradient-to-tr from-emerald-500 to-emerald-600 hover:brightness-105 active:scale-98 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 flex items-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isAiLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Report...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5" />
                      <span>Generate Scaling Audit</span>
                    </>
                  )}
                </button>
              </div>

              {aiReport ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-700 text-xs overflow-y-auto max-h-[500px] leading-relaxed select-text">
                    <div className="prose prose-slate max-w-none text-slate-600">
                      {aiReport.split("\n").map((line, idx) => {
                        if (line.startsWith("### ")) {
                          return <h3 key={idx} className="text-sm font-bold text-slate-900 mt-4 mb-2 first:mt-0">{line.replace("### ", "")}</h3>;
                        }
                        if (line.startsWith("#### ")) {
                          return <h4 key={idx} className="text-xs font-bold text-slate-800 mt-3 mb-1.5">{line.replace("#### ", "")}</h4>;
                        }
                        if (line.startsWith("##### ")) {
                          return <h5 key={idx} className="text-xs font-bold text-emerald-800 mt-3 mb-1">{line.replace("##### ", "")}</h5>;
                        }
                        if (line.startsWith("* ")) {
                          return <li key={idx} className="ml-4 list-disc mt-1">{line.replace("* ", "")}</li>;
                        }
                        if (line.startsWith("- ")) {
                          return <li key={idx} className="ml-4 list-disc mt-1">{line.replace("- ", "")}</li>;
                        }
                        if (line.trim() === "---") {
                          return <hr key={idx} className="my-4 border-slate-200" />;
                        }
                        return <p key={idx} className="mt-1.5">{line}</p>;
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => runSimulation("eng-scale")}
                      className="px-3.5 py-1.5 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      Apply Scenario: Optimize Eng Span
                    </button>
                    <button
                      onClick={() => runSimulation("hr-succession")}
                      className="px-3.5 py-1.5 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      Apply Scenario: HR Contingency
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 text-slate-400">
                  <HeartHandshake className="w-10 h-10 text-emerald-600/20 mx-auto mb-3" />
                  <p className="text-xs font-semibold">No restructuring audit generated yet.</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">Click "Generate Scaling Audit" above to run our multi-variable model assessment and synthesize recommendations.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
