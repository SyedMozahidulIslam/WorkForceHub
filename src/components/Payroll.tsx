import React, { useState, useMemo } from "react";
import { 
  Coins, 
  Download, 
  Printer, 
  Calculator, 
  ShieldAlert, 
  CheckCircle, 
  Sliders, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight,
  X
} from "lucide-react";
import { PayrollRun, Employee, UserRole } from "../types";

interface PayrollProps {
  payroll: PayrollRun[];
  employees: Employee[];
  activeRole: string;
  currentUser: { name: string; id: string };
  onRunPayroll: (month: string) => void;
  onUpdateSalary?: (empId: string, newSalary: number) => void;
}

export default function Payroll({
  payroll,
  employees,
  activeRole,
  currentUser,
  onRunPayroll,
  onUpdateSalary
}: PayrollProps) {

  const [selectedMonth, setSelectedMonth] = useState("July 2026");
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRun | null>(null);
  
  // Salary revision simulator states
  const [revTargetEmpId, setRevTargetEmpId] = useState(employees[0]?.id || "");
  const [revPercentage, setRevPercentage] = useState(10); // 10% raise

  // Filter logs for ESS (regular employees only see their own payslips)
  const filteredPayslips = useMemo(() => {
    if (activeRole === UserRole.CEO || activeRole === UserRole.HR_DIRECTOR) return payroll;
    return payroll.filter(p => p.employeeId === currentUser.id);
  }, [payroll, activeRole, currentUser]);

  const targetEmp = useMemo(() => {
    return employees.find(e => e.id === revTargetEmpId);
  }, [employees, revTargetEmpId]);

  const simulatedSalary = useMemo(() => {
    if (!targetEmp) return 0;
    return Math.round(targetEmp.salary * (1 + revPercentage / 100));
  }, [targetEmp, revPercentage]);

  const handleApplyIncrement = () => {
    if (onUpdateSalary && targetEmp) {
      onUpdateSalary(targetEmp.id, simulatedSalary);
      alert(`Successfully updated salary for ${targetEmp.name} to ৳ ${simulatedSalary.toLocaleString()} BDT (including the +${revPercentage}% increment).`);
    }
  };

  const handleRunPayrollSubmit = () => {
    onRunPayroll(selectedMonth);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-slate-50/50">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-600 uppercase bg-emerald-50 px-2.5 py-1 rounded-md">
            Compensation & Treasury
          </span>
          <h2 className="text-2xl font-bold font-sans text-slate-900 tracking-tight mt-2">
            Payroll & BDT Ledger
          </h2>
          <p className="text-slate-500 text-sm">
            Configure salary components, process monthly transfers, calculate tax slabs, and run increment revisions.
          </p>
        </div>

        {/* HR/CEO Run Button */}
        {(activeRole === UserRole.CEO || activeRole === UserRole.HR_DIRECTOR) && (
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
            <select
              id="payroll-month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs font-semibold focus:outline-none"
            >
              <option value="July 2026">July 2026</option>
              <option value="August 2026">August 2026</option>
              <option value="September 2026">September 2026</option>
            </select>
            <button
              id="btn-process-payroll"
              onClick={handleRunPayrollSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition"
            >
              <Calculator className="w-4 h-4" />
              Run Monthly Batch
            </button>
          </div>
        )}
      </div>

      {/* Main split: Payslips table vs Revision Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Payslips table (Col 7) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-slate-800">Available Payslips & Disbursements</h3>
            <span className="text-[10px] font-mono text-slate-400">Total processed logs: {filteredPayslips.length}</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="p-4">Payslip ID</th>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Month</th>
                  <th className="p-4">Basic Pay</th>
                  <th className="p-4">Overtime (BDT)</th>
                  <th className="p-4">Tax Deducted</th>
                  <th className="p-4 text-emerald-700">Net disbursed</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {filteredPayslips.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono text-slate-400">{p.id}</td>
                    <td className="p-4 font-bold text-slate-800">{p.employeeName}</td>
                    <td className="p-4">{p.month}</td>
                    <td className="p-4">৳ {p.basic.toLocaleString()}</td>
                    <td className="p-4">৳ {p.overtime.toLocaleString()}</td>
                    <td className="p-4 text-rose-600">৳ {p.tax.toLocaleString()}</td>
                    <td className="p-4 font-bold text-emerald-600">৳ {p.netPay.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === "Paid" 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        id={`btn-view-payslip-${p.id}`}
                        onClick={() => setSelectedPayslip(p)}
                        className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Payslip
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredPayslips.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                      No payslips generated for this persona context.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Salary Revision Engine (Col 4 - HR/CEO exclusive, else ESS details) */}
        <div className="lg:col-span-4 space-y-6">
          {(activeRole === UserRole.CEO || activeRole === UserRole.HR_DIRECTOR) ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-800">Salary Revision Simulator</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulate annual increments, adjustment variables, and project overall fiscal impact on company BDT treasury reserves.
              </p>

              <div className="space-y-4 font-sans text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Select Employee</label>
                  <select
                    id="increment-emp-select"
                    value={revTargetEmpId}
                    onChange={(e) => setRevTargetEmpId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-700"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                    ))}
                  </select>
                </div>

                {targetEmp && (
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Salary:</span>
                      <strong className="text-slate-700">৳ {targetEmp.salary.toLocaleString()} BDT</strong>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-slate-400">Proposed Increment percentage:</span>
                        <strong className="text-emerald-600">{revPercentage}% Raise</strong>
                      </div>
                      <input
                        type="range"
                        id="increment-range-slider"
                        min={1}
                        max={30}
                        value={revPercentage}
                        onChange={(e) => setRevPercentage(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-ew-resize"
                      />
                    </div>

                    <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Simulated Compensation</span>
                        <span className="block font-bold text-slate-800 mt-1">৳ {simulatedSalary.toLocaleString()} BDT</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-sm">
                        + ৳ {(simulatedSalary - targetEmp.salary).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                id="btn-apply-increment"
                onClick={handleApplyIncrement}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 transition"
              >
                <ArrowUpRight className="w-4.5 h-4.5" />
                <span>Apply Increment Adjustment</span>
              </button>
            </div>
          ) : (
            /* ESS Information on Salary tax slabs */
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-4 font-sans text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600 animate-pulse" />
                Tax Slabs & BDT Compensation Notes
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Your compensation is configured in compliance with standard **National Board of Revenue (NBR), Bangladesh** salary guidelines:
              </p>
              <div className="space-y-2 pt-2 text-slate-600 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Basic Component</span>
                  <span className="font-semibold">60% of gross salary</span>
                </div>
                <div className="flex justify-between">
                  <span>House Rent / Allowance</span>
                  <span className="font-semibold">30% of gross salary</span>
                </div>
                <div className="flex justify-between">
                  <span>Conveyance & Medical</span>
                  <span className="font-semibold">10% of gross salary</span>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-3 text-[10px] leading-normal text-slate-500">
                💡 Standard Tax deductions are mapped on your designated Tax Identification Number (TIN). To update your tax declaration certificates, please submit a Helpdesk ticket.
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Printable Payslip Modal view */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div id="printable-payslip-modal" className="bg-white p-8 rounded-2xl border border-slate-200 max-w-2xl w-full shadow-2xl space-y-6 relative">
            
            {/* Modal close */}
            <button 
              onClick={() => setSelectedPayslip(null)} 
              className="absolute right-5 top-5 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Payslip Header */}
            <div className="text-center pb-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">WorkForceHub BDT Salary Slip</h3>
              <p className="text-xs text-slate-400">Processed under Executive Committee approval by SMI Fahim</p>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-600 px-3 py-1 rounded-md inline-block mt-3 font-bold uppercase">
                Disbursement Cycle: {selectedPayslip.month}
              </span>
            </div>

            {/* Employee Meta details */}
            <div className="grid grid-cols-2 gap-4 text-xs font-sans text-slate-600 pb-4 border-b border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Employee Name</span>
                <strong className="text-slate-800 text-sm">{selectedPayslip.employeeName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Disbursement Status</span>
                <strong className="text-emerald-600 uppercase font-mono">Transfer Confirmed (SCB Bank Transfer)</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Employee ID</span>
                <span className="font-mono font-semibold">{selectedPayslip.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Department Vertical</span>
                <span className="font-semibold">{selectedPayslip.department}</span>
              </div>
            </div>

            {/* Wage breakdowns */}
            <div className="space-y-3 font-sans text-xs">
              <span className="text-slate-400 uppercase tracking-wider font-mono text-[10px]">Wage Component Breakdown</span>
              
              <div className="space-y-2 border border-slate-100 p-4 rounded-xl bg-slate-50/50">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-600">Basic Wage Component (60% Gross)</span>
                  <span className="font-mono font-semibold text-slate-800">৳ {selectedPayslip.basic.toLocaleString()} BDT</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-600">Unified Corporate Allowances (House, Medical)</span>
                  <span className="font-mono font-semibold text-slate-800">৳ {selectedPayslip.allowance.toLocaleString()} BDT</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-600">Disbursed Overtime shifts</span>
                  <span className="font-mono font-semibold text-slate-800">৳ {selectedPayslip.overtime.toLocaleString()} BDT</span>
                </div>
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Standard NBR slab Income Tax Deductions</span>
                  <span className="font-mono font-semibold">- ৳ {selectedPayslip.tax.toLocaleString()} BDT</span>
                </div>
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <div>
                  <span className="text-emerald-800 font-bold text-xs block">Net Settlement Released</span>
                  <span className="text-[10px] text-emerald-600 font-mono">Tax and allowances fully adjusted</span>
                </div>
                <span className="text-lg font-extrabold text-emerald-950 font-mono">
                  ৳ {selectedPayslip.netPay.toLocaleString()} BDT
                </span>
              </div>
            </div>

            {/* Print trigger button */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Approved digital signature of HR Lead Abrar Ishraq</span>
              <div className="flex gap-2">
                <button
                  id="btn-payslip-print"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-1.5 hover:bg-slate-50"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF
                </button>
                <button
                  id="btn-payslip-close"
                  onClick={() => setSelectedPayslip(null)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
                >
                  Close Document
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
