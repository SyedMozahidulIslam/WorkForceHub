import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  initialEmployees,
  initialRequisitions,
  initialLeaveRequests,
  initialAttendanceRecords,
  initialPayrollRuns,
  initialGoals,
  initialTickets,
  initialAnnouncements,
  initialCourses
} from "./src/data.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize in-memory database
let employees = [...initialEmployees];
let requisitions = [...initialRequisitions];
let leaveRequests = [...initialLeaveRequests];
let attendanceRecords = [...initialAttendanceRecords];
let payrollRuns = [...initialPayrollRuns];
let goals = [...initialGoals];
let tickets = [...initialTickets];
let announcements = [...initialAnnouncements];
let courses = [...initialCourses];
let enrollments = [
  { employeeId: "EMP-006", courseId: "CRS-002", progress: 60, enrolledAt: "2026-06-10", status: "In Progress" },
  { employeeId: "EMP-009", courseId: "CRS-002", progress: 100, enrolledAt: "2026-06-15", status: "Completed" },
  { employeeId: "EMP-003", courseId: "CRS-001", progress: 100, enrolledAt: "2026-06-20", status: "Completed" },
  { employeeId: "EMP-004", courseId: "CRS-001", progress: 30, enrolledAt: "2026-06-25", status: "In Progress" }
];
let mentorships = [
  { id: "MNT-001", mentorId: "EMP-006", mentorName: "Arafat Hamim", menteeId: "EMP-009", menteeName: "Muntakim", status: "Approved" as const, department: "Engineering", startDate: "2026-05-01" },
  { id: "MNT-002", mentorId: "EMP-002", mentorName: "Abrar Ishraq", menteeId: "EMP-003", menteeName: "Suchana", status: "Approved" as const, department: "Human Resources", startDate: "2026-04-15" },
  { id: "MNT-003", mentorId: "EMP-018", mentorName: "Ahtesam Ul Haque", menteeId: "EMP-012", menteeName: "Himel Dhar", status: "Approved" as const, department: "Engineering", startDate: "2026-05-15" }
];
let assessments = [
  { employeeId: "EMP-006", assessmentId: "ASM-SYS", title: "Enterprise System Architecture", score: 95, passed: true, completedAt: "2026-06-12" },
  { employeeId: "EMP-009", assessmentId: "ASM-RJS", title: "React State Orchestration", score: 85, passed: true, completedAt: "2026-06-18" }
];

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY not found in environment. AI Copilot will run in Simulation Mode.");
}

// ---------------------- API ROUTES ----------------------

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Employees Endpoints
app.get("/api/employees", (req, res) => {
  res.json(employees);
});

app.post("/api/employees", (req, res) => {
  const newEmp = {
    ...req.body,
    id: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
    status: req.body.status || "Active"
  };
  employees.push(newEmp);
  res.status(201).json(newEmp);
});

app.put("/api/employees/:id", (req, res) => {
  const { id } = req.params;
  const index = employees.findIndex(e => e.id === id);
  if (index !== -1) {
    employees[index] = { ...employees[index], ...req.body };
    res.json(employees[index]);
  } else {
    res.status(404).json({ error: "Employee not found" });
  }
});

// Requisitions Endpoints (ATS)
app.get("/api/requisitions", (req, res) => {
  res.json(requisitions);
});

app.post("/api/requisitions", (req, res) => {
  const newReq = {
    ...req.body,
    id: `REQ-${String(requisitions.length + 1).padStart(3, '0')}`,
    applicants: req.body.applicants || [],
    postedDate: new Date().toISOString().split('T')[0]
  };
  requisitions.push(newReq);
  res.status(201).json(newReq);
});

