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
  ChevronRight,
  Users,
  DollarSign
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
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Local edit states
  const [editPhone, setEditPhone] = useState("");
  const [editEmergencyName, setEditEmergencyName] = useState("");
  const [editEmergencyPhone, setEditEmergencyPhone] = useState("");
  const [editBankAcc, setEditBankAcc] = useState("");
  const [editBankName, setEditBankName] = useState("");
  const [editSkillsString, setEditSkillsString] = useState("");
  const [editLocation, setEditLocation] = useState("");

  // Bulk selection and action states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState<"dept" | "location" | null>(null);
  const [bulkDeptValue, setBulkDeptValue] = useState("");
  const [bulkLocValue, setBulkLocValue] = useState("");

  // Helper to resolve employee location
  const getEmployeeLocation = (emp: Employee) => {
    if (emp.location) return emp.location;
    if (emp.role.toLowerCase().includes("chittagong")) return "Chittagong Office";
    if (emp.role.toLowerCase().includes("remote") || emp.name === "Muntakim") return "Remote";
    if (emp.id === "EMP-016") return "Chittagong Office";
    const idNum = parseInt(emp.id.replace("EMP-", ""), 10);
    if (isNaN(idNum)) return "Dhaka HQ";
    if (idNum % 4 === 0) return "Remote";
    if (idNum % 5 === 0) return "Sylhet Office";
    if (idNum % 7 === 0) return "Chittagong Office";
    return "Dhaka HQ";
  };

  // Helper to resolve employee gender
  const getEmployeeGender = (emp: Employee) => {
    const nameLower = emp.name.toLowerCase();
    if (
      nameLower.includes("suchana") || 
      nameLower.includes("shifa") || 
      nameLower.includes("nishat") || 
      nameLower.includes("tasnim") || 
      nameLower.includes("laila") || 
      nameLower.includes("farhana") || 
      nameLower.includes("sabrina") || 
      nameLower.includes("rokeya") || 
      nameLower.includes("asma") || 
      nameLower.includes("fatema") || 
      nameLower.includes("israt") || 
      nameLower.includes("shirin") || 
      nameLower.includes("hasna") || 
      nameLower.includes("afroza") || 
      nameLower.includes("nusrat") || 
      nameLower.includes("sadia") || 
      nameLower.includes("rumana") || 
      nameLower.includes("maliha") || 
      nameLower.includes("anika") || 
      nameLower.includes("jahan") || 
      nameLower.includes("tanjina") || 
      nameLower.includes("ayesha") || 
      nameLower.includes("samia") || 
      nameLower.includes("mehnaz") || 
      nameLower.includes("tasmiah") || 
      nameLower.includes("noshin") || 
      nameLower.includes("lamia") || 
      nameLower.includes("afia") || 
      nameLower.includes("shahnaz") || 
      nameLower.includes("dilruba") || 
      nameLower.includes("rowshan") ||
      (emp.leaveBalance && emp.leaveBalance.maternity > 0)
    ) {
      return "Female";
    }
    return "Male";
  };

  // Unique list of departments
  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department));
    return ["All", ...Array.from(depts)];
  }, [employees]);

  // Unique list of locations
  const locations = useMemo(() => {
    const locs = new Set(employees.map(e => getEmployeeLocation(e)));
    return ["All Locations", ...Array.from(locs)];
  }, [employees]);

  // Unique actual departments for bulk updating
  const actualDepartments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department));
    return Array.from(depts).filter(Boolean);
  }, [employees]);

  // Unique actual locations for bulk updating
  const actualLocations = useMemo(() => {
    const locs = new Set(employees.map(e => getEmployeeLocation(e)));
    return Array.from(locs).filter(Boolean);
  }, [employees]);

  // Handle single employee selection checkbox
  const toggleSelectEmployee = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Apply bulk update actions
  const applyBulkAction = () => {
    if (!bulkActionType) return;
    
    selectedIds.forEach(id => {
      const emp = employees.find(e => e.id === id);
      if (emp) {
        const updated: Employee = {
          ...emp,
          ...(bulkActionType === "dept" && bulkDeptValue ? { department: bulkDeptValue } : {}),
          ...(bulkActionType === "location" && bulkLocValue ? { location: bulkLocValue } : {})
        };
        onUpdateEmployee(updated);
      }
    });

    // Reset selection & control states
    setSelectedIds([]);
    setBulkActionType(null);
    setBulkDeptValue("");
    setBulkLocValue("");
  };

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const loc = getEmployeeLocation(emp);
      const matchSearch = 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchDept = selectedDept === "All" || emp.department === selectedDept;
      const matchLoc = selectedLocation === "All Locations" || loc === selectedLocation;
      
      return matchSearch && matchDept && matchLoc;
    });
  }, [employees, searchTerm, selectedDept, selectedLocation]);

  // Memoized average salary
  const avgSalary = useMemo(() => {
    if (filteredEmployees.length === 0) return 0;
    const totalSalary = filteredEmployees.reduce((sum, e) => sum + e.salary, 0);
    return Math.round(totalSalary / filteredEmployees.length);
  }, [filteredEmployees]);

  // Memoized gender stats
  const genderStats = useMemo(() => {
    let male = 0;
    let female = 0;
    filteredEmployees.forEach((emp) => {
      if (getEmployeeGender(emp) === "Female") {
        female++;
      } else {
        male++;
      }
    });
    const total = filteredEmployees.length;
    const femalePercent = total > 0 ? Math.round((female / total) * 100) : 0;
    const malePercent = total > 0 ? Math.round((male / total) * 100) : 0;
    return { male, female, femalePercent, malePercent };
  }, [filteredEmployees]);

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
    setEditLocation(getEmployeeLocation(emp));
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
      skills: editSkillsString.split(",").map(s => s.trim()).filter(Boolean),
      location: editLocation
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

        {/* Summary Statistics Dashboard */}
        <div id="directory-stats-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Card 1: Headcount */}
          <div className="bento-card p-4 flex items-center justify-between bg-white border border-slate-100 shadow-xs rounded-2xl">
            <div className="space-y-1">
              <span className="text-[11px] font-bold font-mono tracking-wider uppercase text-slate-400">Headcount</span>
              <h3 className="text-2xl font-black font-sans text-slate-800 tracking-tight">
                {filteredEmployees.length}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                {selectedDept === "All" ? "Across all departments" : `In ${selectedDept}`}
              </p>
            </div>
            <div className="p-3 bg-emerald-50/80 rounded-xl text-emerald-600 shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Average Salary */}
          <div className="bento-card p-4 flex items-center justify-between bg-white border border-slate-100 shadow-xs rounded-2xl">
            <div className="space-y-1">
              <span className="text-[11px] font-bold font-mono tracking-wider uppercase text-slate-400">Average Salary</span>
              <h3 className="text-2xl font-black font-sans text-slate-800 tracking-tight">
                ৳{avgSalary.toLocaleString("en-US")}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                Monthly base BDT run-rate
              </p>
            </div>
            <div className="p-3 bg-emerald-50/80 rounded-xl text-emerald-600 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Gender Diversity */}
          <div className="bento-card p-4 flex items-center justify-between bg-white border border-slate-100 shadow-xs rounded-2xl">
            <div className="space-y-1 flex-1">
              <span className="text-[11px] font-bold font-mono tracking-wider uppercase text-slate-400">Gender Diversity</span>
              <h3 className="text-lg font-black font-sans text-slate-800 tracking-tight flex items-baseline gap-1.5 mt-0.5">
                <span>{genderStats.femalePercent}%</span>
                <span className="text-xs font-medium text-slate-400">Female</span>
                <span className="text-slate-300">|</span>
                <span>{genderStats.malePercent}%</span>
                <span className="text-xs font-medium text-slate-400">Male</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-medium truncate">
                {genderStats.female} Female · {genderStats.male} Male
              </p>
            </div>
            <div className="p-3 bg-emerald-50/80 rounded-xl text-emerald-600 shrink-0 self-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 bento-card p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="directory-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, department, location, job role, or skills..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono uppercase text-slate-400 shrink-0">Dept:</span>
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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono uppercase text-slate-400 shrink-0">Location:</span>
              <select
                id="directory-location-select"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-sans font-medium text-slate-600 focus:outline-none focus:border-emerald-500"
              >
                {locations.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <div id="directory-bulk-toolbar" className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in shadow-xs">
            <div className="flex items-center gap-3">
              <span className="py-1 px-2.5 bg-emerald-600 text-white rounded-xl font-extrabold text-xs font-mono">
                {selectedIds.length} SELECTED
              </span>
              <p className="text-xs text-slate-600 font-medium font-sans">
                Apply a bulk action to the selected employee profiles
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">Action:</span>
                <select
                  id="bulk-action-type-select"
                  value={bulkActionType || ""}
                  onChange={(e) => {
                    const val = e.target.value as "dept" | "location" | "";
                    setBulkActionType(val || null);
                    setBulkDeptValue("");
                    setBulkLocValue("");
                  }}
                  className="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-sans font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Action --</option>
                  <option value="dept">Assign Department</option>
                  <option value="location">Update Location</option>
                </select>
              </div>

              {bulkActionType === "dept" && (
                <div className="flex items-center gap-2">
                  <select
                    id="bulk-dept-value-select"
                    value={bulkDeptValue}
                    onChange={(e) => setBulkDeptValue(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-sans font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Select Department --</option>
                    {actualDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                    <option value="NEW_CUSTOM">Custom...</option>
                  </select>
                  {bulkDeptValue === "NEW_CUSTOM" && (
                    <input
                      type="text"
                      placeholder="Custom Dept..."
                      id="bulk-custom-dept-input"
                      className="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-sans text-slate-800 focus:outline-none focus:border-emerald-500 w-36"
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          setBulkDeptValue(e.target.value.trim());
                        }
                      }}
                    />
                  )}
                </div>
              )}

              {bulkActionType === "location" && (
                <div className="flex items-center gap-2">
                  <select
                    id="bulk-loc-value-select"
                    value={bulkLocValue}
                    onChange={(e) => setBulkLocValue(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-sans font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Select Location --</option>
                    {actualLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                    <option value="NEW_CUSTOM">Custom...</option>
                  </select>
                  {bulkLocValue === "NEW_CUSTOM" && (
                    <input
                      type="text"
                      placeholder="Custom Loc..."
                      id="bulk-custom-loc-input"
                      className="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-sans text-slate-800 focus:outline-none focus:border-emerald-500 w-36"
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          setBulkLocValue(e.target.value.trim());
                        }
                      }}
                    />
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  id="bulk-action-apply-btn"
                  onClick={applyBulkAction}
                  disabled={!bulkActionType || (bulkActionType === "dept" && !bulkDeptValue) || (bulkActionType === "location" && !bulkLocValue)}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs py-1.5 px-4 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  Apply
                </button>

                <button
                  id="bulk-action-cancel-btn"
                  onClick={() => {
                    setSelectedIds([]);
                    setBulkActionType(null);
                    setBulkDeptValue("");
                    setBulkLocValue("");
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-1.5 px-3 rounded-xl transition-all shrink-0 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List Summary & Select All Row */}
        <div className="flex items-center justify-between mb-4 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
          <p className="text-xs font-medium text-slate-500 font-sans">
            Showing <span className="text-slate-800 font-bold font-mono">{filteredEmployees.length}</span> team profiles
          </p>
          <button
            id="bulk-select-all-btn"
            onClick={() => {
              const allFilteredIds = filteredEmployees.map(e => e.id);
              const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));
              if (isAllSelected) {
                // Deselect all filtered
                setSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
              } else {
                // Select all filtered
                setSelectedIds(prev => {
                  const union = new Set([...prev, ...allFilteredIds]);
                  return Array.from(union);
                });
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 hover:bg-emerald-100/70 py-1 px-3 rounded-xl cursor-pointer"
          >
            {filteredEmployees.length > 0 && filteredEmployees.map(e => e.id).every(id => selectedIds.includes(id)) ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                Deselect All Filtered
              </>
            ) : (
              <>
                <Users className="w-3.5 h-3.5" />
                Select All Filtered
              </>
            )}
          </button>
        </div>

        {/* Employee Grid */}
        <div id="directory-employee-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => {
            const isSelected = selectedEmp?.id === emp.id;
            const isChecked = selectedIds.includes(emp.id);
            return (
              <div
                key={emp.id}
                id={`emp-card-${emp.id}`}
                onClick={() => handleSelectEmployee(emp)}
                className={`bento-card p-5 cursor-pointer flex gap-3.5 items-start relative transition-all duration-200 ${
                  isSelected 
                    ? "border-emerald-500 ring-2 ring-emerald-500/15 bg-slate-50/50" 
                    : "hover:border-slate-300"
                } ${isChecked ? "bg-emerald-50/10 border-emerald-300" : ""}`}
              >
                {/* Checkbox */}
                <div 
                  id={`emp-checkbox-wrapper-${emp.id}`}
                  onClick={(e) => toggleSelectEmployee(emp.id, e)}
                  className="flex items-center justify-center cursor-pointer shrink-0 pt-1"
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    isChecked
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 bg-white hover:border-slate-400"
                  }`}>
                    {isChecked && (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                  </div>
                </div>

                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
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
                  <div className="flex items-center gap-1.5 justify-between flex-wrap">
                    <p className="text-[11px] text-slate-400 font-medium truncate leading-normal flex-1">{emp.role}</p>
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-slate-400 font-mono font-medium">
                      <MapPin className="w-2.5 h-2.5 text-emerald-500" />
                      {getEmployeeLocation(emp)}
                    </span>
                  </div>
                  
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
                  <div>
                    <span className="text-slate-400 block text-[10px] flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                      Office Location
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        className="bg-white border border-slate-200 rounded-md py-1 px-1.5 w-full font-sans"
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">{getEmployeeLocation(selectedEmp)}</span>
                    )}
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
