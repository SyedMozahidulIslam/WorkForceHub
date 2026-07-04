import React, { useState } from "react";
import { 
  Scale, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Calculator, 
  FileText, 
  ShieldCheck, 
  Calendar,
  Sparkles
} from "lucide-react";

export default function Compliance() {
  const [activeTab, setActiveTab] = useState<"overtime" | "maternity" | "gratuity">("overtime");

  // Overtime Form States
  const [otHours, setOtHours] = useState(12);
  const [basicSalary, setBasicSalary] = useState(60000);

  // Maternity Form States
  const [expectedDate, setExpectedDate] = useState("2026-10-15");

  // Gratuity Form States
  const [serviceYears, setServiceYears] = useState(8);
  const [lastDrawnBasic, setLastDrawnBasic] = useState(45000);

  // Overtime calculations (Bangladesh Labour Act 2006)
  const otAnalysis = React.useMemo(() => {
    // Normal working hours: 8 hours/day, 48 hours/week (Section 100)
    // Maximum including overtime: 10 hours/day, 60 hours/week (Section 102)
    // Overtime rate: twice the basic salary rate (Section 108)
    const isOverLimit = otHours > 10;
    const hourlyBasicRate = (basicSalary / 200); // 200 hours standard work month
    const otRateHourly = hourlyBasicRate * 2;
    const standardOtEarned = Math.max(0, otHours - 8) * otRateHourly;

    return {
      hourlyBasicRate: Math.round(hourlyBasicRate),
      otRateHourly: Math.round(otRateHourly),
      otHoursExceeded: Math.max(0, otHours - 8),
      standardOtEarned: Math.round(standardOtEarned),
      isOverLimit,
      verdict: isOverLimit 
        ? "Non-Compliant: Section 102 restricts daily work hours (including overtime) to a hard ceiling of 10 hours." 
        : "Compliant: Within the standard legal overtime bracket."
    };
  }, [otHours, basicSalary]);

  // Maternity calculations (Bangladesh Labour Act Section 46)
  const maternityAnalysis = React.useMemo(() => {
    // Section 46 guarantees 16 weeks fully paid maternity leave (8 weeks prenatal, 8 weeks postnatal)
    const delivery = new Date(expectedDate);
    if (isNaN(delivery.getTime())) return null;

    const prenatalStart = new Date(delivery);
    prenatalStart.setDate(delivery.getDate() - 56); // 8 weeks before

    const postnatalEnd = new Date(delivery);
    postnatalEnd.setDate(delivery.getDate() + 56); // 8 weeks after

    return {
      prenatalStart: prenatalStart.toISOString().split('T')[0],
      postnatalEnd: postnatalEnd.toISOString().split('T')[0],
      weeksCount: 16,
      payoutDates: [
        { phase: "Prenatal Payment (First 8 weeks)", timing: "Within 3 days of submission of doctor's certificate" },
        { phase: "Postnatal Payment (Remaining 8 weeks)", timing: "Within 3 working days of delivery confirmation notification" }
      ]
    };
  }, [expectedDate]);

  // Gratuity calculations (Section 27)
  const gratuityAnalysis = React.useMemo(() => {
    // Section 27 defines gratuity as:
    // - For 5-10 years of service: 30 days basic salary for each completed year
    // - For 10+ years of service: 45 days basic salary for each completed year
    let daysMultiplier = 30;
    if (serviceYears >= 10) daysMultiplier = 45;

    const dailyBasic = lastDrawnBasic / 30;
    const totalGratuity = Math.round(serviceYears * daysMultiplier * dailyBasic);

    return {
      daysMultiplier,
      totalGratuity,
      verdict: `Entitled to ৳ ${totalGratuity.toLocaleString()} BDT based on ${daysMultiplier} days of basic wage compensation per year of completed service.`
    };
  }, [serviceYears, lastDrawnBasic]);

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-transparent font-sans text-xs">
      
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 bg-emerald-100/70 px-2.5 py-1 rounded-md uppercase font-semibold">
            Regulatory Compliance
          </span>
          <h2 className="text-2xl font-bold font-sans text-slate-900 tracking-tight mt-3">
            Bangladesh Labour Law Engine
          </h2>
          <p className="text-slate-500 text-sm">
            Interactive calculations, limits checks, and maternity schedule modeling according to the Bangladesh Labour Act 2006.
          </p>
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("overtime")}
          className={`pb-3 text-xs font-semibold px-2 transition-all ${
            activeTab === "overtime" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Section 108 Overtime Checker
        </button>
        <button
          onClick={() => setActiveTab("maternity")}
          className={`pb-3 text-xs font-semibold px-2 transition-all ${
            activeTab === "maternity" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Section 46 Maternity Planner
        </button>
        <button
          onClick={() => setActiveTab("gratuity")}
          className={`pb-3 text-xs font-semibold px-2 transition-all ${
            activeTab === "gratuity" ? "text-emerald-600 border-b-2 border-emerald-500" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Section 27 Gratuity Calculator
        </button>
      </div>

      {activeTab === "overtime" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          
          {/* Form Side */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-800">Hours worked calculation</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Section 100 sets normal working hours to **8 hours per day**. Any additional hour is counted as Overtime under Section 108, compensated at double the rate.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1">Total Hours Worked on Day</label>
                <input
                  type="number"
                  id="ot-hours-input"
                  value={otHours}
                  onChange={(e) => setOtHours(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Monthly Gross Basic Salary (BDT)</label>
                <input
                  type="number"
                  id="ot-basic-input"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Results Audit Side */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <span className="text-slate-400 font-mono tracking-wider uppercase">SMI Fahim Compliance Audit</span>
              
              <div className={`p-4 rounded-xl border mt-3 flex gap-3 ${
                otAnalysis.isOverLimit ? "bg-rose-50/20 border-rose-100" : "bg-emerald-50/20 border-emerald-100"
              }`}>
                {otAnalysis.isOverLimit ? (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-slate-800">Compliance Verdict</h4>
                  <p className="text-slate-500 mt-1 leading-relaxed">{otAnalysis.verdict}</p>
                </div>
              </div>

              <div className="space-y-2.5 mt-5">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Regular Wage hourly Rate</span>
                  <span className="font-semibold text-slate-700">৳ {otAnalysis.hourlyBasicRate} BDT</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Section 108 Overtime Hourly Rate</span>
                  <span className="font-bold text-emerald-600">৳ {otAnalysis.otRateHourly} BDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Overtime Hours Earned</span>
                  <span className="font-bold text-slate-700">{otAnalysis.otHoursExceeded} hours</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center">
              <div>
                <span className="text-emerald-800 font-bold block">Estimated Overtime Payout</span>
                <span className="text-[10px] text-emerald-600 font-mono">Added directly to next ledger run</span>
              </div>
              <span className="text-base font-extrabold text-emerald-950 font-mono">
                ৳ {otAnalysis.standardOtEarned.toLocaleString()} BDT
              </span>
            </div>
          </div>

        </div>
      )}

      {activeTab === "maternity" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          
          {/* Form Side */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-800">Maternity Benefit Planner</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Under Section 46 of the BD Labour Act, female workers with over 6 months of active employment are guaranteed **16 weeks fully paid leave** (8 weeks before delivery, 8 weeks after).
            </p>

            <div>
              <label className="text-slate-400 block mb-1">Expected Delivery Date (EDD)</label>
              <input
                type="date"
                id="maternity-edd-input"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none font-semibold text-slate-700"
              />
            </div>
          </div>

          {/* Result Calendar Side */}
          {maternityAnalysis && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-4">
              <span className="text-slate-400 font-mono tracking-wider uppercase">Projected Maternity Timelines</span>
              
              <div className="border-l-2 border-emerald-500 pl-4 space-y-4 mt-2">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Maternity Leave Commencement (Prenatal Phase)</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Leave starts around: <strong className="text-slate-700 font-mono">{maternityAnalysis.prenatalStart}</strong> (8 weeks prior to expected EDD).</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Maternity Leave Conclusion (Postnatal Phase)</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Resumption date: <strong className="text-slate-700 font-mono">{maternityAnalysis.postnatalEnd}</strong> (8 weeks post delivery).</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <span className="text-slate-400 uppercase tracking-wider font-mono text-[9px]">Mandatory Benefit Payment Milestones</span>
                {maternityAnalysis.payoutDates.map((p, index) => (
                  <div key={index} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-700 max-w-44 leading-tight">{p.phase}</span>
                    <span className="text-emerald-600 text-right leading-tight max-w-40">{p.timing}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {activeTab === "gratuity" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          
          {/* Form Side */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-800">Gratuity Accumulator</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Section 27 outlines terminal gratuity calculations upon separation: 30 days basic pay per completed year if service is 5-10 years; 45 days basic pay per year if service exceeds 10 years.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1">Completed Years of Active Service</label>
                <input
                  type="number"
                  id="gratuity-years-input"
                  value={serviceYears}
                  onChange={(e) => setServiceYears(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                  min={1}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Last Drawn Monthly Basic Salary (BDT)</label>
                <input
                  type="number"
                  id="gratuity-basic-input"
                  value={lastDrawnBasic}
                  onChange={(e) => setLastDrawnBasic(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Result Side */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <span className="text-slate-400 font-mono tracking-wider uppercase">Gratuity Entitlements Summary</span>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Gratuity Days / Completed Year</span>
                  <span className="font-mono font-bold text-slate-700">{gratuityAnalysis.daysMultiplier} Days basic pay</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Estimated Daily basic wage</span>
                  <span className="font-semibold text-slate-700">৳ {Math.round(lastDrawnBasic / 30)} BDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total calculation multiplier multiplier</span>
                  <span className="font-semibold text-slate-700">{serviceYears} years × {gratuityAnalysis.daysMultiplier} days</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-emerald-600 font-mono block mb-1">Calculated Separation Gratuity Benefit</span>
              <span className="text-lg font-extrabold text-emerald-950 font-mono">
                ৳ {gratuityAnalysis.totalGratuity.toLocaleString()} BDT
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
