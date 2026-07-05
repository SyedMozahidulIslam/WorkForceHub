export enum UserRole {
  SUPREME_ADMIN = "Super Supreme Admin",
  CEO = "CEO",
  HR_DIRECTOR = "HR Director",
  DEPARTMENT_HEAD = "Department Head",
  EMPLOYEE = "Employee"
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  salary: number; // in BDT
  joiningDate: string;
  status: "Active" | "Probation" | "Suspended" | "On Leave";
  skills: string[];
  certifications: string[];
  phone: string;
  bloodGroup: string;
  bankAccount: string;
  bankName: string;
  tin: string; // Tax Identification Number
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalBenefits: string;
  performanceRating: number; // 1 to 5
  location?: string;
  leaveBalance: {
    casual: number;
    sick: number;
    earned: number;
    maternity: number;
  };
  promotions: {
    title: string;
    date: string;
  }[];
  awards: string[];
  disciplinaryActions: string[];
}

export interface JobRequisition {
  id: string;
  title: string;
  department: string;
  vacancies: number;
  status: "Draft" | "Pending Approval" | "Approved" | "Published" | "Closed";
  priority: "High" | "Medium" | "Low" | "Critical";
  salaryRange: string;
  postedDate: string;
  applicants: Candidate[];
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experienceYears: number;
  parsedSummary: string;
  score: number; // AI score 1-100
  status: "Applied" | "CV Screened" | "Interviewing" | "Offered" | "Rejected";
  interviews: {
    round: string;
    dateTime: string;
    interviewer: string;
    feedback?: string;
    score?: number;
  }[];
  salaryRecommendation?: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: "Casual" | "Sick" | "Earned" | "Maternity" | "Paternity";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedDate: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string; // "HH:MM"
  checkOut?: string;
  status: "Present" | "Late" | "Absent" | "Half-Day" | "On Leave";
  location: string; // "GPS (Dhaka Office)" or "Remote"
  otHours: number;
  lateReason?: string;
}

export interface PayrollRun {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: string; // e.g. "June 2026"
  basic: number;
  allowance: number;
  overtime: number;
  tax: number;
  netPay: number;
  status: "Draft" | "Processed" | "Approved" | "Paid";
}

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  keyResult?: string;
  category?: string;
  progress: number; // 0 to 100
  startDate?: string;
  targetDate: string;
  status: string;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  category: string;
  enrolledCount: number;
  rating: number;
  coverColor: string;
}

export interface SupportTicket {
  id: string;
  employeeName: string;
  employeeId?: string;
  category: string;
  title?: string;
  subject?: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved";
  createdAt?: string;
  description: string;
  resolutionNotes?: string;
}

export interface CompanyAnnouncement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole?: string;
  date: string;
  category?: string;
  priority?: "High" | "Medium";
}

export type Goal = PerformanceGoal;
export type Ticket = SupportTicket;
export type Announcement = CompanyAnnouncement;