app.post("/api/requisitions/:id/applicants", (req, res) => {
  const { id } = req.params;
  const reqIndex = requisitions.findIndex(r => r.id === id);
  if (reqIndex !== -1) {
    const newCand = {
      ...req.body,
      id: `CAN-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      status: "Applied",
      interviews: []
    };
    requisitions[reqIndex].applicants.push(newCand);
    res.status(201).json(requisitions[reqIndex]);
  } else {
    res.status(404).json({ error: "Requisition not found" });
  }
});

app.put("/api/requisitions/:reqId/applicants/:candId", (req, res) => {
  const { reqId, candId } = req.params;
  const reqIndex = requisitions.findIndex(r => r.id === reqId);
  if (reqIndex !== -1) {
    const candIndex = requisitions[reqIndex].applicants.findIndex(c => c.id === candId);
    if (candIndex !== -1) {
      requisitions[reqIndex].applicants[candIndex] = {
        ...requisitions[reqIndex].applicants[candIndex],
        ...req.body
      };
      res.json(requisitions[reqIndex]);
    } else {
      res.status(404).json({ error: "Candidate not found" });
    }
  } else {
    res.status(404).json({ error: "Requisition not found" });
  }
});

// Attendance Endpoints
app.get("/api/attendance", (req, res) => {
  res.json(attendanceRecords);
});

app.post("/api/attendance/clock", (req, res) => {
  const { employeeId, location } = req.body;
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return res.status(404).json({ error: "Employee not found" });

  const todayStr = new Date().toISOString().split('T')[0];
  const existingRecord = attendanceRecords.find(r => r.employeeId === employeeId && r.date === todayStr);

  if (existingRecord) {
    // Clock out
    existingRecord.checkOut = new Date().toTimeString().split(' ')[0].substring(0, 5);
    res.json({ message: "Clocked out successfully", record: existingRecord });
  } else {
    // Clock in
    const checkInTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
    const checkInHour = parseInt(checkInTime.split(':')[0]);
    const checkInMin = parseInt(checkInTime.split(':')[1]);
    
    let status: "Present" | "Late" = "Present";
    let lateReason = undefined;
    if (checkInHour > 9 || (checkInHour === 9 && checkInMin > 15)) {
      status = "Late";
      lateReason = "System logged late entry (after 09:15 AM)";
    }

    const newRecord = {
      id: `ATT-${String(attendanceRecords.length + 1).padStart(3, '0')}`,
      employeeId,
      employeeName: emp.name,
      department: emp.department,
      date: todayStr,
      checkIn: checkInTime,
      status,
      location: location || "GPS (Dhaka Office)",
      otHours: 0,
      lateReason
    };
    attendanceRecords.push(newRecord);
    res.status(201).json({ message: "Clocked in successfully", record: newRecord });
  }
});

// Leave Endpoints
app.get("/api/leaves", (req, res) => {
  res.json(leaveRequests);
});

app.post("/api/leaves", (req, res) => {
  const emp = employees.find(e => e.id === req.body.employeeId);
  if (!emp) return res.status(404).json({ error: "Employee not found" });

  const newRequest = {
    ...req.body,
    id: `LR-${String(leaveRequests.length + 1).padStart(3, '0')}`,
    employeeName: emp.name,
    department: emp.department,
    status: "Pending",
    appliedDate: new Date().toISOString().split('T')[0]
  };
  leaveRequests.push(newRequest);
  res.status(201).json(newRequest);
});

app.put("/api/leaves/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const leaveIndex = leaveRequests.findIndex(l => l.id === id);
  
  if (leaveIndex !== -1) {
    const leave = leaveRequests[leaveIndex];
    leave.status = status;
    
    if (status === "Approved") {
      // Deduct from employee leave balance
      const empIndex = employees.findIndex(e => e.id === leave.employeeId);
      if (empIndex !== -1) {
        const type = leave.type.toLowerCase() as keyof typeof employees[number]['leaveBalance'];
        if (employees[empIndex].leaveBalance[type] !== undefined) {
          employees[empIndex].leaveBalance[type] = Math.max(0, employees[empIndex].leaveBalance[type] - leave.days);
        }
      }
    }
    res.json(leave);
  } else {
    res.status(404).json({ error: "Leave request not found" });
  }
});

// Payroll Endpoints
app.get("/api/payroll", (req, res) => {
  res.json(payrollRuns);
});

app.post("/api/payroll/run", (req, res) => {
  const { month } = req.body;
  const existingRuns = payrollRuns.filter(p => p.month === month);
  if (existingRuns.length > 0) {
    return res.status(400).json({ error: `Payroll for ${month} has already been generated.` });
  }

  const newRuns = employees.map(emp => {
    const basic = Math.round(emp.salary * 0.6);
    const allowance = Math.round(emp.salary * 0.4);
    
    // Calculate simulated overtime BDT based on employee role/ot logs
    const otRecordCount = attendanceRecords.filter(r => r.employeeId === emp.id && r.otHours > 0).length;
    const overtime = otRecordCount * 2500; // 2500 BDT per ot shift
    
    // Bangladesh Tax calculation (simplified slab)
    let tax = 0;
    if (emp.salary > 350000) tax = Math.round(emp.salary * 0.15);
    else if (emp.salary > 150000) tax = Math.round(emp.salary * 0.10);
    else if (emp.salary > 60000) tax = Math.round(emp.salary * 0.05);

    const netPay = (basic + allowance + overtime) - tax;

    return {
      id: `PAY-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      month,
      basic,
      allowance,
      overtime,
      tax,
      netPay,
      status: "Approved" as const
    };
  });

  payrollRuns.push(...newRuns);
  res.status(201).json(newRuns);
});

