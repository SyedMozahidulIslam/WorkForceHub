import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  CalendarCheck, 
  CircleDollarSign, 
  TrendingUp, 
  GraduationCap, 
  Scale, 
  Heart, 
  HelpCircle, 
  Bot, 
  ChevronRight,
  ShieldAlert,
  UserCheck,
  Network
} from "lucide-react";
import { UserRole } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  currentUser: { name: string; role: string; avatar: string };
  setCurrentUser: (user: any) => void;
  employees: any[];
  onOpenCopilot: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  currentUser,
  setCurrentUser,
  employees,
  onOpenCopilot
}: SidebarProps) {
  
  const menuItems = [
    { id: "dashboard", label: "Executive Center", icon: LayoutDashboard },
    { id: "directory", label: "360° Profiles", icon: Users },
    { id: "orgintelligence", label: "Org Intelligence", icon: Network },
    { id: "recruitment", label: "Recruitment & ATS", icon: UserSquare2 },
    { id: "attendance", label: "Attendance Engine", icon: CalendarCheck },
    { id: "payroll", label: "Payroll & BDT", icon: CircleDollarSign },
    { id: "performance", label: "KPIs & OKRs", icon: TrendingUp },
    { id: "learning", label: "L&D Portal", icon: GraduationCap },
    { id: "compliance", label: "Labour Law (BD)", icon: Scale },
    { id: "engagement", label: "Engagement Hub", icon: Heart },
    { id: "helpdesk", label: "Helpdesk & Docs", icon: HelpCircle },
  ];

  // Quick switch between key simulation personas
  const personas = [
    { name: "SMI Fahim", role: UserRole.CEO, title: "CEO & MD", empId: "EMP-001" },
    { name: "Abrar Ishraq", role: UserRole.HR_DIRECTOR, title: "HR Director", empId: "EMP-002" },
    { name: "Arafat Hamim", role: UserRole.EMPLOYEE, title: "Lead Architect", empId: "EMP-006" },
  ];

  const handlePersonaSwitch = (p: typeof personas[0]) => {
    setActiveRole(p.role);
    const emp = employees.find(e => e.id === p.empId) || employees[0];
    setCurrentUser({
      id: emp.id,
      name: emp.name,
      role: emp.role,
      avatar: emp.avatar
    });
  };

  return (
    <div id="sidebar-container" className="w-72 bg-emerald-950 text-white flex flex-col h-screen border-r border-emerald-900/40 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-emerald-900/30 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <span className="font-sans font-bold text-lg text-emerald-950">WF</span>
          </div>
          <div>
            <h1 className="font-sans font-semibold text-lg tracking-tight leading-none text-emerald-50">WorkForceHub</h1>
            <span className="text-[10px] text-emerald-400/80 uppercase font-mono tracking-widest leading-none">by SMI Fahim</span>
          </div>
        </div>
        <div className="text-[10px] text-emerald-300/60 font-medium italic mt-2 text-center border-t border-emerald-900/20 pt-1">
          "Empowering People. Driving Excellence."
        </div>
      </div>

      {/* Role / Context Switcher */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-emerald-900/30 border border-emerald-900/40">
        <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono font-semibold block mb-2">
          Simulation Persona
        </span>
        <div className="flex flex-col gap-1">
          {personas.map((p) => {
            const isSelected = currentUser.name === p.name;
            return (
              <button
                key={p.name}
                id={`persona-switch-${p.name.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => handlePersonaSwitch(p)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-250 flex items-center justify-between ${
                  isSelected 
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-emerald-950 shadow-md shadow-emerald-500/10" 
                    : "text-emerald-300 hover:bg-emerald-900/40 hover:text-white"
                }`}
              >
                <div className="flex flex-col">
                  <span>{p.name}</span>
                  <span className={`text-[9px] ${isSelected ? "text-emerald-900/80" : "text-emerald-400/60"}`}>{p.title}</span>
                </div>
                {isSelected && <UserCheck className="w-3.5 h-3.5 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-none">
        <span className="text-[10px] uppercase tracking-widest text-emerald-400/50 font-mono font-bold block px-3 mb-2">
          Core Modules
        </span>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isSelected
                  ? "bg-emerald-900/60 text-emerald-300 border-l-4 border-emerald-400"
                  : "text-emerald-100/75 hover:bg-emerald-900/30 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 transition-colors ${isSelected ? "text-emerald-400" : "text-emerald-400/60 group-hover:text-emerald-300"}`} />
                <span>{item.label}</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400/60`} />
            </button>
          );
        })}
      </nav>

      {/* Interactive AI Copilot Banner */}
      <div className="p-4 border-t border-emerald-900/30 bg-emerald-950/80">
        <button
          id="btn-sidebar-ai-copilot"
          onClick={onOpenCopilot}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-500 text-emerald-950 font-sans font-semibold text-xs tracking-wide shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 hover:brightness-105 active:scale-98 transition-all"
        >
          <Bot className="w-4.5 h-4.5" />
          <span>LAUNCH AI COPILOT</span>
        </button>
      </div>

      {/* User Footer Context */}
      <div className="p-4 border-t border-emerald-900/40 bg-emerald-950 flex items-center gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-10 h-10 rounded-xl object-cover border border-emerald-800"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-emerald-50 truncate leading-none mb-1">{currentUser.name}</p>
          <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block truncate">{activeRole}</span>
        </div>
      </div>
    </div>
  );
}
