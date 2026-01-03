import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Code, 
  Cpu, 
  Layers, 
  Send, 
  MessageSquare, 
  X,
  ChevronRight,
  User,
  Terminal as TerminalIcon,
  Briefcase,
  Menu,
  Sparkles,
  Award,
  Calendar,
  Zap,
  Globe,
  ArrowUp,
  CheckCircle2,
  Terminal,
  Palette,
  Layout,
  Star,
  Quote,
  Command,
  Settings,
  Lock,
  Plus,
  Trash2,
  Save,
  RefreshCcw,
  Eye,
  LogOut,
  Upload,
  ImageIcon,
  Facebook,
  Youtube,
  Phone,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Target,
  Trophy,
  Database,
  Download,
  History,
  HardDrive,
  Wand2,
  Monitor,
  Smartphone,
  Copy,
  Image as ImageLucide,
  BarChart3,
  Clock,
  Inbox,
  KeyRound,
  Users,
  FileDown,
  MailCheck,
  Bot,
  BrainCircuit,
  Handshake,
  Lightbulb,
  Video,
  BookOpen,
  MousePointer2,
  Maximize2,
  Trash,
  Search,
  Key,
  Activity,
  GraduationCap,
  Rocket,
  ShieldAlert,
  ChevronDown,
  Filter,
  PlusCircle,
  Pencil,
  FileText,
  UserCog,
  Share2,
  Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useTransform as useMotionTransform, animate } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";

// --- Custom Icons ---
const TiktokIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
  </svg>
);

const ZaloIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M10 36.84C5.07 33.36 2 27.91 2 21.82 2 10.87 11.85 2 24 2s22 8.87 22 19.82-9.85 19.82-22 19.82c-2.88 0-5.61-.49-8.13-1.39L2 46l8-9.16z" fill="currentColor"/>
    <path d="M22 14h6v3h-6zM16 14h6v15h-6zM28 26h-6v-3h6zM23.8 20.5h4.4l-6.2 8.5H17.6l6.2-8.5z" fill="#020617"/>
  </svg>
);

// --- Database & Storage Utilities ---
const DB_NAME = 'PhuPortfolioDB';
const DB_VERSION = 1;
const STORE_NAME = 'siteData';

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(request.error);
  });
};