app.put("/api/payroll/:id", (req, res) => {
  const { id } = req.params;
  const index = payrollRuns.findIndex(p => p.id === id);
  if (index !== -1) {
    payrollRuns[index] = { ...payrollRuns[index], ...req.body };
    res.json(payrollRuns[index]);
  } else {
    res.status(404).json({ error: "Payroll record not found" });
  }
});

// Goals Endpoints
app.get("/api/goals", (req, res) => {
  res.json(goals);
});

app.post("/api/goals", (req, res) => {
  const newGoal = {
    ...req.body,
    id: `G-${String(goals.length + 1).padStart(3, '0')}`,
    progress: req.body.progress || 0,
    status: req.body.status || "Not Started"
  };
  goals.push(newGoal);
  res.status(201).json(newGoal);
});

app.put("/api/goals/:id", (req, res) => {
  const { id } = req.params;
  const index = goals.findIndex(g => g.id === id);
  if (index !== -1) {
    goals[index] = { ...goals[index], ...req.body };
    res.json(goals[index]);
  } else {
    res.status(404).json({ error: "Goal not found" });
  }
});

// Helpdesk Tickets
app.get("/api/tickets", (req, res) => {
  res.json(tickets);
});

app.post("/api/tickets", (req, res) => {
  const newTicket = {
    ...req.body,
    id: `TCK-${String(tickets.length + 1).padStart(3, '0')}`,
    status: "Open",
    createdAt: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  tickets.push(newTicket);
  res.status(201).json(newTicket);
});

app.put("/api/tickets/:id", (req, res) => {
  const { id } = req.params;
  const index = tickets.findIndex(t => t.id === id);
  if (index !== -1) {
    tickets[index] = { ...tickets[index], ...req.body };
    res.json(tickets[index]);
  } else {
    res.status(404).json({ error: "Ticket not found" });
  }
});

// Announcements
app.get("/api/announcements", (req, res) => {
  res.json(announcements);
});

app.post("/api/announcements", (req, res) => {
  const newAnn = {
    ...req.body,
    id: `ANN-${String(announcements.length + 1).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0]
  };
  announcements.push(newAnn);
  res.status(201).json(newAnn);
});

// ---------------------- LEARNING & CAREER DEVELOPMENT ENDPOINTS ----------------------

// Fetch all learning data
app.get("/api/learning/data", (req, res) => {
  res.json({
    courses,
    enrollments,
    mentorships,
    assessments
  });
});

// Enroll in a course
app.post("/api/learning/enroll", (req, res) => {
  const { employeeId, courseId } = req.body;
  
  const emp = employees.find(e => e.id === employeeId);
  const crs = courses.find(c => c.id === courseId);
  if (!emp || !crs) {
    return res.status(404).json({ error: "Employee or Course not found" });
  }

  const existing = enrollments.find(e => e.employeeId === employeeId && e.courseId === courseId);
  if (existing) {
    return res.json(existing);
  }

  const newEnrollment = {
    employeeId,
    courseId,
    progress: 0,
    enrolledAt: new Date().toISOString().split('T')[0],
    status: "Enrolled" as const
  };
  
  enrollments.push(newEnrollment);
  res.status(201).json(newEnrollment);
});

// Update course progress and auto-graduate / award certification & skill
app.post("/api/learning/course-progress", (req, res) => {
  const { employeeId, courseId, progress } = req.body;
  const idx = enrollments.findIndex(e => e.employeeId === employeeId && e.courseId === courseId);
  
  if (idx !== -1) {
    enrollments[idx].progress = progress;
    if (progress >= 100) {
      enrollments[idx].status = "Completed";
      
      // Auto-add certification & appropriate skills to the employee profile!
      const empIdx = employees.findIndex(e => e.id === employeeId);
      const course = courses.find(c => c.id === courseId);
      
      if (empIdx !== -1 && course) {
        if (!employees[empIdx].certifications.includes(course.title)) {
          employees[empIdx].certifications.push(course.title);
        }
        
        // Give some skills
        let skillToAdd = "";
        if (course.category.includes("Legal")) skillToAdd = "Labour Law Standards";
        else if (course.category.includes("Cyber")) skillToAdd = "Enterprise RBAC & Security";
        else if (course.category.includes("Technical")) skillToAdd = "Node Optimization";
        
        if (skillToAdd && !employees[empIdx].skills.includes(skillToAdd)) {
          employees[empIdx].skills.push(skillToAdd);
        }
      }
    } else {
      enrollments[idx].status = "In Progress";
    }
    res.json(enrollments[idx]);
  } else {
    res.status(404).json({ error: "Enrollment record not found" });
  }
});

// Add certification directly
app.post("/api/learning/certifications", (req, res) => {
  const { employeeId, name } = req.body;
  const empIdx = employees.findIndex(e => e.id === employeeId);
  
  if (empIdx !== -1) {
    if (!employees[empIdx].certifications.includes(name)) {
      employees[empIdx].certifications.push(name);
    }
    res.json({ success: true, certifications: employees[empIdx].certifications });
  } else {
    res.status(404).json({ error: "Employee not found" });
  }
});

// Submit skill assessment results & auto-award skill on passing
app.post("/api/learning/assessments", (req, res) => {
  const { employeeId, assessmentId, title, score, passed, newSkill } = req.body;
  
  const empIdx = employees.findIndex(e => e.id === employeeId);
  if (empIdx === -1) {
    return res.status(404).json({ error: "Employee not found" });
  }

  const record = {
    employeeId,
    assessmentId,
    title,
    score,
    passed,
    completedAt: new Date().toISOString().split('T')[0]
  };
  
  assessments.push(record);

  // If passed, award the skill!
  if (passed && newSkill) {
    if (!employees[empIdx].skills.includes(newSkill)) {
      employees[empIdx].skills.push(newSkill);
    }
  }

  res.status(201).json(record);
});

// Match mentor pairing
app.post("/api/learning/mentorship", (req, res) => {
  const { mentorId, menteeId } = req.body;
  
  const mentor = employees.find(e => e.id === mentorId);
  const mentee = employees.find(e => e.id === menteeId);
  
  if (!mentor || !mentee) {
    return res.status(404).json({ error: "Mentor or Mentee not found" });
  }

  const existing = mentorships.find(m => m.mentorId === mentorId && m.menteeId === menteeId);
  if (existing) {
    return res.json(existing);
  }

  const newPair = {
    id: `MNT-${String(mentorships.length + 1).padStart(3, '0')}`,
    mentorId,
    mentorName: mentor.name,
    menteeId,
    menteeName: mentee.name,
    status: "Approved" as const,
    department: mentee.department,
    startDate: new Date().toISOString().split('T')[0]
  };

  mentorships.push(newPair);
  res.status(201).json(newPair);
});

// AI Course Recommendation & Learning Path Advisor
app.post("/api/learning/recommend", async (req, res) => {
  const { employeeId } = req.body;
  const emp = employees.find(e => e.id === employeeId);
  
  if (!emp) {
    return res.status(404).json({ error: "Employee not found" });
  }

  const contextPrompt = `
  Analyze this employee's profile and recommend 3 highly personalized, specific courses to bridge their skill gaps and prepare them for their natural career progression.
  Name: ${emp.name}
  Role: ${emp.role}
  Department: ${emp.department}
  Current Skills: ${emp.skills.join(", ")}
  Current Certifications: ${emp.certifications.join(", ")}
  Performance Rating: ${emp.performanceRating}/5

  Provide the recommendations as a JSON array of objects. Each object must have these EXACT fields:
  - id: A string starting with "REC-" (e.g. "REC-001")
  - title: A specific course name (e.g. "Mastering React Server Components" or "Corporate Compensation Design")
  - provider: Suggested expert provider (e.g. "Engineering Guild" or "Strategic HR Institute")
  - duration: Duration in hours (e.g. "10 Hours")
  - category: The vertical category (e.g. "Technical Development", "Strategic Management", "Finance & Accounts")
  - description: A brief, customized explanation (1-2 sentences) of exactly why this course helps ${emp.name} based on their current skills.

  Return ONLY a valid JSON array. Do not wrap it in markdown codeblocks (no \`\`\`json, just start with [ and end with ]).
  `;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [ { text: contextPrompt } ],
        config: {
          temperature: 0.4,
          responseMimeType: "application/json"
        }
      });
      
      const parsed = JSON.parse(response.text.trim());
      return res.json(parsed);
    } catch (err) {
      console.error("Gemini failed for course recommendations, running simulation fallback:", err);
    }
  }

  // Fallback Simulation Course Generator (extremely smart & customized per department)
  let simulatedRecs = [];
  if (emp.department === "Engineering") {
    simulatedRecs = [
      {
        id: "REC-001",
        title: "Microfrontends Architecture & Module Federation",
        provider: "Architect Guild Bangladesh",
        duration: "14 Hours",
        category: "Technical Development",
        description: `Recommended to help ${emp.name} modularize our high-headcount enterprise frontends, directly leveraging their React knowledge.`
      },
      {
        id: "REC-002",
        title: "Event-Driven Microservices with Node.js & Redis",
        provider: "WorkForceHub Backend Institute",
        duration: "10 Hours",
        category: "Technical Development",
        description: `Equips ${emp.name} to optimize high-volume server operations and clock-in workloads securely.`
      },
      {
        id: "REC-003",
        title: "Generative AI Integration & LLM RAG Pipelines",
        provider: "Arafat AI Lab",
        duration: "8 Hours",
        category: "Technical Development",
        description: `Prepares ${emp.name} to scale up the copilot engine with native vector search structures.`
      }
    ];
  } else if (emp.department === "Human Resources") {
    simulatedRecs = [
      {
        id: "REC-011",
        title: "Enterprise Succession Design & Flight Risk Diagnostics",
        provider: "SHRM Executive Institute",
        duration: "12 Hours",
        category: "Strategic Management",
        description: `Designed for ${emp.name} to streamline talent contingency benches and map future leadership flight risks.`
      },
      {
        id: "REC-012",
        title: "Workday Advanced Compensation & Benefit Calibration",
        provider: "Workday Certified Academy",
        duration: "16 Hours",
        category: "Strategic Management",
        description: `Perfect for ${emp.name} to optimize the standard slab-wise Bangladesh Income Tax and overtime payroll allocations.`
      },
      {
        id: "REC-013",
        title: "Workforce Analytics & Predictive Attrition Modeling",
        provider: "Abrar Global HR Summit",
        duration: "9 Hours",
        category: "Strategic Management",
        description: `Assists in analyzing engagement survey sentiment indices to proactively reinforce team cohesion.`
      }
    ];
  } else {
    // Default / Executive
    simulatedRecs = [
      {
        id: "REC-021",
        title: "Strategic Enterprise Scaling & M&A Diligence",
        provider: "Harvard Executive Business School",
        duration: "20 Hours",
        category: "Executive Leadership",
        description: `Provides ${emp.name} with framework-level tools to scale operations across South Asia.`
      },
      {
        id: "REC-022",
        title: "OKR Formulation & Dynamic Corporate Goal Alignment",
        provider: "Enterprise Coach Network",
        duration: "8 Hours",
        category: "Executive Leadership",
        description: `Facilitates ${emp.name} to cascade company OKRs directly to engineering, HR, and payroll sub-departments.`
      },
      {
        id: "REC-023",
        title: "Corporate Governance & Labour Act Compliance Shielding",
        provider: "BD Legal & Corporate Advisors",
        duration: "10 Hours",
        category: "Executive Leadership",
        description: `Ensures robust corporate practices aligned with the latest Bangladesh labour amendments.`
      }
    ];
  }

  res.json(simulatedRecs);
});

