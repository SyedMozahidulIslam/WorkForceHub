import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Directory from "./components/Directory";
import Recruitment from "./components/Recruitment";
import Attendance from "./components/Attendance";
import Payroll from "./components/Payroll";
import Performance from "./components/Performance";
import Compliance from "./components/Compliance";
import Engagement from "./components/Engagement";
import Helpdesk from "./components/Helpdesk";
import CopilotSidebar from "./components/CopilotSidebar";
import OrgIntelligence from "./components/OrgIntelligence";
import Learning from "./components/Learning";

import { 
  Employee, 
  JobRequisition, 
  LeaveRequest, 
  AttendanceRecord, 
  PayrollRun, 
  Goal, 
  Ticket, 
  Announcement, 
  UserRole 
} from "./types";

// Fallback datasets directly imported from our local data model for instant, robust initialization
import { 
  initialEmployees, 
  initialRequisitions, 
  initialLeaveRequests, 
  initialAttendanceRecords, 
  initialPayrollRuns, 
  initialGoals, 
  initialTickets, 
  initialAnnouncements 
} from "./data";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.CEO);
  
  // Current user persona context
  const [currentUser, setCurrentUser] = useState({
    id: "EMP-001",
    name: "SMI Fahim",
    role: "CEO & MD",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150"
  });

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Core Corporate state stores
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [requisitions, setRequisitions] = useState<JobRequisition[]>(initialRequisitions);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendanceRecords);
  const [payroll, setPayroll] = useState<PayrollRun[]>(initialPayrollRuns);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

  const [isLoading, setIsLoading] = useState(false);

  // Synchronize state with backend API endpoints for real full-stack live connections
  useEffect(() => {
    async function fetchDatabase() {
      try {
        setIsLoading(true);
        
        const [
          empRes, 
          reqRes, 
          attRes, 
          payRes, 
          goalRes, 
          tktRes, 
          annRes
        ] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/recruitment/requisitions"),
          fetch("/api/attendance"),
          fetch("/api/payroll"),
          fetch("/api/goals"),
          fetch("/api/tickets"),
          fetch("/api/announcements")
        ]);

        if (empRes.ok) setEmployees(await empRes.json());
        if (reqRes.ok) setRequisitions(await reqRes.json());
        if (attRes.ok) setAttendance(await attRes.json());
        if (payRes.ok) setPayroll(await payRes.json());
        if (goalRes.ok) setGoals(await goalRes.json());
        if (tktRes.ok) setTickets(await tktRes.json());
        if (annRes.ok) setAnnouncements(await annRes.json());

      } catch (err) {
        console.warn("Backend API sync warning (using rich in-memory model instead):", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDatabase();
  }, []);

  // Update employee profile
  const handleUpdateEmployee = async (updatedEmp: Employee) => {
    setEmployees(employees.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    try {
      await fetch(`/api/employees/${updatedEmp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEmp)
      });
    } catch (e) {
      console.warn("Could not sync profile update with server", e);
    }
  };

  const refetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      if (res.ok) {
        setEmployees(await res.json());
      }
    } catch (e) {
      console.warn("Could not refetch employees from server", e);
    }
  };

  // Create Job Requisition
  const handleCreateRequisition = async (newReq: any) => {
    const id = `REQ-0${requisitions.length + 1}`;
    const reqItem: JobRequisition = {
      id,
      title: newReq.title,
      department: newReq.department,
      vacancies: newReq.vacancies,
      status: newReq.status,
      applicants: [],
      priority: newReq.priority,
      salaryRange: newReq.salaryRange,
      postedDate: new Date().toISOString().split('T')[0]
    };
    
    setRequisitions([reqItem, ...requisitions]);
    try {
      await fetch("/api/recruitment/requisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqItem)
      });
    } catch (e) {
      console.warn("Server Requisition post error", e);
    }
  };

  // Update candidate details / status
  const handleUpdateApplicant = async (reqId: string, candId: string, update: Partial<any>) => {
    setRequisitions(requisitions.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          applicants: req.applicants.map(c => c.id === candId ? { ...c, ...update } : c)
        };
      }
      return req;
    }));

    try {
      await fetch("/api/recruitment/applicant/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reqId, candId, update })
      });
    } catch (e) {
      console.warn("Candidate status update server warning", e);
    }
  };

  // Add new applicant parsed via CV
  const handleAddApplicant = async (reqId: string, cand: any) => {
    const req = requisitions.find(r => r.id === reqId);
    const newId = `CAND-0${(req?.applicants.length || 0) + 1}`;
    const fullCand = {
      id: newId,
      interviews: [],
      ...cand
    };

    setRequisitions(requisitions.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          applicants: [fullCand, ...r.applicants]
        };
      }
      return r;
    }));

    try {
      await fetch("/api/recruitment/applicant/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reqId, applicant: fullCand })
      });
    } catch (e) {
      console.warn("Candidate add server warning", e);
    }
  };

  // Clock In / Out
  const handleClockInOut = async (location: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const checkRecord = attendance.find(r => r.employeeId === currentUser.id && r.date === todayStr);

    if (checkRecord) {
      // Clocking out
      const checkoutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAttendance(attendance.map(r => 
        r.id === checkRecord.id ? { ...r, checkOut: checkoutTime } : r
      ));
      
      try {
        await fetch("/api/attendance/clock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            employeeId: currentUser.id, 
            clockType: "OUT", 
            location 
          })
        });
      } catch (e) {
        console.warn("Server Clockout warning", e);
      }
    } else {
      // Clocking in
      const checkinTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const currentHour = new Date().getHours();
      const currentMin = new Date().getMinutes();
      
      // Standard grace hour is 09:15 AM
      const isLate = currentHour > 9 || (currentHour === 9 && currentMin > 15);
      
      const newRec: AttendanceRecord = {
        id: `ATT-0${attendance.length + 1}`,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        department: currentUser.role,
        date: todayStr,
        checkIn: checkinTime,
        status: isLate ? "Late" : "Present",
        location,
        otHours: 0,
        lateReason: isLate ? "Traffic delays" : ""
      };

      setAttendance([newRec, ...attendance]);
      
      try {
        await fetch("/api/attendance/clock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            employeeId: currentUser.id, 
            clockType: "IN", 
            location 
          })
        });
      } catch (e) {
        console.warn("Server Clockin warning", e);
      }
    }
  };

  // Run Monthly Payroll
  const handleRunPayroll = async (month: string) => {
    // Generate simulated payslips for all active employees
    const payrollList: PayrollRun[] = employees.map((emp, idx) => {
      const basic = Math.round(emp.salary * 0.6);
      const allowance = Math.round(emp.salary * 0.4);
      const overtime = 0;
      
      // Standard Bangladesh tax slab estimation: 5% on monthly salary above 30k
      const tax = emp.salary > 30000 ? Math.round((emp.salary - 30000) * 0.05) : 0;
      const netPay = basic + allowance + overtime - tax;

      return {
        id: `PAY-0${idx + 1}-${month.replace(/\s+/g, '-').toUpperCase()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        month,
        basic,
        allowance,
        overtime,
        tax,
        netPay,
        status: "Paid"
      };
    });

    setPayroll([...payrollList, ...payroll]);
    
    try {
      await fetch("/api/payroll/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, runs: payrollList })
      });
    } catch (e) {
      console.warn("Payroll processing server warning", e);
    }
  };

  // Salary revision adjustment
  const handleUpdateSalary = async (empId: string, newSalary: number) => {
    setEmployees(employees.map(e => e.id === empId ? { ...e, salary: newSalary } : e));
    try {
      await fetch("/api/payroll/salary/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empId, salary: newSalary })
      });
    } catch (e) {
      console.warn("Salary update server error", e);
    }
  };

  // Add Strategic Goal / OKR
  const handleAddGoal = async (newGoal: any) => {
    const id = `GOL-0${goals.length + 1}`;
    const goalItem: Goal = {
      id,
      ...newGoal
    };
    setGoals([goalItem, ...goals]);
    try {
      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalItem)
      });
    } catch (e) {
      console.warn("Goals posting server warning", e);
    }
  };

  // Update Goal progress
  const handleUpdateGoalProgress = async (goalId: string, progress: number) => {
    setGoals(goals.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          progress,
          status: progress === 100 ? "Completed" : "On Track"
        };
      }
      return g;
    }));
  };

  // File support tickets
  const handleCreateTicket = async (newTkt: any) => {
    const id = `TKT-0${tickets.length + 1}`;
    const ticketItem: Ticket = {
      id,
      ...newTkt
    };
    setTickets([ticketItem, ...tickets]);
    try {
      await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketItem)
      });
    } catch (e) {
      console.warn("Ticket posting server warning", e);
    }
  };

  // Resolve tickets
  const handleResolveTicket = async (ticketId: string, reply: string) => {
    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: "Resolved", resolutionNotes: reply };
      }
      return t;
    }));
    try {
      await fetch("/api/tickets/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, resolutionNotes: reply })
      });
    } catch (e) {
      console.warn("Ticket resolution server warning", e);
    }
  };

  // Add Bulletin Announcement
  const handleAddAnnouncement = async (newAnn: any) => {
    const id = `ANN-0${announcements.length + 1}`;
    const annItem: Announcement = {
      id,
      ...newAnn
    };
    setAnnouncements([annItem, ...announcements]);
    try {
      await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(annItem)
      });
    } catch (e) {
      console.warn("Announcement posting server warning", e);
    }
  };

  // Router for Main Workspace Tab selections
  const renderMainWorkspace = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard 
            employees={employees} 
            requisitions={requisitions} 
            leaves={initialLeaveRequests} 
            attendance={attendance} 
            payroll={payroll} 
            activeRole={activeRole} 
            goals={goals}
          />
        );
      case "directory":
        return (
          <Directory 
            employees={employees} 
            activeRole={activeRole} 
            currentUser={currentUser} 
            onUpdateEmployee={handleUpdateEmployee} 
          />
        );
      case "orgintelligence":
        return (
          <OrgIntelligence 
            employees={employees} 
            activeRole={activeRole} 
            currentUser={currentUser} 
          />
        );
      case "recruitment":
        return (
          <Recruitment 
            requisitions={requisitions} 
            activeRole={activeRole} 
            onCreateRequisition={handleCreateRequisition} 
            onUpdateApplicant={handleUpdateApplicant} 
            onAddApplicant={handleAddApplicant} 
          />
        );
      case "attendance":
        return (
          <Attendance 
            attendance={attendance} 
            employees={employees} 
            currentUser={currentUser} 
            activeRole={activeRole} 
            onClockInOut={handleClockInOut} 
          />
        );
      case "payroll":
        return (
          <Payroll 
            payroll={payroll} 
            employees={employees} 
            activeRole={activeRole} 
            currentUser={currentUser} 
            onRunPayroll={handleRunPayroll} 
            onUpdateSalary={handleUpdateSalary} 
          />
        );
      case "performance":
        return (
          <Performance 
            goals={goals} 
            employees={employees} 
            activeRole={activeRole} 
            currentUser={currentUser} 
            onUpdateGoalProgress={handleUpdateGoalProgress} 
            onAddGoal={handleAddGoal} 
          />
        );
      case "learning":
        return (
          <Learning 
            employees={employees} 
            activeRole={activeRole} 
            currentUser={currentUser} 
            onUpdateEmployee={refetchEmployees} 
          />
        );
      case "compliance":
        return <Compliance />;
      case "engagement":
        return (
          <Engagement 
            employees={employees} 
            announcements={announcements} 
            activeRole={activeRole} 
            currentUser={currentUser} 
            onAddAnnouncement={handleAddAnnouncement} 
          />
        );
      case "helpdesk":
        return (
          <Helpdesk 
            tickets={tickets} 
            activeRole={activeRole} 
            currentUser={currentUser} 
            onCreateTicket={handleCreateTicket} 
            onResolveTicket={handleResolveTicket} 
          />
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-slate-400 font-sans text-xs">
            Module coming soon: {activeTab}
          </div>
        );
    }
  };

  return (
    <div id="wfh-applet-root" className="flex h-screen overflow-hidden bg-[#F0F4F2] font-sans">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeRole={activeRole} 
        setActiveRole={setActiveRole} 
        currentUser={currentUser} 
        setCurrentUser={setCurrentUser} 
        employees={employees}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* Main Workspace content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {renderMainWorkspace()}
      </div>

      {/* Sliding AI Copilot Drawer */}
      <CopilotSidebar 
        isOpen={isCopilotOpen} 
        onClose={() => setIsCopilotOpen(false)} 
      />

    </div>
  );
}