const saveToDB = async (key: string, data: any) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const getFromDB = async (key: string) => {
  const db = await initDB();
  return new Promise<any>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// --- Types & Constants ---
type Language = 'vi' | 'en';
type ThemeColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'vibe';

interface Project {
  id: string;
  title: string;
  desc: string;
  longDesc: string;
  tags: string[];
  cat: string;
  image?: string;
  link?: string;
  github?: string;
  highlights?: string[];
}

interface Course {
  id: string;
  name: string;
  level: string;
  duration: string;
  desc: string;
}

interface Skill {
  id: string;
  cat: string;
  icon: string;
  items: string[];
}

interface ChatLogEntry {
  sessionId: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface Registration {
  id: string;
  name: string;
  email: string;
  course: string;
  timestamp: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
}

interface SocialLinks {
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  zalo?: string;
  website?: string;
}

const THEMES: Record<ThemeColor, { primary: string, border: string, bg: string, text: string }> = {
  indigo: { primary: 'bg-indigo-600', border: 'border-indigo-500/20', bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
  emerald: { primary: 'bg-emerald-600', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  rose: { primary: 'bg-rose-600', border: 'border-rose-500/20', bg: 'bg-rose-500/10', text: 'text-rose-400' },
  amber: { primary: 'bg-amber-600', border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  vibe: { primary: 'bg-purple-600', border: 'border-purple-500/20', bg: 'bg-purple-500/10', text: 'text-purple-400' },
};

const THEME_COLORS: Record<ThemeColor, string> = {
  indigo: 'indigo',
  emerald: 'emerald',
  rose: 'rose',
  amber: 'amber',
  vibe: 'purple',
};

const DEFAULT_TRANSLATIONS = {
  vi: {
    nav: { home: 'Trang chủ', about: 'Hồ sơ', skills: 'Kỹ năng', projects: 'Dự án', lab: 'AI Lab', course: 'Academy', contact: 'Liên hệ' },
    hero: { badge: 'Sẵn sàng cho các cơ hội đột phá', titlePrefix: 'Kiến tạo', titleSuffix: 'Tương lai số.', bio: 'Tôi là Đồng Minh Phú, kiến trúc sư phần mềm chuyên nghiệp, tập trung vào xây dựng hệ thống hiệu năng cao và tích hợp AI thông minh.', explore: 'Xem các dự án' },
    about: { title: 'Hành trình & Năng lực', stats: { projects: 'Dự án hoàn thiện', lines: 'Dòng mã sạch', visits: 'Lượt truy cập' }, expTitle: '6+ NĂM', expDesc: 'Kỹ thuật hóa các giải pháp quy mô lớn.', role: 'Kiến trúc sư Phần mềm Cấp cao', bioExtended: 'Hành trình 6 năm qua đã giúp tôi xây dựng tư duy "Product-Engineering" - không chỉ viết code mà là giải quyết vấn đề kinh doanh.' },
    skills: { title: 'Hệ sinh thái Kỹ thuật', subtitle: 'Các công nghệ lõi tôi sử dụng để xây dựng hệ thống bền vững.' },
    projects: { title: 'Kho Lưu trữ Dự án', subtitle: 'Minh chứng cho sự xuất sắc về kỹ thuật và tư duy thẩm mỹ.', filters: { all: 'Tất cả', web: 'Ứng dụng Web', ai: 'AI/ML', arch: 'Kiến trúc' }, searchPlaceholder: 'Tìm dự án...', viewDetails: 'Chi tiết', liveDemo: 'Bản Demo', github: 'Mã nguồn', techStack: 'Công nghệ', highlights: 'Điểm nhấn', noResults: 'Không tìm thấy kết quả.' },
    ailab: { title: 'AI Innovation Lab', subtitle: 'Mô tả ý tưởng của bạn, và tôi sẽ kiến tạo bản demo ngay lập tức.', placeholder: 'Ví dụ: App quản lý tài chính tối giản...', button: 'Kiến tạo ngay', generating: 'Đang thiết kế...', result: 'Bản Demo AI' },
    course: { 
      title: 'Phú Academy', 
      subtitle: 'Nâng tầm tư duy lập trình và làm chủ kỷ nguyên AI.', 
      enroll: 'Đăng ký ngay', 
      success: 'Chúc mừng! Bạn đã ghi danh thành công.'
    },
    contact: { title: 'Bắt đầu ý tưởng', titleSuffix: 'mới cùng tôi?', labels: { name: 'Họ tên', email: 'Email', message: 'Nội dung', send: 'Gửi yêu cầu', success: 'Cảm ơn! Phú sẽ liên hệ lại sớm.' }, infoTitle: 'Thông tin' },
    chat: { welcome: "Xin chào! Tôi là Phú Digital. Bạn cần tư vấn về Vibe Coding hay kiến trúc hệ thống?", agent: "Phú AI v4.0", typing: "Đang nghĩ...", quickReplies: ["Vibe Coding", "Tư vấn kiến trúc", "Báo giá AI"] },
    terminal: { welcome: "PhúOS v1.1.0 Admin Console. Gõ 'help' để xem lệnh.", placeholder: "Lệnh..." },
    footer: { copyright: '© {year} ĐỒNG MINH PHÚ — VIBE CODING EDITION', live: 'Đang trực tuyến' }
  },
  en: {
    nav: { home: 'Home', about: 'Profile', skills: 'Skills', projects: 'Projects', lab: 'AI Lab', course: 'Academy', contact: 'Contact' },
    hero: { badge: 'Open for breakthrough opportunities', titlePrefix: 'Engineering the', titleSuffix: 'Digital Future.', bio: "I'm Đồng Minh Phú, a software architect dedicated to building high-performance systems and intelligent AI integrations.", explore: 'Explore Projects' },
    about: { title: 'Identity & Expertise', stats: { projects: 'Projects Delivered', lines: 'Lines of Code', visits: 'Total Visits' }, expTitle: '6+ YRS', expDesc: 'Architecting high-impact solutions.', role: 'Senior Software Architect', bioExtended: '6 years of building a "Product-Engineering" mindset - solving business problems with optimal technology.' },
    skills: { title: 'Technical Ecosystem', subtitle: 'The core stack I trust for building resilient systems.' },
    projects: { title: 'Project Repository', subtitle: 'Showcasing technical excellence and aesthetic precision.', filters: { all: 'All', web: 'Web Apps', ai: 'AI/ML', arch: 'Architecture' }, searchPlaceholder: 'Search projects...', viewDetails: 'View', liveDemo: 'Demo', github: 'Code', techStack: 'Stack', highlights: 'Highlights', noResults: 'No projects found.' },
    ailab: { title: 'AI Innovation Lab', subtitle: 'Describe your vision, and I will architect a live demo.', placeholder: 'e.g., Finance tracker app...', button: 'Start Engineering', generating: 'Architecting...', result: 'AI Result' },
    course: { 
      title: 'Phu Academy', 
      subtitle: 'Elevate your coding mindset and master the AI era.', 
      enroll: 'Enroll Now', 
      success: 'Congratulations! You have successfully enrolled.'
    },
    contact: { title: 'Let\'s build', titleSuffix: 'next big thing?', labels: { name: 'Full Name', email: 'Email', message: 'Message', send: 'Send Inquiry', success: 'Thank you! I will get back to you.' }, infoTitle: 'Contact' },
    chat: { welcome: "Hello! I'm Phú's AI. Interested in Vibe Coding or system architecture?", agent: "Phú AI v4.0", typing: "Analysing...", quickReplies: ["Vibe Coding", "Architecture", "AI Quote"] },
    terminal: { welcome: "PhúOS v1.1.0 Admin Console. Type 'help'.", placeholder: "Cmd..." },
    footer: { copyright: '© {year} PHU — VIBE EDITION', live: 'Live now' }
  }
};

const DEFAULT_SKILLS: Skill[] = [
  { id: '1', cat: 'Frontend Mastery', icon: 'Layout', items: ['React', 'Next.js', 'Tailwind', 'Framer Motion', 'TypeScript'] },
  { id: '2', cat: 'Backend Systems', icon: 'Cpu', items: ['Go', 'Rust', 'Node.js', 'PostgreSQL', 'Redis'] },
  { id: '3', cat: 'Cloud & DevOps', icon: 'Globe', items: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'] },
];

const DEFAULT_PROJECTS: Project[] = [
  { id: '1', title: 'Nexus Core Platform', desc: 'Kiến trúc Micro-services Fintech.', longDesc: 'Hệ thống cốt lõi xử lý hàng triệu giao dịch mỗi giây với độ trễ cực thấp.', tags: ['Go', 'gRPC', 'AWS'], cat: 'Architecture' },
  { id: '2', title: 'OmniAI Engine', desc: 'Dự đoán hành vi người dùng.', longDesc: 'Nền tảng phân tích dữ liệu lớn sử dụng TensorFlow để dự đoán xu hướng.', tags: ['Python', 'TensorFlow', 'React'], cat: 'AI/ML' },
];

const DEFAULT_COURSES: Course[] = [
  { id: 'vc1', name: 'Mastering Vibe Coding', level: 'Advanced', duration: '8 tuần', desc: 'Xây dựng ứng dụng cực nhanh với AI prompt engineering.' },
  { id: 'aa1', name: 'AI System Architecture', level: 'Expert', duration: '12 tuần', desc: 'Thiết kế hệ thống phân tán tích hợp các mô hình LLM.' }
];

const INITIAL_DATA = {
  translations: DEFAULT_TRANSLATIONS,
  skills: DEFAULT_SKILLS,
  projects: DEFAULT_PROJECTS,
  courses: DEFAULT_COURSES,
  contactInfo: { 
    email: 'phu@example.com', 
    phone: '090 000 0000', 
    address: 'Ho Chi Minh, VN',
    socials: {
      facebook: '',
      youtube: '',
      tiktok: '',
      zalo: '',
      website: ''
    } as SocialLinks
  },
  profileImage: null as string | null,
  inquiries: [] as Inquiry[],
  chatLogs: [] as ChatLogEntry[],
  registrations: [] as Registration[],
  adminPassword: 'admin',
  theme: 'indigo' as ThemeColor,
};

// --- Helper Components ---
const SectionHeading = ({ children, icon: Icon, subtitle, theme }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 md:mb-16 text-left">
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-3 md:p-4 rounded-2xl ${THEMES[theme as ThemeColor].bg} ${THEMES[theme as ThemeColor].text} border ${THEMES[theme as ThemeColor].border} shadow-xl`}>
        <Icon size={window.innerWidth < 768 ? 24 : 32} />
      </div>
      <h2 className="text-3xl md:text-5xl font-black tracking-tight">{children}</h2>
    </div>
    {subtitle && <p className="text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed font-medium">{subtitle}</p>}
  </motion.div>
);

const AnimatedCounter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
  const count = useMotionValue(0);
  const rounded = useMotionTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
};

// --- Main App ---
const App = () => {
  const [lang, setLang] = useState<Language>('vi');
  const [isLoaded, setIsLoaded] = useState(false);
  const [siteData, setSiteData] = useState<any>(INITIAL_DATA);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [visitCount, setVisitCount] = useState(0);

  const theme = siteData.theme || 'indigo';
  const tc = THEME_COLORS[theme];

  const persistSiteData = async (newData: any) => {
    setSiteData(newData);
    await saveToDB('portfolio_data', newData);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await getFromDB('portfolio_data');
        if (saved) {
          // Deep merge for critical nested structures like contactInfo
          const merged = { ...INITIAL_DATA, ...saved };
          if (saved.contactInfo) {
            merged.contactInfo = {
              ...INITIAL_DATA.contactInfo,
              ...saved.contactInfo,
              socials: {
                ...INITIAL_DATA.contactInfo.socials,
                ...(saved.contactInfo.socials || {})
              }
            };
          }
          setSiteData(merged);
        } else {
          setSiteData(INITIAL_DATA);
        }

        const savedVisits = await getFromDB('visit_count') || 1240;
        const sessionKey = 'phu_visited_session';
        let currentVisits = savedVisits;
        
        if (!sessionStorage.getItem(sessionKey)) {
          currentVisits += 1;
          await saveToDB('visit_count', currentVisits);
          sessionStorage.setItem(sessionKey, 'true');
        }
        setVisitCount(currentVisits);

        const adminSession = localStorage.getItem('phu_admin_token');
        if (adminSession === 'phu_authorized_2025') {
          setIsAdmin(true);
        }

        setTimeout(() => setIsLoaded(true), 1200);
      } catch (e) {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  const t = siteData.translations[lang];

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('phu_admin_token');
    setIsTerminalOpen(false);
  };

  const scrollToSection = useCallback((id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ 
        top: id === 'home' ? 0 : element.offsetTop - 80, 
        behavior: 'smooth' 
      });
    }
  }, []);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newInquiry: Inquiry = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
      timestamp: new Date().toISOString()
    };
    
    const updatedInquiries = [...(siteData.inquiries || []), newInquiry];
    await persistSiteData({ ...siteData, inquiries: updatedInquiries });
    alert(t.contact.labels.success);
    (e.target as HTMLFormElement).reset();
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-black text-slate-800 text-3xl md:text-5xl animate-pulse uppercase tracking-widest px-6 text-center">
      PHU OS v1.2 INITIALIZING...
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#020617] text-slate-200 selection:bg-${tc}-500 selection:text-white overflow-x-hidden`}>
      <ReadingProgress theme={theme} />
      
      <nav className="fixed top-0 left-0 right-0 z-[100] py-4 md:py-6 glass px-6">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={() => scrollToSection('home')} className="text-xl md:text-2xl font-black tracking-tighter text-gradient">ĐỒNG MINH PHÚ.AI</button>
          
          <div className="hidden lg:flex items-center gap-6">
            {Object.keys(t.nav).map(key => (
              <button key={key} onClick={() => scrollToSection(key)} className={`text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-[0.2em]`}>
                {t.nav[key as keyof typeof t.nav]}
              </button>
            ))}
            <div className="h-6 w-px bg-white/10 mx-2" />
            <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className={`text-[10px] font-black text-${tc}-400 border border-${tc}-500/30 px-3 py-1.5 rounded-lg hover:bg-${tc}-400/10 transition-colors uppercase`}>{lang}</button>
            
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <button onClick={() => setIsTerminalOpen(true)} className={`p-2.5 bg-slate-900 border border-${tc}-500/30 rounded-xl text-${tc}-400 hover:bg-${tc}-500/10 transition-all flex items-center gap-2`}>
                  <Settings size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Quản trị</span>
                </button>
                <button onClick={handleLogout} className="p-2.5 bg-slate-900 border border-rose-500/30 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className={`flex items-center gap-2 p-2.5 bg-slate-900 border border-${tc}-500/30 rounded-xl text-${tc}-400 hover:bg-${tc}-500/10 transition-all shadow-lg group`}>
                <Lock size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest pr-2 hidden group-hover:block transition-all">Đăng nhập</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className={`text-[10px] font-black text-${tc}-400 px-3 py-1.5 border border-${tc}-500/20 rounded-lg`}>{lang.toUpperCase()}</button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-400"><Menu size={28}/></button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-[110] bg-slate-950/95 backdrop-blur-2xl flex flex-col p-10 pt-32">
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 p-2 text-slate-500"><X size={32}/></button>
            <div className="flex flex-col gap-8">
              {Object.keys(t.nav).map((key, i) => (
                <motion.button 
                  key={key} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.1 } }}
                  onClick={() => scrollToSection(key)} 
                  className="text-4xl font-black text-left uppercase tracking-tighter"
                >
                  {t.nav[key as keyof typeof t.nav]}
                </motion.button>
              ))}
              <motion.button 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0, transition: { delay: 0.7 } }}
                onClick={() => { setIsMenuOpen(false); isAdmin ? setIsTerminalOpen(true) : setIsLoginModalOpen(true); }}
                className={`text-2xl font-black text-left uppercase tracking-tighter text-${tc}-400 flex items-center gap-4`}
              >
                {isAdmin ? <><Settings /> Quản trị</> : <><Lock /> Đăng nhập</>}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section id="home" className="min-h-screen flex items-center pt-20 px-6 relative overflow-hidden">
        <div className={`absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-${tc}-500/10 rounded-full blur-[180px] -z-10 animate-pulse`} />
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-5xl text-left">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs font-bold text-${tc}-400 uppercase tracking-widest mb-8 md:mb-12`}>
               <Sparkles size={14} /> {t.hero.badge}
            </div>
            <h1 className="text-[3.5rem] md:text-[8rem] lg:text-[10rem] font-black mb-8 leading-[0.9] tracking-tighter">
              {t.hero.titlePrefix} <br />
              <span className="text-gradient">{t.hero.titleSuffix}</span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-400 max-w-3xl leading-relaxed mb-12 font-medium">{t.hero.bio}</p>
            <div className="flex flex-wrap gap-6 items-center">
              <button onClick={() => scrollToSection('projects')} className="px-8 md:px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-3 shadow-2xl text-sm md:text-base">
                {t.hero.explore} <ChevronRight size={20} />
              </button>
              
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.footer.live}: {Math.floor(Math.random() * 5) + 2}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Profile Section */}
      <section id="about" className="py-24 md:py-40 px-6 bg-slate-950/20">
        <div className="container mx-auto">
          <SectionHeading icon={User} subtitle={t.about.expDesc} theme={theme}>{t.about.title}</SectionHeading>
          <div className="grid lg:grid-cols-2 gap-12 md:gap-24 items-center">
             <div className="relative aspect-square rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-white/10 bg-slate-900 group">
               {siteData.profileImage ? (
                 <img src={siteData.profileImage} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-800"><User size={120} strokeWidth={1} /></div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent p-10 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all">
                  <p className="text-white font-black text-2xl uppercase tracking-tighter">Đồng Minh Phú</p>
                  <p className="text-slate-400 font-bold">{t.about.role}</p>
               </div>
             </div>
             <div className="space-y-8 md:space-y-12 text-left">
                <p className="text-xl md:text-3xl font-medium text-slate-300 leading-tight">
                  {t.about.bioExtended}
                </p>
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-colors">
                    <p className={`text-4xl md:text-6xl font-black text-${tc}-400 mb-2`}>{siteData.projects?.length || 40}+</p>
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500">{t.about.stats.projects}</p>
                  </div>
                  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-colors">
                    <p className="text-4xl md:text-6xl font-black text-cyan-400 mb-2"><AnimatedCounter value={visitCount} /></p>
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500">{t.about.stats.visits}</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-24 md:py-40 px-6">
         <div className="container mx-auto">
           <SectionHeading icon={Cpu} subtitle={t.skills.subtitle} theme={theme}>{t.skills.title}</SectionHeading>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              {siteData.skills.map((skill: Skill, idx: number) => (
                <motion.div 
                  key={skill.id}
                  whileHover={{ y: -10 }}
                  className="p-10 bg-white/5 border border-white/5 rounded-[3rem] group hover:bg-white/10 transition-all shadow-xl text-left"
                >
                  <div className={`w-16 h-16 rounded-2xl ${THEMES[theme].bg} ${THEMES[theme].text} flex items-center justify-center mb-10 group-hover:scale-110 transition-transform`}>
                    <Cpu size={32} />
                  </div>
                  <h4 className="text-2xl font-black mb-8">{skill.cat}</h4>
                  <div className="flex flex-wrap gap-2">
                    {skill.items.map(item => (
                      <span key={item} className="px-4 py-2 bg-black/40 rounded-xl text-[11px] font-bold text-slate-400 border border-white/5">{item}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
           </div>
         </div>
      </section>

      <section id="lab" className={`py-24 md:py-40 px-6 bg-${tc}-500/[0.02]`}>
        <div className="container mx-auto">
          <SectionHeading icon={Wand2} subtitle={t.ailab.subtitle} theme={theme}>{t.ailab.title}</SectionHeading>
          <AiDemoBuilder t={t} theme={theme} tc={tc} />
        </div>
      </section>

      <ProjectsSection t={t} siteData={siteData} theme={theme} tc={tc} setSelectedProject={setSelectedProject} />

      <section id="course" className="py-24 md:py-40 px-6 bg-slate-950/20">
        <div className="container mx-auto">
          <SectionHeading icon={GraduationCap} subtitle={t.course.subtitle} theme={theme}>{t.course.title}</SectionHeading>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
             {siteData.courses && siteData.courses.map((c: Course) => (
               <motion.div 
                  key={c.id} 
                  whileHover={{ scale: 1.02 }}
                  className="p-8 md:p-12 bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden group text-left"
               >
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Rocket size={80} />
                 </div>
                 <div className="flex items-center gap-3 mb-6">
                    <span className={`px-4 py-1.5 bg-${tc}-500/20 text-${tc}-400 rounded-full text-[10px] font-black uppercase tracking-widest`}>{c.level}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> {c.duration}</span>
                 </div>
                 <h3 className="text-3xl font-black mb-6">{c.name}</h3>
                 <p className="text-slate-400 mb-10 leading-relaxed text-lg">{c.desc}</p>
                 <button 
                  onClick={() => setSelectedCourse(c)}
                  className={`px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-${tc}-400 hover:text-white transition-all uppercase tracking-widest text-sm`}
                 >
                   {t.course.enroll}
                 </button>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 md:py-40 px-6">
        <div className="container mx-auto">
           <SectionHeading icon={Mail} subtitle={t.contact.titleSuffix} theme={theme}>{t.contact.title}</SectionHeading>
           <div className="grid lg:grid-cols-2 gap-12 md:gap-20">
              <div className="space-y-6 md:space-y-10 text-left">
                <div className="p-10 bg-white/5 rounded-[3rem] border border-white/5 shadow-2xl">
                  <h4 className="font-black text-2xl mb-10 flex items-center gap-4"><Handshake className={`text-${tc}-400`} /> {t.contact.infoTitle}</h4>
                  <div className="space-y-8">
                    {[
                      { icon: Mail, label: 'Email', val: siteData.contactInfo.email, color: `text-${tc}-400`, bg: `bg-${tc}-500/10` },
                      { icon: Phone, label: lang === 'vi' ? 'SĐT' : 'Phone', val: siteData.contactInfo.phone, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                      { icon: MapPin, label: lang === 'vi' ? 'Địa chỉ' : 'Location', val: siteData.contactInfo.address, color: 'text-purple-400', bg: 'bg-purple-500/10' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-6">
                         <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center`}><item.icon size={24} /></div>
                         <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">{item.label}</p>
                           <p className="text-slate-200 font-bold text-lg">{item.val}</p>
                         </div>
                      </div>
                    ))}
                  </div>

                  {/* Social Media Links Display */}
                  {siteData.contactInfo.socials && (
                    <div className="pt-8 mt-8 border-t border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Kết nối mạng xã hội</p>
                      <div className="flex flex-wrap gap-4">
                         {siteData.contactInfo.socials.facebook && (
                           <a href={siteData.contactInfo.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all border border-blue-500/20">
                             <Facebook size={24} />
                           </a>
                         )}
                         {siteData.contactInfo.socials.youtube && (
                           <a href={siteData.contactInfo.socials.youtube} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all border border-red-500/20">
                             <Youtube size={24} />
                           </a>
                         )}
                         {siteData.contactInfo.socials.tiktok && (
                           <a href={siteData.contactInfo.socials.tiktok} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-white/5 text-white hover:bg-black hover:border-white/20 flex items-center justify-center transition-all border border-white/10">
                             <TiktokIcon size={20} />
                           </a>
                         )}
                         {siteData.contactInfo.socials.zalo && (
                           <a href={siteData.contactInfo.socials.zalo} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all border border-blue-500/20">
                             <ZaloIcon size={24} />
                           </a>
                         )}
                         {siteData.contactInfo.socials.website && (
                           <a href={siteData.contactInfo.socials.website} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all border border-emerald-500/20">
                             <LinkIcon size={24} />
                           </a>
                         )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 md:p-12 bg-white/5 rounded-[3rem] border border-white/10 shadow-2xl text-left">
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-600 ml-4">{t.contact.labels.name}</label>
                       <input name="name" required className={`w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-${tc}-500 transition-all text-sm`} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-600 ml-4">{t.contact.labels.email}</label>
                       <input name="email" type="email" required className={`w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-${tc}-500 transition-all text-sm`} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-600 ml-4">{t.contact.labels.message}</label>
                       <textarea name="message" required className={`w-full h-40 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-${tc}-500 resize-none transition-all text-sm`} />
                    </div>
                    <button type="submit" className={`w-full py-6 bg-${tc}-600 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all uppercase tracking-widest text-sm`}>
                      {t.contact.labels.send}
                    </button>
                  </form>
              </div>
           </div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center px-6 relative overflow-hidden">
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-1/2 bg-${tc}-500/5 blur-[100px] -z-10`} />
        <p className="text-slate-600 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-4">
          {t.footer.copyright.replace('{year}', new Date().getFullYear().toString())}
        </p>
        <div className="flex justify-center gap-6 mt-6">
           <button 
             onClick={() => isAdmin ? setIsTerminalOpen(true) : setIsLoginModalOpen(true)} 
             className={`text-slate-700 hover:text-${tc}-400 transition-all flex items-center gap-2 font-black uppercase tracking-widest text-[10px] border border-white/5 px-4 py-2 rounded-full hover:bg-white/5 shadow-inner`}
           >
             <ShieldCheck size={16} /> {isAdmin ? "TRUY CẬP QUẢN TRỊ" : "ĐĂNG NHẬP QUẢN TRỊ"}
           </button>
        </div>
      </footer>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} t={t} theme={theme} tc={tc} />
        )}
        {selectedCourse && (
          <CourseModal 
            course={selectedCourse} 
            onClose={() => setSelectedCourse(null)} 
            t={t} 
            siteData={siteData} 
            persistSiteData={persistSiteData} 
            tc={tc}
          />
        )}
        {isLoginModalOpen && (
          <LoginModal 
            onClose={() => setIsLoginModalOpen(false)} 
            onSuccess={() => { 
              setIsAdmin(true); 
              localStorage.setItem('phu_admin_token', 'phu_authorized_2025'); 
              setIsLoginModalOpen(false); 
              setIsTerminalOpen(true);
            }}
            adminPassword={siteData.adminPassword}
            tc={tc}
          />
        )}
      </AnimatePresence>

      <ChatAssistant lang={lang} t={t} theme={theme} tc={tc} siteData={siteData} persistSiteData={persistSiteData} />
      
      <AdminPortal 
        isOpen={isTerminalOpen} 
        onClose={() => setIsTerminalOpen(false)} 
        t={t} 
        siteData={siteData} 
        visitCount={visitCount} 
        isAdmin={isAdmin}
        persistSiteData={persistSiteData}
        theme={theme}
        tc={tc}
      />
    </div>
  );
};

// --- Sub Components ---

const ReadingProgress = ({ theme }: { theme: ThemeColor }) => {
  const tc = THEME_COLORS[theme];
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return <motion.div className={`fixed top-0 left-0 right-0 h-1 bg-${tc}-500 origin-left z-[250]`} style={{ scaleX }} />;
};

const LoginModal = ({ onClose, onSuccess, adminPassword, tc }: { onClose: () => void, onSuccess: () => void, adminPassword?: string, tc: string }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = adminPassword || 'admin';
    if (password === correctPassword) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={120} /></div>
        
        <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
          <Lock className={`text-${tc}-400`} /> Phú OS Portal
        </h2>
        <p className="text-slate-500 text-sm mb-8 font-medium uppercase tracking-widest">Xác thực quyền quản trị</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Mật khẩu truy cập</label>
            <input 
              autoFocus
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full bg-black/40 border ${error ? 'border-rose-500' : 'border-white/10'} rounded-2xl px-6 py-4 outline-none focus:border-${tc}-500 transition-all text-white text-center font-black tracking-widest`}
              placeholder="••••••••"
            />
            <p className="text-[9px] text-slate-600 mt-2 italic text-left">* Gợi ý: Mật khẩu mặc định là 'admin'</p>
            {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">Mật mã không chính xác</p>}
          </div>
          
          <button 
            type="submit"
            className={`w-full py-5 bg-${tc}-600 hover:bg-${tc}-500 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2`}
          >
            <KeyRound size={18} /> Đăng nhập ngay
          </button>
          
          <button 
            type="button"
            onClick={onClose}
            className="w-full py-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            Hủy bỏ
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const ProjectsSection = ({ t, siteData, theme, tc, setSelectedProject }: any) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    let list = siteData.projects;
    if (activeFilter !== 'all') {
      const catMap: any = { web: 'Web App', ai: 'AI/ML', arch: 'Architecture' };
      list = list.filter((p: any) => p.cat === catMap[activeFilter]);
    }
    if (searchTerm) {
      list = list.filter((p: any) => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return list;
  }, [activeFilter, searchTerm, siteData.projects]);

  return (
    <section id="projects" className="py-24 md:py-40 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
          <SectionHeading icon={Briefcase} subtitle={t.projects.subtitle} theme={theme}>{t.projects.title}</SectionHeading>
          
          <div className="flex flex-col gap-6 w-full md:w-auto">
            <div className="relative group max-w-md w-full ml-auto">
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-${tc}-400 transition-colors`} size={18} />
              <input 
                placeholder={t.projects.searchPlaceholder}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-${tc}-500/50 transition-all text-sm`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((proj: Project) => (
              <motion.div 
                key={proj.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -10 }}
                onClick={() => setSelectedProject(proj)}
                className="group relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-slate-900 border border-white/5 cursor-pointer shadow-2xl"
              >
                {proj.image ? (
                  <img src={proj.image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-800"><Briefcase size={80} strokeWidth={1} /></div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-10 flex flex-col justify-end text-left">
                   <div className="space-y-4">
                     <span className={`inline-block px-3 py-1 rounded-full ${THEMES[theme as ThemeColor].bg} ${THEMES[theme as ThemeColor].text} text-[8px] font-black uppercase tracking-widest`}>
                       {proj.cat}
                     </span>
                     <h3 className="text-3xl font-black text-white leading-tight">{proj.title}</h3>
                     <p className="text-slate-400 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">{proj.desc}</p>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const ProjectModal = ({ project, onClose, t, theme, tc }: any) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10" onClick={onClose}>
    <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] border border-white/10 overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
      <div className="md:w-1/2 relative bg-slate-950 min-h-[250px] md:min-h-full">
        {project.image ? <img src={project.image} className="w-full h-full object-cover opacity-60" /> : <div className="h-full flex items-center justify-center text-slate-800"><ImageIcon size={64}/></div>}
      </div>
      <div className="md:w-1/2 p-10 md:p-20 overflow-y-auto custom-scrollbar text-left">
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">{project.title}</h2>
        <p className="text-xl text-slate-300 leading-relaxed mb-12">{project.longDesc || project.desc}</p>
        <div className="flex flex-wrap gap-4 mb-12">
           {project.tags?.map((tag: string) => (
             <span key={tag} className={`px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-${tc}-400`}>{tag}</span>
           ))}
        </div>
        <button onClick={onClose} className={`px-10 py-5 bg-${tc}-600 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:bg-${tc}-500 transition-all`}>Đóng cửa sổ</button>
      </div>
    </motion.div>
  </motion.div>
);

const CourseModal = ({ course, onClose, t, siteData, persistSiteData, tc }: any) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', goals: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  const submit = async () => {
    setIsSubmitting(true);
    const newReg: Registration = {
      id: Math.random().toString(36).substr(2, 9),
      name: form.name,
      email: form.email,
      course: course.name,
      timestamp: new Date().toISOString()
    };
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const resp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I want to join the course "${course.name}". My goals are: "${form.goals}". Provide a 2-sentence personalized learning advice.`,
      });
      setAiSuggestion(resp.text || '');
    } catch(e) {}

    await persistSiteData({
      ...siteData,
      registrations: [...(siteData.registrations || []), newReg]
    });
    setStep(2);
    setIsSubmitting(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-2xl bg-slate-900 rounded-[3rem] border border-white/10 p-10 md:p-16 relative overflow-hidden" onClick={e => e.stopPropagation()}>
         <div className={`absolute top-[-10%] right-[-10%] w-60 h-60 bg-${tc}-500/10 rounded-full blur-[80px] -z-10`} />
         
         {step === 1 ? (
           <div className="space-y-8 text-left">
              <div className="space-y-2">
                <h2 className="text-3xl md:text-5xl font-black text-white">{t.course.enroll}</h2>
                <p className={`text-${tc}-400 font-bold uppercase tracking-widest text-sm`}>{course.name}</p>
              </div>
              <div className="space-y-6">
                 <input placeholder={t.contact.labels.name} value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={`w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-${tc}-500 transition-all`} />
                 <input placeholder={t.contact.labels.email} value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={`w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-${tc}-500 transition-all`} />
                 <textarea placeholder="Mục tiêu học tập của bạn?" value={form.goals} onChange={e => setForm({...form, goals: e.target.value})} className={`w-full h-32 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-${tc}-500 transition-all resize-none`} />
                 <button 
                  onClick={submit}
                  disabled={!form.name || !form.email || isSubmitting}
                  className={`w-full py-5 bg-${tc}-600 rounded-2xl font-black uppercase text-white hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50`}
                 >
                   {isSubmitting ? <RefreshCcw size={20} className="animate-spin" /> : <Rocket size={20}/>}
                   Xác nhận ghi danh
                 </button>
              </div>
           </div>
         ) : (
           <div className="text-center space-y-8 py-10">
              <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={48} /></div>
              <h2 className="text-3xl font-black text-white">{t.course.success}</h2>
              {aiSuggestion && (
                <div className={`p-8 bg-${tc}-500/5 border border-${tc}-500/10 rounded-3xl text-left`}>
                  <p className={`text-xs font-black uppercase tracking-widest text-${tc}-400 mb-4 flex items-center gap-2`}><Sparkles size={14} /> AI Lời khuyên</p>
                  <p className="text-slate-300 leading-relaxed italic">"{aiSuggestion}"</p>
                </div>
              )}
              <button onClick={onClose} className="px-12 py-4 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-sm">Quay lại</button>
           </div>
         )}
      </motion.div>
    </motion.div>
  );
};

const AiDemoBuilder = ({ t, tc }: any) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [demoData, setDemoData] = useState<any>(null);

  const generate = async () => {
    if(!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const resp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Architect a demo for: "${prompt}". Return JSON with: title, vibe, hero:{title, subtitle}, features:[{title, desc}].`,
        config: { responseMimeType: "application/json" }
      });
      setDemoData(JSON.parse(resp.text || '{}'));
    } catch (e) { console.error(e); }
    setIsGenerating(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 text-left">
      <div className="p-8 md:p-12 bg-white/5 rounded-[3rem] border border-white/10 shadow-2xl">
        <textarea 
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={t.ailab.placeholder}
          className={`w-full h-32 md:h-40 bg-black/40 border border-white/10 rounded-2xl px-8 py-6 outline-none focus:border-${tc}-500 transition-all resize-none text-lg`}
        />
        <button 
          onClick={generate}
          disabled={isGenerating || !prompt.trim()}
          className={`w-full py-6 mt-6 bg-gradient-to-r from-${tc}-600 to-cyan-600 rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl transition-all disabled:opacity-50 text-white`}
        >
          {isGenerating ? <RefreshCcw size={20} className="animate-spin" /> : <Wand2 size={20} />}
          {isGenerating ? t.ailab.generating : t.ailab.button}
        </button>
      </div>
      
      {demoData && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-10 bg-white/5 border border-${tc}-500/20 rounded-[3rem] shadow-2xl relative`}>
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-3xl font-black text-white">{demoData.title}</h3>
            <span className={`px-4 py-1.5 bg-${tc}-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest`}>{demoData.vibe}</span>
          </div>
          <div className="mb-12">
            <h4 className="text-4xl md:text-5xl font-black text-gradient mb-4">{demoData.hero.title}</h4>
            <p className="text-slate-400 text-lg">{demoData.hero.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {demoData.features.map((f: any, i: number) => (
              <div key={i} className="p-6 bg-black/40 border border-white/5 rounded-2xl">
                <h5 className={`font-black text-${tc}-400 mb-2 uppercase tracking-widest text-xs`}>{f.title}</h5>
                <p className="text-slate-300 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const ChatAssistant = ({ lang, t, theme, tc, siteData, persistSiteData }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`);

  useEffect(() => {
    if(isOpen && messages.length === 0) setMessages([{ role: 'ai', text: t.chat.welcome }]);
  }, [isOpen, messages.length, t.chat.welcome]);

  const logChat = (role: 'user' | 'ai', text: string) => {
    const newLog: ChatLogEntry = {
      sessionId: sessionId.current,
      role,
      text,
      timestamp: new Date().toISOString()
    };
    persistSiteData({
      ...siteData,
      chatLogs: [...(siteData.chatLogs || []), newLog]
    });
  };

  const send = async (e?: any) => {
    e?.preventDefault();
    if(!input.trim()) return;
    const msg = input;
    
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setIsTyping(true);
    
    logChat('user', msg);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const resp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Language: ${lang}. You are Phu's AI assistant. Brief answers. User says: ${msg}`,
        config: { systemInstruction: "Helpful, futuristic, professional. Focus on architecture and engineering." }
      });
      const aiText = resp.text || '...';
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
      logChat('ai', aiText);
    } catch(e) { console.error(e); }
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[200]">
      <button onClick={() => setIsOpen(!isOpen)} className={`w-16 h-16 rounded-full bg-${tc}-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-all border border-white/20`}>
        {isOpen ? <X className="text-white"/> : <Bot className="text-white" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="absolute bottom-20 right-0 w-[90vw] md:w-[400px] h-[500px] glass rounded-[2.5rem] border border-white/10 p-8 flex flex-col shadow-2xl overflow-hidden text-left">
            <div className="flex items-center gap-4 mb-6">
               <div className={`w-12 h-12 rounded-2xl bg-${tc}-500/20 text-${tc}-400 flex items-center justify-center`}><Bot size={24}/></div>
               <div><h3 className="font-black text-lg">{t.chat.agent}</h3><span className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> Online</span></div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-6 px-1">
               {messages.map((m, i) => (
                 <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? `bg-${tc}-600 text-white rounded-tr-none` : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/5'}`}>{m.text}</div>
                 </div>
               ))}
               {isTyping && <div className="text-xs text-slate-500 animate-pulse font-bold">{t.chat.typing}</div>}
            </div>
            <form onSubmit={send} className="relative">
              <input value={input} onChange={e => setInput(e.target.value)} className={`w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-${tc}-500`} placeholder="..." />
              <button type="submit" className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 text-${tc}-400`}><Send size={18}/></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- New Admin Portal ---
const AdminPortal = ({ isOpen, onClose, t, siteData, visitCount, isAdmin, persistSiteData, theme, tc }: any) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'skills' | 'courses' | 'content' | 'messages' | 'terminal' | 'settings' | 'info'>('dashboard');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editContentLang, setEditContentLang] = useState<Language>('vi');

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const cmdRaw = terminalInput.trim();
    const [cmd, ...args] = cmdRaw.toLowerCase().split(' ');
    
    let response = `> ${cmdRaw}\n`;
    if (cmd === 'help') {
      response += `Available commands:\n- stats: View system statistics\n- clear: Clear terminal\n- logout: Terminate session\n- analysis: Run AI data audit\n- set-pass [new]: Change admin password`;
    } else if (cmd === 'stats') {
      response += `Active Visits: ${visitCount}\nProjects: ${siteData.projects?.length || 0}\nRegistrations: ${siteData.registrations?.length || 0}\nInquiries: ${siteData.inquiries?.length || 0}`;
    } else if (cmd === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    } else if (cmd === 'analysis') {
      setIsProcessing(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const resp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize business potential from these inquiries: ${JSON.stringify(siteData.inquiries?.slice(-5))}`,
      });
      response += `[AI REPORT]\n${resp.text}`;
      setIsProcessing(false);
    } else if (cmd === 'set-pass') {
      if (args[0]) {
        await persistSiteData({ ...siteData, adminPassword: args[0] });
        response += `[SUCCESS] Admin password updated.`;
      } else response += `[ERROR] Missing argument.`;
    } else {
      response += `[ERROR] Command not found: ${cmd}`;
    }

    setTerminalHistory(prev => [...prev, response]);
    setTerminalInput('');
  };

  const handleProjectImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProject) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File quá lớn! Vui lòng chọn ảnh dưới 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProject({ ...editingProject, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const updated = siteData.projects.filter((p: any) => p.id !== id);
      await persistSiteData({ ...siteData, projects: updated });
    }
  };

  const deleteCourse = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      const updated = siteData.courses.filter((c: any) => c.id !== id);
      await persistSiteData({ ...siteData, courses: updated });
    }
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const proj: Project = {
      id: editingProject?.id || Math.random().toString(36).substr(2, 9),
      title: formData.get('title') as string,
      desc: formData.get('desc') as string,
      longDesc: formData.get('longDesc') as string,
      tags: (formData.get('tags') as string).split(',').map(s => s.trim()),
      cat: formData.get('cat') as string,
      image: formData.get('image') as string,
    };

    let updatedProjects;
    if (editingProject?.id) {
      updatedProjects = siteData.projects.map((p: any) => p.id === proj.id ? proj : p);
    } else {
      updatedProjects = [...(siteData.projects || []), proj];
    }

    await persistSiteData({ ...siteData, projects: updatedProjects });
    setEditingProject(null);
  };

  const saveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const course: Course = {
      id: editingCourse?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      level: formData.get('level') as string,
      duration: formData.get('duration') as string,
      desc: formData.get('desc') as string,
    };

    let updatedCourses;
    if (editingCourse?.id) {
      updatedCourses = siteData.courses.map((c: any) => c.id === course.id ? course : c);
    } else {
      updatedCourses = [...(siteData.courses || []), course];
    }
    await persistSiteData({ ...siteData, courses: updatedCourses });
    setEditingCourse(null);
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File quá lớn! Vui lòng chọn ảnh dưới 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        persistSiteData({ ...siteData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-0 md:p-6 backdrop-blur-2xl">
      <div className="w-full max-w-[95vw] h-full md:h-[90vh] bg-slate-900 md:rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.8)] text-left">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-950/50 border-r border-white/5 flex flex-col">
          <div className="p-8 border-b border-white/5">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <ShieldCheck className={`text-${tc}-400`} /> ADMIN
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">PhuOS v1.2</p>
          </div>
          
          <div className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
            {[
              { id: 'dashboard', icon: Layout, label: 'Thống kê' },
              { id: 'content', icon: FileText, label: 'Nội dung CMS' },
              { id: 'projects', icon: Briefcase, label: 'Dự án' },
              { id: 'courses', icon: GraduationCap, label: 'Khóa học' },
              { id: 'skills', icon: Cpu, label: 'Kỹ năng' },
              { id: 'info', icon: UserCog, label: 'Thông tin' },
              { id: 'messages', icon: Inbox, label: 'Tin nhắn' },
              { id: 'terminal', icon: TerminalIcon, label: 'Terminal' },
              { id: 'settings', icon: Settings, label: 'Cài đặt' },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? `bg-${tc}-600 text-white shadow-lg shadow-${tc}-500/20` : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon size={16} />
                <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6 border-t border-white/5">
            <button onClick={onClose} className="w-full py-4 bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
              Đóng Console
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 relative">
          {!isAdmin ? (
             <div className="flex flex-col items-center justify-center h-full space-y-8">
               <ShieldAlert size={100} className="text-rose-500" />
               <h1 className="text-4xl font-black">ACCESS DENIED</h1>
               <button onClick={onClose} className="px-10 py-4 bg-white text-black font-black rounded-xl">Quay lại</button>
             </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="space-y-10">
                  <header>
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Chào buổi sáng, Phú</h1>
                    <p className="text-slate-400">Hệ thống của bạn đang hoạt động ổn định.</p>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Visits', value: visitCount, color: `text-${tc}-400`, icon: Eye },
                      { label: 'Inquiries', value: siteData.inquiries?.length || 0, color: 'text-cyan-400', icon: Mail },
                      { label: 'Academy', value: siteData.registrations?.length || 0, color: 'text-emerald-400', icon: GraduationCap },
                      { label: 'Projects', value: siteData.projects?.length || 0, color: 'text-purple-400', icon: Briefcase },
                    ].map(stat => (
                      <div key={stat.label} className="p-8 bg-white/5 border border-white/5 rounded-3xl">
                        <stat.icon className={`${stat.color} mb-6`} size={24} />
                        <p className="text-3xl font-black">{stat.value}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem]">
                       <h4 className="text-xl font-black mb-8 flex items-center gap-3"><History size={20}/> Hoạt động gần đây</h4>
                       <div className="space-y-6">
                          {siteData.chatLogs?.slice(-5).reverse().map((log: any, i: number) => (
                            <div key={i} className="flex gap-4 p-4 bg-black/20 rounded-2xl border border-white/5">
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.role === 'ai' ? `bg-${tc}-500/10 text-${tc}-400` : 'bg-white/10 text-white'}`}>
                                 {log.role === 'ai' ? <Bot size={18}/> : <User size={18}/>}
                               </div>
                               <div>
                                 <p className="text-xs font-bold text-slate-200">{log.text}</p>
                                 <p className="text-[9px] text-slate-600 mt-1 uppercase">{new Date(log.timestamp).toLocaleString()}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem]">
                       <h4 className="text-xl font-black mb-8 flex items-center gap-3"><Users size={20}/> Học viên mới</h4>
                       <div className="space-y-4">
                          {siteData.registrations?.slice(-5).reverse().map((reg: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5">
                              <div>
                                <p className="text-sm font-black">{reg.name}</p>
                                <p className={`text-[10px] text-${tc}-400 font-bold uppercase`}>{reg.course}</p>
                              </div>
                              <p className="text-[9px] text-slate-600">{reg.timestamp.slice(0, 10)}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black">Quản lý Dự án</h2>
                    <button 
                      onClick={() => setEditingProject({ id: '', title: '', desc: '', longDesc: '', tags: [], cat: 'Web App' })}
                      className={`px-6 py-3 bg-${tc}-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2`}
                    >
                      <PlusCircle size={18} /> Thêm Mới
                    </button>
                  </div>

                  {editingProject ? (
                    <motion.form 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      onSubmit={saveProject} 
                      className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Tiêu đề</label>
                          <input name="title" defaultValue={editingProject.title} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Phân loại</label>
                          <select name="cat" defaultValue={editingProject.cat} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm appearance-none">
                            <option value="Architecture">Architecture</option>
                            <option value="AI/ML">AI/ML</option>
                            <option value="Web App">Web App</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Mô tả ngắn</label>
                        <input name="desc" defaultValue={editingProject.desc} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Mô tả chi tiết</label>
                        <textarea name="longDesc" defaultValue={editingProject.longDesc} className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm resize-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Công nghệ (cách nhau bằng dấu phẩy)</label>
                        <input name="tags" defaultValue={editingProject.tags.join(', ')} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm" />
                      </div>
                      
                      {/* Image Upload Section */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Hình ảnh dự án</label>
                        <div className="space-y-4">
                          {editingProject.image ? (
                            <div className="relative w-full h-64 rounded-2xl overflow-hidden group border border-white/10 bg-black/40">
                              <img src={editingProject.image} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button type="button" onClick={() => setEditingProject({...editingProject, image: ''})} className="p-3 bg-rose-500/20 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={20}/></button>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-32 bg-black/40 border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-slate-500">
                              <div className="text-center">
                                <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-[10px] uppercase font-bold">Chưa có ảnh</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-4">
                             <label className={`cursor-pointer px-6 py-4 bg-${tc}-600 hover:bg-${tc}-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all flex-shrink-0`}>
                                <Upload size={18} /> Tải ảnh
                                <input type="file" accept="image/*" className="hidden" onChange={handleProjectImageUpload} />
                             </label>
                             <div className="flex-1">
                                <input 
                                  name="image"
                                  placeholder="Hoặc nhập URL ảnh..."
                                  value={editingProject.image || ''}
                                  onChange={(e) => setEditingProject({...editingProject, image: e.target.value})}
                                  className={`w-full h-full bg-black/40 border border-white/10 rounded-2xl px-6 text-sm focus:border-${tc}-500 outline-none`}
                                />
                             </div>
                          </div>
                          <p className="text-[10px] text-slate-500 italic ml-2">* Hỗ trợ JPG, PNG, WebP (Max 5MB)</p>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button type="submit" className={`px-10 py-4 bg-${tc}-600 text-white rounded-xl text-xs font-black uppercase`}>Lưu dự án</button>
                        <button type="button" onClick={() => setEditingProject(null)} className="px-10 py-4 bg-white/5 text-slate-400 rounded-xl text-xs font-black uppercase">Hủy</button>
                      </div>
                    </motion.form>
                  ) : (
                    <div className="grid gap-4">
                      {siteData.projects.map((proj: Project) => (
                        <div key={proj.id} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-12 bg-slate-800 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
                              {proj.image ? <img src={proj.image} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-slate-600"/>}
                            </div>
                            <div>
                              <p className="font-black text-white">{proj.title}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">{proj.cat}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingProject(proj)} className={`p-3 bg-white/5 hover:bg-${tc}-500/20 text-${tc}-400 rounded-xl transition-all`}><Pencil size={18}/></button>
                            <button onClick={() => deleteProject(proj.id)} className="p-3 bg-white/5 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all"><Trash2 size={18}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'courses' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black">Quản lý Khóa học</h2>
                    <button 
                      onClick={() => setEditingCourse({ id: '', name: '', level: 'Beginner', duration: '', desc: '' })}
                      className={`px-6 py-3 bg-${tc}-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2`}
                    >
                      <PlusCircle size={18} /> Thêm Khóa học
                    </button>
                  </div>
                  
                  {editingCourse ? (
                    <motion.form 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      onSubmit={saveCourse} 
                      className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Tên khóa học</label>
                          <input name="name" defaultValue={editingCourse.name} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm" required />
                        </div>
                         <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Thời lượng</label>
                          <input name="duration" defaultValue={editingCourse.duration} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Cấp độ</label>
                          <input name="level" defaultValue={editingCourse.level} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Mô tả</label>
                        <textarea name="desc" defaultValue={editingCourse.desc} className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm resize-none" required />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button type="submit" className={`px-10 py-4 bg-${tc}-600 text-white rounded-xl text-xs font-black uppercase`}>Lưu</button>
                        <button type="button" onClick={() => setEditingCourse(null)} className="px-10 py-4 bg-white/5 text-slate-400 rounded-xl text-xs font-black uppercase">Hủy</button>
                      </div>
                    </motion.form>
                  ) : (
                    <div className="grid gap-4">
                      {siteData.courses?.map((c: Course) => (
                        <div key={c.id} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all">
                           <div>
                              <p className="font-black text-white">{c.name}</p>
                              <div className="flex gap-3 mt-1">
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-indigo-300">{c.level}</span>
                                <span className="text-[10px] text-slate-500">{c.duration}</span>
                              </div>
                           </div>
                           <div className="flex gap-2">
                            <button onClick={() => setEditingCourse(c)} className={`p-3 bg-white/5 hover:bg-${tc}-500/20 text-${tc}-400 rounded-xl transition-all`}><Pencil size={18}/></button>
                            <button onClick={() => deleteCourse(c.id)} className="p-3 bg-white/5 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all"><Trash2 size={18}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-black">Quản lý Kỹ năng</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {siteData.skills.map((skill: Skill, idx: number) => (
                      <div key={skill.id} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem]">
                        <div className="flex justify-between items-center mb-6">
                           <h4 className="text-xl font-black">{skill.cat}</h4>
                           <button onClick={() => {
                             if(confirm('Xóa nhóm kỹ năng này?')) {
                               const updated = siteData.skills.filter((s:any) => s.id !== skill.id);
                               persistSiteData({...siteData, skills: updated});
                             }
                           }} className="text-rose-500 p-2"><Trash2 size={16}/></button>
                        </div>
                        <div className="space-y-4">
                           <div className="flex flex-wrap gap-2">
                             {skill.items.map((item: string) => (
                               <span key={item} className="px-3 py-1 bg-black/40 rounded-lg text-xs font-bold text-slate-400 flex items-center gap-2 group">
                                 {item}
                                 <button onClick={() => {
                                   const newItems = skill.items.filter(i => i !== item);
                                   const updatedSkills = siteData.skills.map((s:any) => s.id === skill.id ? {...s, items: newItems} : s);
                                   persistSiteData({...siteData, skills: updatedSkills});
                                 }} className="hover:text-rose-500"><X size={10}/></button>
                               </span>
                             ))}
                           </div>
                           <div className="flex gap-2">
                             <input id={`new-skill-${skill.id}`} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs" placeholder="Thêm kỹ năng..." 
                               onKeyDown={(e) => {
                                 if(e.key === 'Enter') {
                                    const val = (e.target as HTMLInputElement).value;
                                    if(val) {
                                      const updatedSkills = siteData.skills.map((s:any) => s.id === skill.id ? {...s, items: [...s.items, val]} : s);
                                      persistSiteData({...siteData, skills: updatedSkills});
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                 }
                               }}
                             />
                           </div>
                        </div>
                      </div>
                    ))}
                    <div className="p-8 border-2 border-dashed border-white/10 rounded-[2.5rem] flex items-center justify-center">
                       <button 
                         onClick={() => {
                           const name = prompt('Tên nhóm kỹ năng mới:');
                           if(name) {
                             const newSkill = { id: Date.now().toString(), cat: name, icon: 'Cpu', items: [] };
                             persistSiteData({...siteData, skills: [...siteData.skills, newSkill]});
                           }
                         }}
                         className="flex flex-col items-center gap-2 text-slate-500 hover:text-white transition-colors"
                       >
                         <PlusCircle size={32} />
                         <span className="text-xs font-black uppercase tracking-widest">Thêm Nhóm</span>
                       </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                     <h2 className="text-3xl font-black">Nội dung CMS</h2>
                     <div className="flex bg-white/5 p-1 rounded-xl">
                       <button onClick={() => setEditContentLang('vi')} className={`px-4 py-2 rounded-lg text-xs font-black ${editContentLang === 'vi' ? `bg-${tc}-600 text-white` : 'text-slate-400'}`}>VIETNAMESE</button>
                       <button onClick={() => setEditContentLang('en')} className={`px-4 py-2 rounded-lg text-xs font-black ${editContentLang === 'en' ? `bg-${tc}-600 text-white` : 'text-slate-400'}`}>ENGLISH</button>
                     </div>
                  </div>
                  
                  <div className="space-y-8">
                     {/* Hero Section */}
                     <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-4">
                        <h4 className={`text-${tc}-400 font-black uppercase tracking-widest text-xs mb-4`}>Hero Section</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <label className="text-[10px] text-slate-500 font-bold uppercase">Badge</label>
                             <input 
                              defaultValue={siteData.translations[editContentLang].hero.badge} 
                              onBlur={(e) => {
                                const newData = JSON.parse(JSON.stringify(siteData));
                                newData.translations[editContentLang].hero.badge = e.target.value;
                                persistSiteData(newData);
                              }}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm" 
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] text-slate-500 font-bold uppercase">Tiêu đề (Prefix)</label>
                             <input 
                              defaultValue={siteData.translations[editContentLang].hero.titlePrefix} 
                              onBlur={(e) => {
                                const newData = JSON.parse(JSON.stringify(siteData));
                                newData.translations[editContentLang].hero.titlePrefix = e.target.value;
                                persistSiteData(newData);
                              }}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm" 
                             />
                           </div>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] text-slate-500 font-bold uppercase">Tiêu đề (Suffix - Gradient)</label>
                             <input 
                              defaultValue={siteData.translations[editContentLang].hero.titleSuffix} 
                              onBlur={(e) => {
                                const newData = JSON.parse(JSON.stringify(siteData));
                                newData.translations[editContentLang].hero.titleSuffix = e.target.value;
                                persistSiteData(newData);
                              }}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm" 
                             />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] text-slate-500 font-bold uppercase">Giới thiệu ngắn (Bio)</label>
                             <textarea 
                              defaultValue={siteData.translations[editContentLang].hero.bio} 
                              onBlur={(e) => {
                                const newData = JSON.parse(JSON.stringify(siteData));
                                newData.translations[editContentLang].hero.bio = e.target.value;
                                persistSiteData(newData);
                              }}
                              className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none" 
                             />
                        </div>
                     </div>

                     {/* About Section */}
                     <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-4">
                        <h4 className={`text-${tc}-400 font-black uppercase tracking-widest text-xs mb-4`}>About Section</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <label className="text-[10px] text-slate-500 font-bold uppercase">Chức danh</label>
                             <input 
                              defaultValue={siteData.translations[editContentLang].about.role} 
                              onBlur={(e) => {
                                const newData = JSON.parse(JSON.stringify(siteData));
                                newData.translations[editContentLang].about.role = e.target.value;
                                persistSiteData(newData);
                              }}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm" 
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] text-slate-500 font-bold uppercase">Năm kinh nghiệm (Title)</label>
                             <input 
                              defaultValue={siteData.translations[editContentLang].about.expTitle} 
                              onBlur={(e) => {
                                const newData = JSON.parse(JSON.stringify(siteData));
                                newData.translations[editContentLang].about.expTitle = e.target.value;
                                persistSiteData(newData);
                              }}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm" 
                             />
                           </div>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] text-slate-500 font-bold uppercase">Giới thiệu chi tiết</label>
                             <textarea 
                              defaultValue={siteData.translations[editContentLang].about.bioExtended} 
                              onBlur={(e) => {
                                const newData = JSON.parse(JSON.stringify(siteData));
                                newData.translations[editContentLang].about.bioExtended = e.target.value;
                                persistSiteData(newData);
                              }}
                              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none" 
                             />
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'info' && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-black">Thông tin Cá nhân</h2>
                  <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Ảnh đại diện</label>
                      <div className="flex gap-6 items-start">
                        <div className="w-24 h-24 rounded-2xl bg-slate-800 overflow-hidden border border-white/10 flex-shrink-0 relative group">
                            {siteData.profileImage ? (
                              <img src={siteData.profileImage} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600"><User size={32}/></div>
                            )}
                            {siteData.profileImage && (
                              <button 
                                onClick={() => persistSiteData({...siteData, profileImage: null})}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-rose-400"
                              >
                                <Trash2 size={20} />
                              </button>
                            )}
                        </div>
                        <div className="flex-1 space-y-3">
                           <div className="flex gap-3">
                              <label className={`cursor-pointer px-6 py-3 bg-${tc}-600 hover:bg-${tc}-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all`}>
                                <Upload size={16} /> Tải ảnh lên
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                              </label>
                              <div className="text-[10px] text-slate-500 flex items-center">
                                * Hỗ trợ JPG, PNG (Max 5MB)
                              </div>
                           </div>
                           <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><ExternalLink size={14}/></span>
                              <input 
                                defaultValue={siteData.profileImage || ''}
                                placeholder="Hoặc nhập URL ảnh..."
                                onBlur={(e) => persistSiteData({...siteData, profileImage: e.target.value})}
                                className={`w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-${tc}-500 outline-none transition-all`}
                              />
                           </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Email</label>
                          <input 
                            defaultValue={siteData.contactInfo.email}
                            onBlur={(e) => persistSiteData({...siteData, contactInfo: {...siteData.contactInfo, email: e.target.value}})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Số điện thoại</label>
                          <input 
                            defaultValue={siteData.contactInfo.phone}
                            onBlur={(e) => persistSiteData({...siteData, contactInfo: {...siteData.contactInfo, phone: e.target.value}})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Địa chỉ</label>
                          <input 
                            defaultValue={siteData.contactInfo.address}
                            onBlur={(e) => persistSiteData({...siteData, contactInfo: {...siteData.contactInfo, address: e.target.value}})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                          />
                       </div>
                    </div>

                    <div className="border-t border-white/10 pt-6 mt-4">
                      <h4 className={`text-sm font-black text-${tc}-400 uppercase tracking-widest mb-6 flex items-center gap-2`}>
                        <Share2 size={16} /> Liên kết Mạng xã hội
                      </h4>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2"><Facebook size={12}/> Facebook URL</label>
                            <input 
                              defaultValue={siteData.contactInfo.socials?.facebook || ''}
                              onBlur={(e) => persistSiteData({...siteData, contactInfo: {...siteData.contactInfo, socials: {...(siteData.contactInfo.socials || {}), facebook: e.target.value}}})}
                              placeholder="https://facebook.com/..."
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2"><Youtube size={12}/> Youtube URL</label>
                            <input 
                              defaultValue={siteData.contactInfo.socials?.youtube || ''}
                              onBlur={(e) => persistSiteData({...siteData, contactInfo: {...siteData.contactInfo, socials: {...(siteData.contactInfo.socials || {}), youtube: e.target.value}}})}
                              placeholder="https://youtube.com/..."
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2"><TiktokIcon size={12}/> TikTok URL</label>
                            <input 
                              defaultValue={siteData.contactInfo.socials?.tiktok || ''}
                              onBlur={(e) => persistSiteData({...siteData, contactInfo: {...siteData.contactInfo, socials: {...(siteData.contactInfo.socials || {}), tiktok: e.target.value}}})}
                              placeholder="https://tiktok.com/..."
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2"><ZaloIcon size={12}/> Zalo URL</label>
                            <input 
                              defaultValue={siteData.contactInfo.socials?.zalo || ''}
                              onBlur={(e) => persistSiteData({...siteData, contactInfo: {...siteData.contactInfo, socials: {...(siteData.contactInfo.socials || {}), zalo: e.target.value}}})}
                              placeholder="https://zalo.me/..."
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2"><LinkIcon size={12}/> Website URL</label>
                            <input 
                              defaultValue={siteData.contactInfo.socials?.website || ''}
                              onBlur={(e) => persistSiteData({...siteData, contactInfo: {...siteData.contactInfo, socials: {...(siteData.contactInfo.socials || {}), website: e.target.value}}})}
                              placeholder="https://..."
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'terminal' && (
                <div className="h-full flex flex-col font-mono text-emerald-400">
                  <div className="flex-1 overflow-y-auto space-y-2 p-6 bg-black/40 border border-white/5 rounded-3xl mb-4 custom-scrollbar">
                    <p className={`text-${tc}-400 font-bold`}>[PhuOS 1.2 Session Initialized]</p>
                    <p className="text-slate-500 italic">Type 'help' for commands.</p>
                    {terminalHistory.map((h, i) => (
                      <pre key={i} className="whitespace-pre-wrap text-sm leading-relaxed">{h}</pre>
                    ))}
                    {isProcessing && <p className={`animate-pulse text-${tc}-300 font-bold`}>[SYSTEM ANALYZING DATA STREAM...]</p>}
                  </div>
                  <form onSubmit={handleCommand} className="flex gap-2 p-4 bg-black border border-white/10 rounded-2xl">
                    <span className={`text-${tc}-500 font-bold`}>phu@os:~$</span>
                    <input 
                      autoFocus 
                      value={terminalInput} 
                      onChange={e => setTerminalInput(e.target.value)}
                      className="bg-transparent outline-none flex-1 text-emerald-400 text-sm"
                      autoComplete="off"
                    />
                  </form>
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-10">
                   <h2 className="text-4xl font-black">Yêu cầu Liên hệ</h2>
                   <div className="grid gap-6">
                      {siteData.inquiries?.length ? (
                        [...siteData.inquiries].reverse().map((msg: Inquiry) => (
                          <div key={msg.id} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-4">
                             <div className="flex justify-between items-start">
                               <div>
                                 <h4 className="text-xl font-black">{msg.name}</h4>
                                 <p className={`text-${tc}-400 text-xs font-bold`}>{msg.email}</p>
                               </div>
                               <p className="text-[10px] text-slate-600 font-black uppercase">{new Date(msg.timestamp).toLocaleString()}</p>
                             </div>
                             <p className={`text-slate-300 text-sm leading-relaxed italic border-l-2 border-${tc}-500/30 pl-4`}>"{msg.message}"</p>
                             <div className="flex justify-end gap-3">
                               <button className={`px-6 py-2 bg-${tc}-500/10 text-${tc}-400 rounded-xl text-[10px] font-black uppercase`}>Phản hồi</button>
                               <button 
                                onClick={async () => {
                                  if(confirm('Delete message?')) {
                                    const updated = siteData.inquiries.filter((m: any) => m.id !== msg.id);
                                    await persistSiteData({ ...siteData, inquiries: updated });
                                  }
                                }}
                                className="p-2 text-rose-500/50 hover:text-rose-500 transition-colors"
                               ><Trash size={18}/></button>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-20 text-slate-600">
                          <Inbox size={60} className="mx-auto mb-6 opacity-20" />
                          <p className="text-xl font-black uppercase tracking-widest">Hộp thư trống</p>
                        </div>
                      )}
                   </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-10">
                  <h2 className="text-4xl font-black">Cấu hình Hệ thống</h2>
                  <div className="max-w-2xl space-y-8">
                    
                    {/* Theme Selector */}
                    <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-6">
                       <h4 className="text-xl font-black">Giao diện</h4>
                       <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase text-slate-500 ml-2">Màu chủ đạo</p>
                          <div className="flex flex-wrap gap-4">
                            {Object.keys(THEME_COLORS).map((colorKey) => {
                              const isActive = theme === colorKey;
                              const displayColor = THEME_COLORS[colorKey as ThemeColor];
                              return (
                                <button 
                                  key={colorKey}
                                  onClick={() => persistSiteData({ ...siteData, theme: colorKey })}
                                  className={`px-6 py-3 rounded-xl border flex items-center gap-2 transition-all ${isActive ? `bg-${displayColor}-600 border-${displayColor}-500 text-white shadow-lg` : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'}`}
                                >
                                  <div className={`w-3 h-3 rounded-full bg-${displayColor}-500`} />
                                  <span className="text-xs font-black uppercase tracking-widest">{colorKey}</span>
                                </button>
                              );
                            })}
                          </div>
                       </div>
                    </div>

                    <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-6">
                       <h4 className="text-xl font-black">Bảo mật</h4>
                       <div className="space-y-4">
                          <label className="block text-[10px] font-black uppercase text-slate-500 ml-2">Mật khẩu quản trị mới</label>
                          <div className="flex gap-4">
                            <input 
                              type="password" 
                              id="newAdminPass"
                              placeholder="Nhập mật khẩu mới..."
                              className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm"
                            />
                            <button 
                              onClick={async () => {
                                const val = (document.getElementById('newAdminPass') as HTMLInputElement).value;
                                if(val) {
                                  await persistSiteData({ ...siteData, adminPassword: val });
                                  alert('Đã đổi mật khẩu!');
                                  (document.getElementById('newAdminPass') as HTMLInputElement).value = '';
                                }
                              }}
                              className={`px-8 bg-${tc}-600 text-white font-black rounded-2xl text-[10px] uppercase`}
                            >Cập nhật</button>
                          </div>
                       </div>
                    </div>

                    <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-6">
                       <h4 className="text-xl font-black">Dữ liệu</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => {
                              const blob = new Blob([JSON.stringify(siteData, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `phu_os_backup_${new Date().toISOString().slice(0, 10)}.json`;
                              a.click();
                            }}
                            className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all flex flex-col items-center gap-3"
                          >
                             <Download size={24} className={`text-${tc}-400`} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Sao lưu JSON</span>
                          </button>
                          <button 
                            onClick={async () => {
                              if(confirm('RESET TO DEFAULT? This will wipe all current data.')) {
                                await persistSiteData(INITIAL_DATA);
                                window.location.reload();
                              }
                            }}
                            className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-rose-500/10 transition-all flex flex-col items-center gap-3"
                          >
                             <RefreshCcw size={24} className="text-rose-400" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Đặt lại Hệ thống</span>
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);