// AI COPILOT ENDPOINT
app.post("/api/copilot", async (req, res) => {
  const { message, employeeId, chatHistory } = req.body;
  
  const selectedEmp = employees.find(e => e.id === employeeId) || employees[0];

  // Build high quality rich prompt including active company snapshot context
  const companyContext = `
Active User asking is: ${selectedEmp.name} (Role: ${selectedEmp.role}, Dept: ${selectedEmp.department}).
Current total workforce headcount is ${employees.length} employees.
Active job vacancies: ${requisitions.filter(r => r.status === "Published").length} requisitions published.
Pending leave applications: ${leaveRequests.filter(l => l.status === "Pending").length} requests.
Current server time context: ${new Date().toISOString()}.
Available HR Professionals to reference:
- SMI Fahim: CEO of WorkForceHub
- Abrar Ishraq: HR Director
- Suchana: HR Manager
- Kiron Rahman: HR Assistant Manager
- Shifa: Senior HR Executive

List of several employees:
${employees.slice(0, 15).map(e => `- ${e.name} (${e.role}, Salary: ${e.salary} BDT, Joined: ${e.joiningDate})`).join('\n')}

Under the Bangladesh Labour Act 2006 compliance settings:
- Normal work hours: 8 hours per day, 48 hours per week max.
- Overtime rules: Standard overtime is paid at double the rate of basic salary. Max overtime is 60 hours total per month.
- Leave policies: Casual leave (10 days fully paid), Sick leave (14 days fully paid), Maternity leave (16 weeks fully paid).
- Minimum wage check: Governed by sector-specific wage boards.

Use this context to answer the user query professionally. Return clean Markdown.
  `;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { text: companyContext },
          ...chatHistory.map((h: any) => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.content }]
          })),
          { text: message }
        ],
        config: {
          systemInstruction: "You are the Enterprise HR Copilot for WorkForceHub, a state-of-the-art enterprise HCM designed by SMI Fahim. Your tone is highly professional, advisory, and objectively compliant with the Bangladesh Labour Act 2006. Provide deep expertise, draft documents beautifully (e.g. warning letters, offer letters, appraisal summaries, KPIs), suggest organizational solutions, and reference employees accurately.",
          temperature: 0.7,
        }
      });
      
      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini API Error in backend:", err);
      res.json({ text: `**[System Note: AI Copilot running in backup mode due to error: ${err.message || err}]**\n\nI can assist you with workforce analytics or compliance details. Here are some of our key metrics:\n- **Total Headcount**: ${employees.length} employees\n- **CEO**: SMI Fahim\n- **HR Director**: Abrar Ishraq\n\nHow else can I help draft documentation or review employee records?` });
    }
  } else {
    // Elegant Simulated fallback so user gets an outstanding experience regardless of API key presence
    const lowerMessage = message.toLowerCase();
    let reply = "";

    if (lowerMessage.includes("maternity") || lowerMessage.includes("maternity leave")) {
      reply = `### Bangladesh Labour Act Compliance: Maternity Leave Policy
According to **Section 46 of the Bangladesh Labour Act 2006**:
1. **Duration**: Every female employee is entitled to **16 weeks (112 days)** of fully paid maternity leave. Usually taken 8 weeks pre-confinement and 8 weeks post-confinement.
2. **Eligibility**: The worker must have served for at least **6 months** preceding the date of delivery.
3. **Payment calculation**: Paid at the average daily wage based on her three preceding months' basic and allowances.

**WorkForceHub Status**: We have **Suchana (Manager, HR)** and **Nishat Tasnim (L&D Coordinator)** with active maternity balances configured (112 days fully paid). Would you like to draft a maternity leave sanction letter?`;
    } else if (lowerMessage.includes("offer letter") || lowerMessage.includes("draft offer")) {
      reply = `### Enterprise Draft: Employment Offer Letter
**Date**: ${new Date().toLocaleDateString()}

**To**,
[Candidate Name]
[Address]

**Subject: Offer of Employment for [Position Name]**

Dear [Candidate Name],

On behalf of **WorkForceHub**, under the executive guidance of our CEO **SMI Fahim** and HR Director **Abrar Ishraq**, we are pleased to offer you the position of **[Position Name]** in our **[Department]** department.

**1. Commencement & Place of Work**
Your employment will commence on **[Joining Date]**. You will be based at our Dhaka Head Office, Gulshan.

**2. Remuneration**
Your gross monthly salary will be **[BDT Salary] BDT** (Sixty percent Basic, forty percent House Rent and medical benefits). This structure is strictly compliant with standard slab-wise Bangladesh Income Tax deductions.

**3. Probation & Work Hours**
You will be placed on probation for a period of **6 months**. Standard working hours are **09:00 AM to 06:00 PM**, Sunday through Thursday.

Please sign and return the copy of this offer letter as a token of your digital acceptance.

Yours sincerely,

**Abrar Ishraq**  
HR Director, WorkForceHub  
*Approved by CEO SMI Fahim*`;
    } else if (lowerMessage.includes("employee summary") || lowerMessage.includes("profile") || lowerMessage.includes("who is")) {
      const matchedEmp = employees.find(e => lowerMessage.includes(e.name.toLowerCase()));
      if (matchedEmp) {
        reply = `### 360° Profile Summary: ${matchedEmp.name}
- **Employee ID**: ${matchedEmp.id}
- **Current Position**: ${matchedEmp.role}
- **Department**: ${matchedEmp.department}
- **BDT Monthly Salary**: ${matchedEmp.salary.toLocaleString()} BDT
- **Date of Joining**: ${matchedEmp.joiningDate}
- **Status**: ${matchedEmp.status}
- **Primary Skills**: ${matchedEmp.skills.join(", ")}
- **Certifications**: ${matchedEmp.certifications.length > 0 ? matchedEmp.certifications.join(", ") : "None Logged"}
- **Medical Care Plan**: ${matchedEmp.medicalBenefits}
- **Overall Performance Rating**: **${matchedEmp.performanceRating}/5** (Excellent)

Would you like to initiate a performance objective draft, schedule an appraisal, or review their leave history?`;
      } else {
        reply = `### WorkForceHub Employee Intelligence
I can generate summaries for any of our team members. Try asking about our leaders, developers, or compliance team:
- **CEO & Managing Director**: SMI Fahim
- **HR Director**: Abrar Ishraq
- **HR Managers**: Suchana, Kiron Rahman, Shifa
- **Engineering Leads**: Arafat Hamim, Md. Maksudur, Muntakim, Sheikh Sifat

Just ask **"Who is [Employee Name]?"** to view their 360° summary instantly!`;
      }
    } else if (lowerMessage.includes("warning letter") || lowerMessage.includes("disciplinary")) {
      reply = `### Enterprise Draft: Letter of Disciplinary Warning
**Ref**: WFH/DISC/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}  
**Date**: ${new Date().toLocaleDateString()}

**To**,  
[Employee Name]  
[Department]

**Subject: Written Warning for Habitual Late Attendance / Misconduct**

Dear [Employee Name],

It has been brought to the attention of the Human Resources Department, led by **Abrar Ishraq**, and approved by our Managing Director **SMI Fahim**, that there has been a persistent violation of corporate discipline, specifically relating to attendance guidelines.

According to **Section 23 of the Bangladesh Labour Act 2006**, late attendance without approved correction workflows constitutes a disciplinary misdemeanor. Our records indicate you have logged late arrivals on multiple occurrences this month.

Please consider this a **formal written warning**. You are required to immediately correct your attendance patterns. Failure to do so will lead to further disciplinary actions up to termination of services.

Sincerely,

**Abrar Ishraq**  
HR Director  
*Cc: CEO SMI Fahim, Compliance Team*`;
    } else {
      reply = `### WorkForceHub AI HR Copilot
Hello ${selectedEmp.name}! I am your dedicated HCM Strategy Copilot. 

Here are some typical tasks I can assist you with under Bangladesh Labour compliance standards:
1. **Bangladesh Labour Act**: Ask about maternity leave timelines, overtime maximum limits, or weekend guidelines.
2. **Executive Drafts**: Ask me to *"draft an offer letter"* or *"draft a written warning letter"* for a member of the staff.
3. **Workforce Summaries**: Ask me *"Who is Arafat Hamim?"* or *"Summarize SMI Fahim"* to pull a 360° corporate brief.
4. **Recruitment Intelligence**: Benchmarking salaries, assessing talent requisition needs, or drafting interview scorecards.

What can I assist you with today?`;
    }

    // Mock delayed response for realism
    setTimeout(() => {
      res.json({ text: reply });
    }, 600);
  }
});

// ---------------------- VITE DEV & PROD SETUP ----------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
