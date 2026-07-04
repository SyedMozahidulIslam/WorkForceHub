import React, { useState, useEffect, useMemo } from "react";
import {
  GraduationCap,
  Trophy,
  TrendingUp,
  Award,
  BookOpen,
  UserCheck,
  Compass,
  Brain,
  CheckCircle2,
  ArrowRight,
  Users,
  Target,
  Zap,
  Sparkles,
  Calendar,
  ChevronRight,
  Plus,
  Search,
  BookMarked,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Clock,
  Briefcase
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { Employee, UserRole, Course } from "../types";

interface LearningProps {
  employees: Employee[];
  activeRole: UserRole;
  currentUser: any;
  onUpdateEmployee?: () => void;
}

// Hardcoded assessments questions
const assessmentBanks = {
  compliance: {
    title: "Bangladesh Labour Act 2006 & HR Standards",
    skillAwarded: "Labour Law Standards",
    badge: "Compliance Champion",
    questions: [
      {
        q: "Under Section 46 of the Bangladesh Labour Act, how many weeks of fully paid maternity leave is a female worker entitled to?",
        options: [
          "12 weeks",
          "14 weeks",
          "16 weeks (112 days)",
          "18 weeks"
        ],
        answer: 2
      },
      {
        q: "What is the maximum limit of normal work hours per day (excluding overtime) under standard provisions?",
        options: [
          "8 hours",
          "9 hours",
          "10 hours",
          "12 hours"
        ],
        answer: 0
      },
      {
        q: "According to standard overtime rules under Section 108, overtime work is paid at what rate?",
        options: [
          "Single rate of basic wage",
          "One and a half times of standard basic wage",
          "Double the rate of basic salary plus allowances",
          "Triple the rate of basic salary"
        ],
        answer: 2
      },
      {
        q: "What is the mandatory minimum probationary period for a clerical employee in an office under standard terms?",
        options: [
          "1 month",
          "3 months",
          "6 months",
          "1 year"
        ],
        answer: 2
      },
      {
        q: "Which leave is entitlement-only and cannot be accumulated beyond a single calendar year under the Act?",
        options: [
          "Casual Leave (10 days)",
          "Sick Leave (14 days)",
          "Earned Leave",
          "Maternity Leave"
        ],
        answer: 0
      }
    ]
  },
  technical: {
    title: "Enterprise System Design & React Orchestration",
    skillAwarded: "Enterprise System Security",
    badge: "System Architect",
    questions: [
      {
        q: "Which React 18 API is explicitly designed to handle non-blocking UI updates during heavy state transitions?",
        options: [
          "useDeferredValue",
          "useTransition / startTransition",
          "useLayoutEffect",
          "useReducer"
        ],
        answer: 1
      },
      {
        q: "When running in the WorkForceHub container environment behind reverse proxies, which binding address is required?",
        options: [
          "localhost:5173",
          "127.0.0.1:3000",
          "0.0.0.0:3000",
          "10.0.0.1:3000"
        ],
        answer: 2
      },
      {
        q: "To prevent cookie hijacking (XSS) in JWT authentication flows, which cookie flags should always be configured?",
        options: [
          "Secure only",
          "HttpOnly, Secure, and SameSite=Strict / Lax",
          "Path=/ and Expires",
          "Domain-scoped only"
        ],
        answer: 1
      },
      {
        q: "What issue is caused when updating React state directly in a component body without hooks?",
        options: [
          "Infinite re-renders / Stack overflow",
          "Memory leak",
          "Webpack compilation failure",
          "CSS layout reflow"
        ],
        answer: 0
      },
      {
        q: "What is the primary benefit of bundling server-side code with CJS format via esbuild?",
        options: [
          "Makes the page load faster",
          "Strictly bypasses Node's ES Module relative path runtime issues",
          "Minifies HTML layouts",
          "Optimizes PostgreSQL connection pools"
        ],
        answer: 1
      }
    ]
  }
};

export default function Learning({ employees, activeRole, currentUser, onUpdateEmployee }: LearningProps) {
  // Navigation
  const [activeSubTab, setActiveSubTab] = useState<"center" | "paths" | "assessments" | "mentorship" | "certifications">("center");

  // Server state
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [mentorships, setMentorships] = useState<any[]>([]);
  const [assessmentsData, setAssessmentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // AI recommendations
  const [aiRecs, setAiRecs] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  // Assessment Quiz State
  const [selectedQuizKey, setSelectedQuizKey] = useState<"compliance" | "technical" | null>(null);
  const [quizProgress, setQuizProgress] = useState<{
    currentQuestionIndex: number;
    answers: Record<number, number>;
    submitted: boolean;
    score: number;
    passed: boolean;
  } | null>(null);

  // Cert Form State
  const [certForm, setCertForm] = useState({ name: "", issuer: "", year: "" });
  const [isSubmittingCert, setIsSubmittingCert] = useState(false);

  // Mentorship pairing form State
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [isMatchingMentor, setIsMatchingMentor] = useState(false);

  // Catalog search
  const [searchCatalog, setSearchCatalog] = useState("");

  // Fetch learning data from backend
  const fetchLearningData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/learning/data");
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
        setEnrollments(data.enrollments || []);
        setMentorships(data.mentorships || []);
        setAssessmentsData(data.assessments || []);
      } else {
        throw new Error("Failed to fetch learning portal data.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Network Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningData();
  }, [currentUser]);

  // Generate AI Recommendations
  const fetchAiRecommendations = async () => {
    if (!currentUser?.id) return;
    try {
      setLoadingAi(true);
      const res = await fetch("/api/learning/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: currentUser.id })
      });
      if (res.ok) {
        const data = await res.json();
        setAiRecs(data);
      }
    } catch (err) {
      console.error("Failed fetching AI suggestions", err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchAiRecommendations();
    }
  }, [currentUser]);

  // Compute stats for current active user
  const currentEmpData = useMemo(() => {
    return employees.find(e => e.id === currentUser?.id) || employees[0];
  }, [employees, currentUser]);

  // Calculated learning profile points
  const learningProfile = useMemo(() => {
    if (!currentEmpData) return { points: 100, badges: [] as string[] };
    
    // Base 100
    let points = 100;
    const badges: string[] = [];

    // Points from certifications
    points += (currentEmpData.certifications?.length || 0) * 150;
    
    // Points from completed enrollments
    const userEnrollments = enrollments.filter(e => e.employeeId === currentEmpData.id);
    const completedCount = userEnrollments.filter(e => e.status === "Completed").length;
    points += completedCount * 200;

    // Points from assessments
    const userAssessments = assessmentsData.filter(a => a.employeeId === currentEmpData.id);
    const passedCount = userAssessments.filter(a => a.passed).length;
    points += passedCount * 100;

    // Active mentor or mentee award
    const isMentor = mentorships.some(m => m.mentorId === currentEmpData.id);
    const isMentee = mentorships.some(m => m.menteeId === currentEmpData.id);
    if (isMentor) {
      points += 250;
      badges.push("Leadership Advisor");
    }
    if (isMentee) {
      points += 100;
      badges.push("Growth Seeker");
    }

    // Awards/Badges allocation
    if (completedCount >= 1) badges.push("Knowledge Catalyst");
    if (passedCount >= 1) badges.push("Assessment Scholar");
    if (points >= 500) badges.push("Elite Learner");

    // Pull from standard list
    if (currentEmpData.certifications?.includes("Compliance Champion") || userAssessments.some(a => a.passed && a.title.includes("Labour"))) {
      badges.push("Compliance Champion");
    }
    if (userAssessments.some(a => a.passed && a.title.includes("React") || a.title.includes("Architecture"))) {
      badges.push("System Architect");
    }

    // De-duplicate badges
    const uniqueBadges = Array.from(new Set(badges));

    return {
      points,
      badges: uniqueBadges,
      completedCount,
      enrolledCount: userEnrollments.length,
      passedCount
    };
  }, [currentEmpData, enrollments, assessmentsData, mentorships]);

  // Global Learning Leaderboard
  const leaderboard = useMemo(() => {
    return employees.map(emp => {
      let score = 100;
      score += (emp.certifications?.length || 0) * 150;
      
      const userEnrollments = enrollments.filter(e => e.employeeId === emp.id);
      const completedCount = userEnrollments.filter(e => e.status === "Completed").length;
      score += completedCount * 200;

      const userAssessments = assessmentsData.filter(a => a.employeeId === emp.id);
      const passedCount = userAssessments.filter(a => a.passed).length;
      score += passedCount * 100;

      const isMentor = mentorships.some(m => m.mentorId === emp.id);
      if (isMentor) score += 250;

      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        avatar: emp.avatar,
        department: emp.department,
        points: score
      };
    }).sort((a, b) => b.points - a.points);
  }, [employees, enrollments, assessmentsData, mentorships]);

  // Course Enrollment Handler
  const handleEnroll = async (courseId: string) => {
    if (!currentUser?.id) return;
    try {
      const res = await fetch("/api/learning/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: currentUser.id, courseId })
      });
      if (res.ok) {
        await fetchLearningData();
        onUpdateEmployee?.();
        alert("Enrolled successfully! You can now track your progress and complete lessons.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate studying lessons (Increments progress by 25%)
  const handleStudy = async (courseId: string) => {
    if (!currentUser?.id) return;
    const currentEnroll = enrollments.find(e => e.employeeId === currentUser.id && e.courseId === courseId);
    if (!currentEnroll) return;

    const newProgress = Math.min(100, currentEnroll.progress + 25);
    try {
      const res = await fetch("/api/learning/course-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: currentUser.id,
          courseId,
          progress: newProgress
        })
      });
      if (res.ok) {
        await fetchLearningData();
        onUpdateEmployee?.();
        if (newProgress === 100) {
          alert(`Congratulations! You completed the course. A professional certification has been added to your profile.`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Log External Certification
  const handleLogCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id || !certForm.name) return;

    try {
      setIsSubmittingCert(true);
      const res = await fetch("/api/learning/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: currentUser.id,
          name: `${certForm.name} (${certForm.issuer}, ${certForm.year})`
        })
      });

      if (res.ok) {
        setCertForm({ name: "", issuer: "", year: "" });
        await fetchLearningData();
        onUpdateEmployee?.();
        alert("Certification successfully logged and integrated with your 360° Profile!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCert(false);
    }
  };

  // Request Mentor Match
  const handleRequestMentor = async (mentorId: string) => {
    if (!currentUser?.id) return;
    try {
      setIsMatchingMentor(true);
      const res = await fetch("/api/learning/mentorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId,
          menteeId: currentUser.id
        })
      });
      if (res.ok) {
        await fetchLearningData();
        onUpdateEmployee?.();
        alert("Mentorship matches confirmed. Welcome aboard!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMatchingMentor(false);
    }
  };

  // Assessment Quiz Initiator
  const startQuiz = (key: "compliance" | "technical") => {
    setSelectedQuizKey(key);
    setQuizProgress({
      currentQuestionIndex: 0,
      answers: {},
      submitted: false,
      score: 0,
      passed: false
    });
  };

  // Handle option click in quiz
  const selectOption = (optionIndex: number) => {
    if (!quizProgress || quizProgress.submitted) return;
    setQuizProgress(prev => {
      if (!prev) return null;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [prev.currentQuestionIndex]: optionIndex
        }
      };
    });
  };

  // Submit assessment quiz
  const submitQuiz = async () => {
    if (!quizProgress || !selectedQuizKey || !currentUser?.id) return;
    const bank = assessmentBanks[selectedQuizKey];
    
    // Calculate score
    let correctCount = 0;
    bank.questions.forEach((q, index) => {
      if (quizProgress.answers[index] === q.answer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / bank.questions.length) * 100);
    const passed = finalScore >= 80;

    try {
      const res = await fetch("/api/learning/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: currentUser.id,
          assessmentId: `ASM-${selectedQuizKey.toUpperCase()}`,
          title: bank.title,
          score: finalScore,
          passed,
          newSkill: passed ? bank.skillAwarded : undefined
        })
      });

      if (res.ok) {
        setQuizProgress(prev => {
          if (!prev) return null;
          return {
            ...prev,
            submitted: true,
            score: finalScore,
            passed
          };
        });
        await fetchLearningData();
        onUpdateEmployee?.();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Available Mentors filtering (Exclude current user and only select senior staff)
  const availableMentors = useMemo(() => {
    return employees.filter(emp => {
      if (emp.id === currentUser?.id) return false;
      const isSenior = emp.role.includes("CEO") || 
                       emp.role.includes("Director") || 
                       emp.role.includes("Architect") || 
                       emp.role.includes("Head") || 
                       emp.role.includes("Manager");
      return isSenior;
    });
  }, [employees, currentUser]);

  // Compute Active Mentorship Pairing for User
  const myMentorshipRelation = useMemo(() => {
    if (!currentUser?.id) return null;
    return mentorships.find(m => m.mentorId === currentUser.id || m.menteeId === currentUser.id);
  }, [mentorships, currentUser]);

  // Competency Graph Mapping Data (Actual skills vs required)
  const competencyGraphData = useMemo(() => {
    if (!currentEmpData) return [];

    const isEng = currentEmpData.department === "Engineering";
    const isHr = currentEmpData.department === "Human Resources";

    if (isEng) {
      return [
        { subject: "Technical Architecture", Actual: 85, Required: 90 },
        { subject: "State Orchestration", Actual: currentEmpData.skills.includes("State Orchestration") ? 90 : 40, Required: 85 },
        { subject: "Security & Encryption", Actual: currentEmpData.skills.includes("Enterprise System Security") ? 80 : 35, Required: 80 },
        { subject: "Communication", Actual: 75, Required: 80 },
        { subject: "Agile Planning", Actual: 80, Required: 85 },
        { subject: "Labour Compliance", Actual: currentEmpData.skills.includes("Labour Law Standards") ? 90 : 30, Required: 60 }
      ];
    } else if (isHr) {
      return [
        { subject: "Bangladesh Labour Act", Actual: currentEmpData.skills.includes("Bangladesh Labour Act") || currentEmpData.skills.includes("Labour Law Standards") ? 95 : 60, Required: 90 },
        { subject: "Strategic Compensation", Actual: 85, Required: 85 },
        { subject: "Talent Acquisition", Actual: 90, Required: 85 },
        { subject: "Conflict Mitigation", Actual: 80, Required: 85 },
        { subject: "System Security & RBAC", Actual: currentEmpData.skills.includes("Enterprise System Security") ? 80 : 25, Required: 70 },
        { subject: "Leadership Index", Actual: 85, Required: 90 }
      ];
    } else {
      return [
        { subject: "Business Planning", Actual: 95, Required: 90 },
        { subject: "Governance", Actual: 90, Required: 90 },
        { subject: "Financial Strategy", Actual: 85, Required: 90 },
        { subject: "Conflict Management", Actual: 90, Required: 85 },
        { subject: "HR Compliance", Actual: 95, Required: 90 },
        { subject: "Technical Awareness", Actual: 80, Required: 85 }
      ];
    }
  }, [currentEmpData]);

  // Career Stages Roadmaps Setup
  const careerStages = useMemo(() => {
    if (!currentEmpData) return [];

    const isEng = currentEmpData.department === "Engineering";
    const isHr = currentEmpData.department === "Human Resources";

    if (isEng) {
      return [
        { title: "Associate Developer", req: "React Fundamentals, Git basics", active: false },
        { title: "Full Stack Engineer", req: "Node Optimization, State Orchestration", active: currentEmpData.role.includes("Full Stack") },
        { title: "Team Lead Developer", req: "Technical Mentoring, Architecture Scopes", active: currentEmpData.role.includes("Team Lead") },
        { title: "Lead Software Architect", req: "Enterprise System Security, Event Sourcing", active: currentEmpData.role.includes("Architect") },
        { title: "Chief Technology Officer (CTO)", req: "Strategic Scaling, Board Governance", active: false }
      ];
    } else if (isHr) {
      return [
        { title: "HR Executive", req: "Sourcing Pipelines, ATS", active: currentEmpData.role.includes("Executive") },
        { title: "Asst HR Manager", req: "Workday operations, Employee Engagement", active: currentEmpData.role.includes("Asst Manager") },
        { title: "HR Manager", req: "Strategic Compensation, Conflict Mitigation", active: currentEmpData.role.includes("Manager") },
        { title: "HR Director", req: "Labour Law Standards, Executive Coaching", active: currentEmpData.role.includes("Director") },
        { title: "Chief People Officer (CPO)", req: "Board Succession Metrics, Attrition AI modeling", active: false }
      ];
    } else {
      return [
        { title: "Associate Manager", req: "Unit Management, Reporting", active: false },
        { title: "Department Lead", req: "Team Performance indicators, BDT Ledgering", active: currentEmpData.role.includes("Head") },
        { title: "Director", req: "Strategic Scaling, Bangladesh labour policies", active: false },
        { title: "CEO & Managing Director", req: "Board Governance, VC funding", active: currentEmpData.role.includes("CEO") }
      ];
    }
  }, [currentEmpData]);

  // Promotion Readiness Index calculations
  const promotionReadiness = useMemo(() => {
    if (!currentEmpData) return 50;
    
    let baseScore = 40;
    
    // Performance score (max 25)
    baseScore += currentEmpData.performanceRating * 5;
    
    // Skills matching (max 20)
    baseScore += Math.min(20, currentEmpData.skills.length * 4);
    
    // Certification count (max 15)
    baseScore += Math.min(15, currentEmpData.certifications.length * 5);

    // Enrollments completion bonuses
    const completionsCount = enrollments.filter(e => e.employeeId === currentEmpData.id && e.status === "Completed").length;
    baseScore += Math.min(15, completionsCount * 5);

    return Math.min(100, baseScore);
  }, [currentEmpData, enrollments]);

  // Catalog filtered list
  const filteredCatalog = useMemo(() => {
    return courses.filter(c => {
      if (searchCatalog === "") return true;
      return c.title.toLowerCase().includes(searchCatalog.toLowerCase()) || 
             c.category.toLowerCase().includes(searchCatalog.toLowerCase()) ||
             c.provider.toLowerCase().includes(searchCatalog.toLowerCase());
    });
  }, [courses, searchCatalog]);

  return (
    <div id="learning-development-module" className="flex-1 flex overflow-hidden bg-transparent">
      
      {/* Learning Portal Sidebar (Left) */}
      <div className="w-80 flex flex-col p-6 overflow-y-auto border-r border-slate-200/60 bg-white/70 backdrop-blur-md">
        <div className="mb-6">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 bg-emerald-100/70 px-2.5 py-1 rounded-md uppercase">
            Workforce Portal
          </span>
          <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight mt-3">
            L&D Academy
          </h2>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Upskill your staff, design specialized timelines, test corporate knowledge, and match with advisors.
          </p>
        </div>

        {/* Sub-Tabs Nav */}
        <div className="flex flex-col gap-1.5">
          <button
            id="ld-center-tab"
            onClick={() => setActiveSubTab("center")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between ${
              activeSubTab === "center"
                ? "bg-emerald-900 text-white shadow-md shadow-emerald-900/10"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4" />
              <span>Development Center</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </button>

          <button
            id="ld-paths-tab"
            onClick={() => {
              setActiveSubTab("paths");
              fetchAiRecommendations();
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between ${
              activeSubTab === "paths"
                ? "bg-emerald-900 text-white shadow-md shadow-emerald-900/10"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4" />
              <span>Personalized Pathways</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </button>

          <button
            id="ld-assessments-tab"
            onClick={() => setActiveSubTab("assessments")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between ${
              activeSubTab === "assessments"
                ? "bg-emerald-900 text-white shadow-md shadow-emerald-900/10"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Brain className="w-4 h-4" />
              <span>Skill Assessments</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </button>

          <button
            id="ld-mentorship-tab"
            onClick={() => setActiveSubTab("mentorship")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between ${
              activeSubTab === "mentorship"
                ? "bg-emerald-900 text-white shadow-md shadow-emerald-900/10"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Mentorship Hub</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </button>

          <button
            id="ld-certifications-tab"
            onClick={() => setActiveSubTab("certifications")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between ${
              activeSubTab === "certifications"
                ? "bg-emerald-900 text-white shadow-md shadow-emerald-900/10"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4" />
              <span>Certifications & Forms</span>
            </div>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </button>
        </div>

        {/* User Quick Profile Panel in Sidebar */}
        <div className="mt-auto border-t border-slate-200/60 pt-6">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={currentEmpData?.avatar}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 block truncate leading-tight">
                  {currentEmpData?.name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate leading-none mt-1">
                  {currentEmpData?.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
              <div className="bg-white/80 border border-slate-100 p-2 rounded-lg text-center">
                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">Points</span>
                <span className="text-sm font-extrabold text-emerald-800 font-mono">
                  {learningProfile.points}
                </span>
              </div>
              <div className="bg-white/80 border border-slate-100 p-2 rounded-lg text-center">
                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">Badges</span>
                <span className="text-sm font-extrabold text-indigo-800 font-mono">
                  {learningProfile.badges.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Learning Workspace Container */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto bg-slate-50/40">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Re-indexing academy directories...</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* TAB 1: Development Center */}
            {activeSubTab === "center" && (
              <div className="space-y-6">
                
                {/* Greetings Header Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                      My Development Center
                    </h3>
                    <p className="text-xs text-slate-400">
                      Track ongoing classes, look at the employee leaderboard, and start studying courses.
                    </p>
                  </div>

                  {/* Badges strip */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {learningProfile.badges.map(b => (
                      <span
                        key={b}
                        className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Award className="w-3 h-3 text-emerald-600 shrink-0" />
                        {b}
                      </span>
                    ))}
                    {learningProfile.badges.length === 0 && (
                      <span className="text-slate-400 text-[10px] font-mono bg-slate-100 border border-dashed border-slate-200 px-3 py-1 rounded-full">
                        Take an assessment or complete a course to earn badges!
                      </span>
                    )}
                  </div>
                </div>

                {/* Performance Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bento-card p-5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Completed Courses</span>
                    <span className="text-3xl font-extrabold text-slate-800 mt-1 block">{learningProfile.completedCount}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Course credits earned
                    </span>
                  </div>

                  <div className="bento-card p-5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">In-Progress Studies</span>
                    <span className="text-3xl font-extrabold text-slate-800 mt-1 block">
                      {enrollments.filter(e => e.employeeId === currentEmpData?.id && e.status === "In Progress" || e.status === "Enrolled").length}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-2 font-medium">
                      <Clock className="w-3.5 h-3.5" /> Active study sessions
                    </span>
                  </div>

                  <div className="bento-card p-5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Assessments Passed</span>
                    <span className="text-3xl font-extrabold text-slate-800 mt-1 block">{learningProfile.passedCount}</span>
                    <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5 mt-2">
                      <Zap className="w-3.5 h-3.5" /> Technical badges unlocked
                    </span>
                  </div>

                  <div className="bento-card p-5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Global Leaderboard Rank</span>
                    <span className="text-3xl font-extrabold text-amber-600 font-mono mt-1 block">
                      #{leaderboard.findIndex(l => l.id === currentEmpData?.id) + 1}
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 mt-2">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" /> Top {Math.round(((leaderboard.findIndex(l => l.id === currentEmpData?.id) + 1) / employees.length) * 100)}% of company
                    </span>
                  </div>
                </div>

                {/* Study & Leaderboard row split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Current Active Studies */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <BookMarked className="w-4 h-4 text-emerald-600" />
                        My Enrolled Classes
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {enrollments.filter(e => e.employeeId === currentEmpData?.id).length === 0 ? (
                        <div className="bento-card p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                          <BookOpen className="w-8 h-8 text-slate-300" />
                          <span>No classes enrolled yet! Enroll in standard courses below to get started.</span>
                        </div>
                      ) : (
                        enrollments.filter(e => e.employeeId === currentEmpData?.id).map(enroll => {
                          const courseObj = courses.find(c => c.id === enroll.courseId);
                          if (!courseObj) return null;
                          return (
                            <div key={enroll.courseId} className="bento-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-12 rounded-md bg-gradient-to-b ${courseObj.coverColor}`} />
                                <div>
                                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{courseObj.category}</span>
                                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{courseObj.title}</span>
                                  <span className="text-[10px] text-slate-400 block font-medium">Provider: {courseObj.provider}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="flex flex-col items-end">
                                  <span className="text-[10px] font-mono font-bold text-slate-600">{enroll.progress}% Progress</span>
                                  <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden border border-slate-200/50">
                                    <div
                                      className="bg-emerald-600 h-full transition-all duration-300"
                                      style={{ width: `${enroll.progress}%` }}
                                    />
                                  </div>
                                </div>

                                {enroll.progress < 100 ? (
                                  <button
                                    onClick={() => handleStudy(enroll.courseId)}
                                    className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1 shrink-0"
                                  >
                                    Study Lesson
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <span className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shrink-0">
                                    Completed
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Leaderboard panel */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      Academy Leaderboard
                    </h4>

                    <div className="bento-card p-4 space-y-3.5 max-h-[350px] overflow-y-auto">
                      {leaderboard.slice(0, 5).map((l, index) => (
                        <div key={l.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-5 text-center font-mono font-extrabold text-xs ${
                              index === 0 ? "text-amber-500" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-700" : "text-slate-400/70"
                            }`}>
                              {index + 1}
                            </span>
                            <img src={l.avatar} className="w-7 h-7 rounded-lg object-cover" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-800 block truncate leading-tight">
                                {l.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate leading-none mt-0.5">
                                {l.role}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            {l.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Course Catalog Search & List */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      Global Course Catalog
                    </h4>

                    {/* Catalog search bar */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchCatalog}
                        onChange={(e) => setSearchCatalog(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredCatalog.map(crs => {
                      const isEnrolled = enrollments.some(e => e.employeeId === currentEmpData?.id && e.courseId === crs.id);
                      return (
                        <div key={crs.id} className="bento-card overflow-hidden flex flex-col justify-between group hover:border-emerald-300 transition-all duration-200">
                          <div className={`h-2 bg-gradient-to-r ${crs.coverColor}`} />
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">{crs.category}</span>
                              <h5 className="font-bold text-xs text-slate-800 mt-1 leading-snug">{crs.title}</h5>
                              <p className="text-[10px] text-slate-400 mt-1 font-medium">By {crs.provider} • {crs.duration}</p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <span className="text-[10px] text-slate-400 font-bold font-mono">Rating: {crs.rating}/5.0</span>
                              
                              {isEnrolled ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                  Enrolled
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleEnroll(crs.id)}
                                  className="px-2.5 py-1 bg-emerald-900 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-1"
                                >
                                  Enroll Now
                                  <Plus className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: Personalized Pathways & Roadmaps */}
            {activeSubTab === "paths" && (
              <div className="space-y-6">
                
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                    Personalized Pathways & Career Roadmaps
                  </h3>
                  <p className="text-xs text-slate-400">
                    AI recommendation digests, promotion criteria metrics, and target competency comparison widgets.
                  </p>
                </div>

                {/* AI advisor and Readiness index split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left block: AI recommendations & current Roadmap */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* AI Recommender card */}
                    <div className="bento-card p-6 bg-radial from-emerald-50/50 to-white border-emerald-200/60 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Sparkles className="w-32 h-32 text-emerald-700" />
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">AI Professional Suggestion Digest</span>
                        {loadingAi && <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin ml-2" />}
                      </div>

                      <p className="text-slate-500 text-xs leading-relaxed mb-4">
                        Based on your current skills as a **{currentEmpData?.role}** in **{currentEmpData?.department}**, our Gemini HCM compiler has generated the following tactical course recommendations to accelerate your next organizational promotion cycle:
                      </p>

                      <div className="space-y-3">
                        {loadingAi ? (
                          <div className="py-8 text-center text-slate-400 text-xs">Generating deep corporate alignment recommendations...</div>
                        ) : aiRecs.length === 0 ? (
                          <div className="py-4 text-center text-slate-400 text-xs">
                            No active suggestions. Requesting AI recommended roadmap.
                          </div>
                        ) : (
                          aiRecs.map(rec => (
                            <div key={rec.id} className="bg-white/90 border border-slate-100 p-3.5 rounded-xl hover:border-emerald-200/80 transition-all duration-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] bg-slate-100 font-mono font-bold text-slate-500 px-1.5 py-0.5 rounded">
                                    {rec.category}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-semibold">{rec.duration}</span>
                                </div>
                                <h5 className="font-bold text-xs text-slate-800 mt-1">{rec.title}</h5>
                                <p className="text-[10px] text-slate-500 leading-snug mt-0.5 font-medium">{rec.description}</p>
                              </div>

                              <button
                                onClick={() => {
                                  // Create custom Course in local list if not exist, and enroll!
                                  const exists = courses.find(c => c.title === rec.title);
                                  const cId = exists ? exists.id : `CRS-${Math.floor(Math.random() * 1000)}`;
                                  if (!exists) {
                                    setCourses(prev => [...prev, {
                                      id: cId,
                                      title: rec.title,
                                      provider: rec.provider,
                                      duration: rec.duration,
                                      category: rec.category,
                                      enrolledCount: 1,
                                      rating: 4.8,
                                      coverColor: "from-purple-500 to-indigo-600"
                                    }]);
                                  }
                                  handleEnroll(cId);
                                }}
                                className="bg-emerald-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-emerald-800 transition-colors shrink-0 flex items-center gap-1 self-end sm:self-auto"
                              >
                                Study Now
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Interactive timeline roadmap */}
                    <div className="bento-card p-6 space-y-4">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        Interactive Career Timeline
                      </h4>

                      <div className="relative pl-6 border-l border-dashed border-slate-200 space-y-5">
                        {careerStages.map((stage, sIdx) => (
                          <div key={stage.title} className="relative">
                            
                            {/* Marker dot */}
                            <div className={`absolute -left-[31px] w-2.5 h-2.5 rounded-full border-2 ${
                              stage.active 
                                ? "bg-emerald-600 border-white ring-4 ring-emerald-100" 
                                : "bg-slate-300 border-white"
                            }`} />

                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${stage.active ? 'text-emerald-800 font-extrabold' : 'text-slate-700'}`}>
                                  {stage.title}
                                </span>
                                {stage.active && (
                                  <span className="bg-emerald-100/70 border border-emerald-200/50 text-emerald-800 text-[8px] px-1.5 rounded font-bold uppercase tracking-wider font-mono">
                                    Current Rank
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 mt-0.5 block leading-relaxed">
                                Required Milestones: <span className="font-mono text-slate-500 font-medium">{stage.req}</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Right block: Promotion Readiness & Competency radar chart */}
                  <div className="space-y-6">
                    
                    {/* Promotion Readiness dial */}
                    <div className="bento-card p-5 flex flex-col justify-between items-center text-center space-y-4">
                      <div className="w-full text-left">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Promotion Readiness Index</span>
                      </div>

                      <div className="relative flex items-center justify-center">
                        {/* Circle dial */}
                        <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center relative">
                          <div className="text-center">
                            <span className="text-3xl font-extrabold text-slate-800 font-mono leading-none">{promotionReadiness}%</span>
                            <span className="text-[9px] text-slate-400 block uppercase font-mono font-bold tracking-wider mt-1">Compiled Score</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {promotionReadiness >= 85 ? (
                          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200/50 px-3 py-1.5 rounded-xl text-[10px] font-bold">
                            Excellent! Ready for next executive review.
                          </div>
                        ) : promotionReadiness >= 65 ? (
                          <div className="bg-amber-50 text-amber-800 border border-amber-200/50 px-3 py-1.5 rounded-xl text-[10px] font-bold">
                            On Track. Pass more assessments to reach 85%.
                          </div>
                        ) : (
                          <div className="bg-slate-50 text-slate-600 border border-slate-200/50 px-3 py-1.5 rounded-xl text-[10px] font-medium">
                            Developing. Take courses and log certificates.
                          </div>
                        )}
                      </div>

                      <div className="w-full text-left text-[10px] space-y-2 pt-3 border-t border-slate-100">
                        <span className="font-mono font-bold text-slate-400 uppercase block">Readiness breakdown:</span>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Performance rating bonus:</span>
                          <span className="font-bold text-slate-800">{currentEmpData?.performanceRating * 5}/25</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Skills credentials tally:</span>
                          <span className="font-bold text-slate-800">{Math.min(20, currentEmpData?.skills.length * 4)}/20</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Logged Certifications score:</span>
                          <span className="font-bold text-slate-800">{Math.min(15, currentEmpData?.certifications.length * 5)}/15</span>
                        </div>
                      </div>
                    </div>

                    {/* Radar chart mapping */}
                    <div className="bento-card p-5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-4">Core Competency Analysis</span>
                      <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={competencyGraphData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                            <Radar name="Actual" dataKey="Actual" stroke="#047857" fill="#047857" fillOpacity={0.3} />
                            <Radar name="Required" dataKey="Required" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: Skill Assessments */}
            {activeSubTab === "assessments" && (
              <div className="space-y-6">
                
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                    Skill Assessments & Diagnostic Center
                  </h3>
                  <p className="text-xs text-slate-400">
                    Prove your corporate and technical proficiency in structured topics and auto-update your employee 360 profile.
                  </p>
                </div>

                {/* Sub split: list of assessments vs active test interface */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left block: assessment selectors */}
                  <div className="lg:col-span-1 flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-emerald-600" />
                      Available Topics
                    </h4>

                    {Object.entries(assessmentBanks).map(([key, bank]) => {
                      const completedRec = assessmentsData.find(a => a.employeeId === currentEmpData?.id && a.assessmentId === `ASM-${key.toUpperCase()}`);
                      const isCompliance = key === "compliance";

                      return (
                        <div
                          key={key}
                          className={`bento-card p-5 space-y-4 flex flex-col justify-between border hover:border-emerald-300 transition-colors ${
                            selectedQuizKey === key ? "border-emerald-500 ring-2 ring-emerald-500/10" : ""
                          }`}
                        >
                          <div>
                            <span className="text-[9px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase font-semibold">
                              {isCompliance ? "Labour & HR Law" : "Technical Engineering"}
                            </span>
                            <h5 className="font-bold text-xs text-slate-800 mt-2">{bank.title}</h5>
                            <p className="text-[10px] text-slate-400 mt-1">Pass rate required: 80% • Rewards: +100 Points, &apos;{bank.badge}&apos; Badge</p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            {completedRec ? (
                              <div className="flex flex-col">
                                <span className={`text-[10px] font-bold font-mono ${completedRec.passed ? 'text-emerald-700' : 'text-rose-600'}`}>
                                  Score: {completedRec.score}% ({completedRec.passed ? "PASSED" : "FAILED"})
                                </span>
                                <span className="text-[8px] text-slate-400">Attempted {completedRec.completedAt}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">Not yet attempted</span>
                            )}

                            <button
                              id={`start-quiz-btn-${key}`}
                              onClick={() => startQuiz(key as "compliance" | "technical")}
                              className="px-3 py-1.5 bg-emerald-900 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-800 transition-colors"
                            >
                              {completedRec ? "Re-Take Assessment" : "Start Test"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right block: Quiz Workspace */}
                  <div className="lg:col-span-2">
                    {quizProgress && selectedQuizKey ? (
                      <div className="bento-card p-6 space-y-6">
                        {/* Heading */}
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Assessment Sandbox</span>
                            <h4 className="text-sm font-bold text-slate-800 mt-0.5">{assessmentBanks[selectedQuizKey].title}</h4>
                          </div>

                          {!quizProgress.submitted && (
                            <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                              Question {quizProgress.currentQuestionIndex + 1} of {assessmentBanks[selectedQuizKey].questions.length}
                            </span>
                          )}
                        </div>

                        {/* Quiz Workspace itself */}
                        {!quizProgress.submitted ? (
                          <div className="space-y-6">
                            {/* Question text */}
                            <p className="text-xs font-bold text-slate-800 leading-relaxed">
                              {assessmentBanks[selectedQuizKey].questions[quizProgress.currentQuestionIndex].q}
                            </p>

                            {/* Options list */}
                            <div className="flex flex-col gap-2.5">
                              {assessmentBanks[selectedQuizKey].questions[quizProgress.currentQuestionIndex].options.map((opt, oIdx) => {
                                const isSelected = quizProgress.answers[quizProgress.currentQuestionIndex] === oIdx;
                                return (
                                  <button
                                    key={oIdx}
                                    onClick={() => selectOption(oIdx)}
                                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all duration-150 ${
                                      isSelected 
                                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold shadow-xs" 
                                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold ${
                                        isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-400 border-slate-200'
                                      }`}>
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      {opt}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Actions footer */}
                            <div className="flex justify-between pt-4 border-t border-slate-100">
                              <button
                                disabled={quizProgress.currentQuestionIndex === 0}
                                onClick={() => setQuizProgress(prev => prev ? { ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1 } : null)}
                                className="px-3 py-1.5 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-50 disabled:opacity-40"
                              >
                                Previous
                              </button>

                              {quizProgress.currentQuestionIndex < assessmentBanks[selectedQuizKey].questions.length - 1 ? (
                                <button
                                  disabled={quizProgress.answers[quizProgress.currentQuestionIndex] === undefined}
                                  onClick={() => setQuizProgress(prev => prev ? { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 } : null)}
                                  className="px-3 py-1.5 bg-emerald-900 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-800 disabled:opacity-50"
                                >
                                  Next Question
                                </button>
                              ) : (
                                <button
                                  id="submit-quiz-btn"
                                  disabled={Object.keys(quizProgress.answers).length < assessmentBanks[selectedQuizKey].questions.length}
                                  onClick={submitQuiz}
                                  className="px-4 py-1.5 bg-indigo-900 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-800 disabled:opacity-50"
                                >
                                  Submit Answers
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          // Quiz Submitted Results screen
                          <div className="text-center py-6 space-y-5 flex flex-col items-center">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                              quizProgress.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {quizProgress.passed ? <CheckCircle2 className="w-8 h-8" /> : <HelpCircle className="w-8 h-8" />}
                            </div>

                            <div className="space-y-1">
                              <h5 className="font-extrabold text-sm text-slate-800">
                                {quizProgress.passed ? "Assessment Passed!" : "Assessment Failed"}
                              </h5>
                              <p className="text-xs text-slate-400 font-medium">You scored a total of <span className="font-mono font-bold text-slate-700">{quizProgress.score}%</span></p>
                            </div>

                            <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed">
                              {quizProgress.passed 
                                ? `Awesome! You have demonstrated high mastery. The skill '${assessmentBanks[selectedQuizKey].skillAwarded}' has been successfully credited directly to your 360 profile, and you unlocked the badge '${assessmentBanks[selectedQuizKey].badge}'!`
                                : "You did not achieve the required passing score of 80%. Please review our global catalog of courses and re-attempt whenever you feel prepared."}
                            </p>

                            <button
                              onClick={() => setQuizProgress(null)}
                              className="px-4 py-1.5 bg-emerald-900 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-800 transition-colors"
                            >
                              Finish & Review Topics
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bento-card p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2 min-h-[300px]">
                        <Compass className="w-10 h-10 text-slate-300 animate-bounce" />
                        <span className="font-semibold block text-slate-500">Diagnostic Sandbox Idle</span>
                        <span>Select a diagnostic test topic from the left sidebar panel to begin your live assessment.</span>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* TAB 4: Mentorship Hub */}
            {activeSubTab === "mentorship" && (
              <div className="space-y-6">
                
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                    Mentorship Hub & Advisory Center
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect with senior organizational leaders for feedback sessions, guidance workshops, and goal matching.
                  </p>
                </div>

                {/* Subsplit: My Mentor Pair vs Requesting a new Match */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left block: Current Pairing state */}
                  <div className="lg:col-span-1 space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      My Active Connections
                    </h4>

                    {myMentorshipRelation ? (
                      <div className="bento-card p-5 space-y-4">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase font-semibold">
                            ACTIVE PAIRING
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1">Matched on {myMentorshipRelation.startDate}</span>
                        </div>

                        {/* Detail */}
                        <div className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold font-mono">
                            {myMentorshipRelation.mentorId === currentUser?.id ? "MTR" : "MTE"}
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                              {myMentorshipRelation.mentorId === currentUser?.id ? "Your Mentee" : "Your Mentor"}
                            </span>
                            <span className="text-xs font-bold text-slate-800 block">
                              {myMentorshipRelation.mentorId === currentUser?.id ? myMentorshipRelation.menteeName : myMentorshipRelation.mentorName}
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 leading-normal font-medium">
                          Schedule weekly 1-on-1 career touchpoints to discuss promotion indexes and skill alignment goals.
                        </p>
                      </div>
                    ) : (
                      <div className="bento-card p-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                        <Users className="w-8 h-8 text-slate-300" />
                        <span>You are not currently linked in an active mentorship program. Request matching below to begin!</span>
                      </div>
                    )}

                    {/* Mentorship rules */}
                    <div className="bento-card p-4 space-y-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Hub Guidelines:</span>
                      <ul className="text-[10px] text-slate-500 space-y-1.5 list-disc pl-3">
                        <li>Senior leaders review mentee performance profiles.</li>
                        <li>Completing a mentorship pairing awards **+250 points** to the mentor and **+100 points** to the mentee.</li>
                        <li>Recommended touchpoints: minimum once every fortnight.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Right block: Available advisors to match */}
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-600" />
                      Find an Advisory Mentor
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableMentors.map(mentor => {
                        const isPaired = mentorships.some(m => m.mentorId === mentor.id && m.menteeId === currentUser?.id);
                        return (
                          <div key={mentor.id} className="bento-card p-4 flex flex-col justify-between hover:border-emerald-300 transition-colors">
                            <div className="flex gap-3">
                              <img src={mentor.avatar} className="w-10 h-10 rounded-xl object-cover" />
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-slate-800 block truncate leading-tight">{mentor.name}</span>
                                <span className="text-[10px] text-slate-400 block truncate mt-0.5">{mentor.role}</span>
                                <span className="text-[9px] text-emerald-700 font-mono block mt-1">{mentor.department}</span>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                                Skills: {mentor.skills.slice(0, 2).join(", ")}
                              </span>

                              {isPaired ? (
                                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-150">
                                  Matched
                                </span>
                              ) : (
                                <button
                                  id={`match-btn-${mentor.id}`}
                                  disabled={isMatchingMentor || myMentorshipRelation !== null}
                                  onClick={() => handleRequestMentor(mentor.id)}
                                  className="px-2.5 py-1.5 bg-emerald-900 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-800 disabled:opacity-40"
                                >
                                  Request Match
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 5: Certifications Tracker */}
            {activeSubTab === "certifications" && (
              <div className="space-y-6">
                
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                    Certifications & Forms Ledger
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add external credentials, track expiring certifications, and review upcoming webinars.
                  </p>
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left block: Log new certification form */}
                  <div className="lg:col-span-1">
                    <div className="bento-card p-5 space-y-4">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-600" />
                        Log Professional Credential
                      </h4>

                      <form onSubmit={handleLogCert} className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold uppercase text-[9px] block">Certification Name</label>
                          <input
                            type="text"
                            placeholder="e.g. AWS Certified Developer Associate"
                            required
                            value={certForm.name}
                            onChange={(e) => setCertForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold uppercase text-[9px] block">Issuing Authority</label>
                          <input
                            type="text"
                            placeholder="e.g. Amazon Web Services (AWS)"
                            required
                            value={certForm.issuer}
                            onChange={(e) => setCertForm(prev => ({ ...prev, issuer: e.target.value }))}
                            className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold uppercase text-[9px] block">Year Achieved</label>
                          <input
                            type="number"
                            placeholder="e.g. 2026"
                            min="2010"
                            max="2030"
                            required
                            value={certForm.year}
                            onChange={(e) => setCertForm(prev => ({ ...prev, year: e.target.value }))}
                            className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <button
                          id="submit-cert-btn"
                          type="submit"
                          disabled={isSubmittingCert}
                          className="w-full py-2 bg-emerald-900 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5"
                        >
                          {isSubmittingCert ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                          Log Certification
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right block: Logged credentials detail */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Active certificates table */}
                    <div className="bento-card p-5 space-y-4">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-600" />
                        My Registered Professional Credentials
                      </h4>

                      <div className="space-y-3">
                        {currentEmpData?.certifications?.length === 0 ? (
                          <div className="text-center py-10 text-slate-400 text-xs">
                            No active certifications registered yet. Log your achievements using the form.
                          </div>
                        ) : (
                          currentEmpData?.certifications?.map(cert => (
                            <div key={cert} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50/50 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                                  <Award className="w-5 h-5" />
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-slate-800 block">{cert}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">Verified Active Badge</span>
                                </div>
                              </div>

                              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md uppercase font-mono border border-emerald-100">
                                Verified
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Upcoming internal Trainings */}
                    <div className="bento-card p-5 space-y-4">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        Upcoming Internal Coaching webinars
                      </h4>

                      <div className="space-y-3.5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border border-dashed rounded-xl gap-3">
                          <div className="flex gap-2.5">
                            <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-indigo-700 font-bold font-mono uppercase block">WEBINAR • JULY 10, 2026</span>
                              <span className="text-xs font-bold text-slate-800 mt-0.5">Advanced HR compensation design frameworks</span>
                              <span className="text-[10px] text-slate-400 block font-medium">Speaker: Abrar Ishraq (HR Director)</span>
                            </div>
                          </div>

                          <button
                            onClick={() => alert("Successfully registered for upcoming webinar. A calendar invitation has been dispatched to your WorkForceHub address.")}
                            className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg hover:bg-emerald-100 transition-colors shrink-0"
                          >
                            Register
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border border-dashed rounded-xl gap-3">
                          <div className="flex gap-2.5">
                            <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-indigo-700 font-bold font-mono uppercase block">WORKSHOP • JULY 15, 2026</span>
                              <span className="text-xs font-bold text-slate-800 mt-0.5">Bangladesh Labour Act compliance updates for Tech Leads</span>
                              <span className="text-[10px] text-slate-400 block font-medium">Speaker: Abdullah Al Mamun (Legal Lead)</span>
                            </div>
                          </div>

                          <button
                            onClick={() => alert("Successfully registered for upcoming workshop. A calendar invitation has been dispatched to your WorkForceHub address.")}
                            className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg hover:bg-emerald-100 transition-colors shrink-0"
                          >
                            Register
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
