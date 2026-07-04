import React, { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  AlertOctagon, 
  FileText, 
  Edit3, 
  Plus, 
  X, 
  Check, 
  CreditCard, 
  HeartHandshake, 
  TrendingUp, 
  Bookmark,
  ChevronRight
} from "lucide-react";
import { Employee, UserRole } from "../types";

interface DirectoryProps {
  employees: Employee[];
  activeRole: string;
  currentUser: { name: string; role: string; id?: string };
  onUpdateEmployee: (emp: Employee) => void;
}

export default function Directory({
  employees,
  activeRole,
  currentUser,
  onUpdateEmployee
}: DirectoryProps) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Local edit states
  const [editPhone, setEditPhone] = useState("");
  const [editEmergencyName, setEditEmergencyName] = useState("");
  const [editEmergencyPhone, setEditEmergencyPhone] = useState("");
  const [editBankAcc, setEditBankAcc] = useState("");
  const [editBankName, setEditBankName] = useState("");
  const [editSkillsString, setEditSkillsString] = useState("");

  // Unique list of departments
  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department));
    return ["All", ...Array.from(depts)];
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchDept = selectedDept === "All" || emp.department === selectedDept;
      
      return matchSearch && matchDept;
    });
  }, [employees, searchTerm, selectedDept]);

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmp(emp);
    setIsEditing(false);
    // Initialize editing states
    setEditPhone(emp.phone);
    setEditEmergencyName(emp.emergencyContactName);
    setEditEmergencyPhone(emp.emergencyContactPhone);
    setEditBankAcc(emp.bankAccount);
    setEditBankName(emp.bankName);
    setEditSkillsString(emp.skills.join(", "));
  };

  const handleSaveEdit = async () => {
    if (!selectedEmp) return;
    
    const updated: Employee = {
      ...selectedEmp,
      phone: editPhone,
      emergencyContactName: editEmergencyName,
      emergencyContactPhone: editEmergencyPhone,
      bankAccount: editBankAcc,
      bankName: editBankName,
      skills: editSkillsString.split(",").map(s => s.trim()).filter(Boolean)
    };

    onUpdateEmployee(updated);
    setSelectedEmp(updated);
    setIsEditing(false);
  };

  const canEdit = useMemo(() => {
    if (activeRole === UserRole.CEO || activeRole === UserRole.HR_DIRECTOR) return true;
    if (currentUser.id === selectedEmp?.id) return true; // Employee Self Service edit profile
    return false;
  }, [activeRole, currentUser, selectedEmp]);

  return (
    <div className="flex-1 flex overflow-hidden bg-transparent">
      
      {/* Employee List Workspace Side (Left) */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto border-r border-slate-200/60">
        
        {/* Module Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 bg-emerald-100/70 px-2.5 py-1 rounded-md uppercase">
              Workforce Intelligence
            </span>
            <h2 className="text-2xl font-bold font-sans text-slate-900 tracking-tight mt-3">
              Corporate Directory
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Explore 360° employee master records, performance status, and skills matrix.
            </p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 bento-card p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="directory-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by employee name, job role, or specific skills..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              id="directory-dept-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-sans font-medium text-slate-600 focus:outline-none focus:border-emerald-500"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Employee Grid */}
        <div id="directory-employee-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => {
            const isSelected = selectedEmp?.id === emp.id;
            return (
              <div
                key={emp.id}
                id={`emp-card-${emp.id}`}
                onClick={() => handleSelectEmployee(emp)}
                className={`bento-card p-5 cursor-pointer flex gap-4 ${
                  isSelected 
                    ? "border-emerald-500 ring-2 ring-emerald-500/15" 
                    : ""
                }`}
              >
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{emp.id}</span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      emp.status === "Active" 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                        : emp.status === "Probation" 
                          ? "bg-amber-50 text-amber-600 border border-amber-100" 
                          : "bg-rose-50 text-rose-600 border border-rose-100"
                    }`}>
                      {emp.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 truncate mt-1">{emp.name}</h4>
                  <p className="text-[11px] text-slate-400 font-medium truncate leading-normal">{emp.role}</p>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {emp.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="text-[9px] font-mono text-emerald-700 bg-emerald-50/60 px-1.5 py-0.5 rounded-xs truncate">
                        {skill}
                      </span>
                    ))}
                    {emp.skills.length > 3 && (
                      <span className="text-[9px] font-mono text-slate-400 px-1 py-0.5">
                        +{emp.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredEmployees.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 font-medium">
              <span className="text-sm">No employees found matching query</span>
            </div>
          )}
        </div>

      </div>

      {/* 360° Profile Side Drawer Panel (Right) */}
      <div className={`w-112 bg-white border-l border-slate-200 overflow-y-auto transform transition-all duration-300 ${
        selectedEmp ? "translate-x-0" : "translate-x-full hidden"
      }`}>
        {selectedEmp && (
          <div className="p-6 space-y-6">
            
            {/* Header / Basic Info */}
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-mono font-extrabold text-slate-400 bg-slate-50 px-2 py-1 rounded-sm">
                Employee 360° Snapshot
              </span>
              <button 
                onClick={() => setSelectedEmp(null)} 
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
              <div className="relative">
                <img
                  src={selectedEmp.avatar}
                  alt={selectedEmp.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-100"
                />
                <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                  selectedEmp.status === "Active" ? "bg-emerald-500" : "bg-amber-500"
                }`} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-4 leading-none">{selectedEmp.name}</h3>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">{selectedEmp.role}</p>
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mt-2">
                {selectedEmp.department}
              </span>
            </div>

            {/* Quick Actions (e.g. Edit Profile toggle) */}
            {canEdit && (
              <div className="flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <button
                      id="btn-edit-cancel"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-1.5 hover:bg-slate-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                    <button
                      id="btn-edit-save"
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-700 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save Updates
                    </button>
                  </>
                ) : (
                  <button
                    id="btn-edit-toggle"
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-1.5 hover:bg-slate-50"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Profile Details
                  </button>
                )}
              </div>
            )}

            {/* Main Tabs Details */}
            <div className="space-y-6 text-xs font-sans">
              
              {/* Contact & Personal details */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                  Personal Coordinates
                </h4>
                <div className="grid grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Employee ID</span>
                    <span className="font-mono font-bold">{selectedEmp.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Joining Date</span>
                    <span className="font-semibold">{selectedEmp.joiningDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email Contact</span>
                    <span className="truncate block font-semibold">{selectedEmp.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone Number</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="bg-white border border-slate-200 rounded-md py-1 px-1.5 w-full font-sans"
                      />
                    ) : (
                      <span className="font-semibold">{selectedEmp.phone}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Blood Group</span>
                    <span className="font-bold text-rose-600">{selectedEmp.bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Performance Band</span>
                    <span className="font-bold text-emerald-600">{selectedEmp.performanceRating}/5.0</span>
                  </div>
                </div>
              </div>

              {/* BDT Compensation & Tax Accounts */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  Finance & BDT Payroll Setup
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-400">Monthly Compensation</span>
                    <span className="font-bold text-slate-800">৳ {selectedEmp.salary.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-400">Tax TIN Registration</span>
                    <span className="font-mono font-medium">{selectedEmp.tin}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-400">Settlement Bank Account</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editBankAcc}
                        onChange={(e) => setEditBankAcc(e.target.value)}
                        className="bg-white border border-slate-200 rounded-md py-1 px-1.5 w-full font-sans font-mono"
                      />
                    ) : (
                      <span className="font-mono">{selectedEmp.bankAccount}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Settlement Bank Name</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editBankName}
                        onChange={(e) => setEditBankName(e.target.value)}
                        className="bg-white border border-slate-200 rounded-md py-1 px-1.5 w-full font-sans"
                      />
                    ) : (
                      <span className="font-semibold text-slate-600 text-right">{selectedEmp.bankName}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Contact Coordinates */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                  Emergency Guard Coordinates
                </h4>
                <div className="grid grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Person Name</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editEmergencyName}
                        onChange={(e) => setEditEmergencyName(e.target.value)}
                        className="bg-white border border-slate-200 rounded-md py-1 px-1.5 w-full font-sans"
                      />
                    ) : (
                      <span className="font-semibold">{selectedEmp.emergencyContactName}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Number</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editEmergencyPhone}
                        onChange={(e) => setEditEmergencyPhone(e.target.value)}
                        className="bg-white border border-slate-200 rounded-md py-1 px-1.5 w-full font-sans"
                      />
                    ) : (
                      <span className="font-semibold">{selectedEmp.emergencyContactPhone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Skills matrix */}
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider mb-2">
                  Skills & Core Competencies
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editSkillsString}
                    onChange={(e) => setEditSkillsString(e.target.value)}
                    placeholder="Comma separated skills..."
                    className="bg-white border border-slate-200 rounded-xl py-2 px-3 w-full font-sans text-xs"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEmp.skills.map(s => (
                      <span key={s} className="bg-slate-100 text-slate-700 font-mono text-[10px] px-2 py-1 rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Certifications and Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/30">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider mb-2">
                    Accredited Credentials
                  </span>
                  <div className="space-y-1">
                    {selectedEmp.certifications.map(c => (
                      <div key={c} className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[10px] truncate">{c}</span>
                      </div>
                    ))}
                    {selectedEmp.certifications.length === 0 && (
                      <span className="text-slate-400 italic text-[10px]">No credentials logged</span>
                    )}
                  </div>
                </div>

                <div className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/30">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider mb-2">
                    Medical Health Package
                  </span>
                  <span className="text-[10px] text-slate-600 leading-normal block">
                    {selectedEmp.medicalBenefits}
                  </span>
                </div>
              </div>

              {/* Promotion History Timeline */}
              {selectedEmp.promotions && selectedEmp.promotions.length > 0 && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider mb-2">
                    Career Timeline & Elevations
                  </span>
                  <div className="border-l-2 border-slate-100 pl-3 space-y-3.5">
                    {selectedEmp.promotions.map((p, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                        <h5 className="font-bold text-slate-700 text-[11px]">{p.title}</h5>
                        <p className="text-[10px] text-slate-400">{p.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards and Disciplines */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex gap-2">
                  <span className="font-bold text-emerald-600">🏆 Awards:</span>
                  <span className="text-slate-500">
                    {selectedEmp.awards.length > 0 ? selectedEmp.awards.join(" | ") : "None Logged"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-rose-600">⚠️ Disciplinary Actions:</span>
                  <span className="text-slate-500">
                    {selectedEmp.disciplinaryActions.length > 0 ? selectedEmp.disciplinaryActions.join(" | ") : "Zero Infractions (Compliant)"}
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
}
