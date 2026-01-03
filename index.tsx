
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Inbox
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";

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
    request.onerror = (event: any) => reject(event.target.error);
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
    request.onsuccess = (event: any) => resolve(request.result);
    request.onerror = (event: any) => reject(request.error);
  });
};

// --- Types & Constants ---
type Language = 'vi' | 'en';
type ThemeColor = 'indigo' | 'emerald' | 'rose' | 'amber';
type ProjectCategory = 'All' | 'Web App' | 'AI/ML' | 'Architecture';

interface Project {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  cat: string;
  image?: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp: string;
}

const THEMES: Record<ThemeColor, { primary: string, border: string, bg: string, text: string }> = {
  indigo: { primary: 'bg-indigo-600', border: 'border-indigo-500/20', bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
  emerald: { primary: 'bg-emerald-600', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  rose: { primary: 'bg-rose-600', border: 'border-rose-500/20', bg: 'bg-rose-500/10', text: 'text-rose-400' },
  amber: { primary: 'bg-amber-600', border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-400' },
};

// --- Default Data ---
const DEFAULT_TRANSLATIONS = {
  vi: {
    nav: { home: 'Trang chủ', about: 'Giới thiệu', skills: 'Kỹ năng', projects: 'Dự án', experience: 'Kinh nghiệm', lab: 'Phòng Lab', contact: 'Liên hệ', getInTouch: 'Liên hệ ngay' },
    hero: { badge: 'Sẵn sàng cho các cơ hội mới', titlePrefix: 'Kiến tạo', titleSuffix: 'Tương lai của Web.', bio: 'Tôi là Đồng Minh Phú, một kiến trúc sư phần mềm tận tâm với việc xây dựng các hệ thống hiệu suất cao và tích hợp AI trực quan.', explore: 'Khám phá sản phẩm' },
    about: { title: 'Bản sắc Kỹ thuật', stats: { projects: 'Dự án đã bàn giao', lines: 'Dòng mã nguồn' }, expTitle: '6+ NĂM', expDesc: 'Kỹ thuật hóa các giải pháp tác động cao.' },
    skills: { title: 'Năng lực Cốt lõi', subtitle: 'Nền tảng công nghệ tôi tin dùng.', cat1: 'Chuyên môn Frontend', cat2: 'Hệ thống Backend', cat3: 'Cloud & DevOps' },
    projects: { title: 'Dự án Tiêu biểu', subtitle: 'Trình diễn sự xuất sắc kỹ thuật.', filters: ['Tất cả', 'Ứng dụng Web', 'AI/ML', 'Kiến trúc'] },
    testimonials: { title: 'Đánh giá từ đối tác', subtitle: 'Những phản hồi về chất lượng dịch vụ và tư vấn kỹ thuật.' },
    codelab: { title: 'Code Lab', subtitle: 'Trình diễn những cấu trúc mã nguồn tối ưu.' },
    ailab: { title: 'AI Innovation Lab', subtitle: 'Mô tả ý tưởng của bạn, và tôi sẽ kiến tạo bản demo ngay lập tức.', placeholder: 'Ví dụ: Tạo landing page cho startup công nghệ xanh với phong cách tối giản...', button: 'Kiến tạo Demo', generating: 'Đang thiết lập cấu trúc...', result: 'Kết quả Demo' },
    newsletter: { title: 'Tech Insights', subtitle: 'Đăng ký nhận những phân tích chuyên sâu hàng tuần về Cloud & AI.', placeholder: 'Email của bạn...', button: 'Đăng ký' },
    contact: { title: 'Sẵn sàng khởi động', titleSuffix: 'dự án lớn tiếp theo?', labels: { name: 'Họ tên', email: 'Email', phone: 'Số điện thoại', message: 'Tin nhắn', send: 'Gửi yêu cầu', success: 'Cảm ơn! Tôi sẽ phản hồi sớm nhất.' } },
    chat: { welcome: "Chào mừng! Tôi là bản sao số của Phú. Tôi có thể giúp gì cho bạn?", agent: "Phú Agent v3.0", typing: "Đang gõ..." },
    terminal: { welcome: "Hệ điều hành PhúOS v1.0.0. Gõ 'help' để xem các lệnh.", placeholder: "Gõ lệnh tại đây..." },
    stats: { visits: 'Lượt truy cập' }
  },
  en: {
    nav: { home: 'Home', about: 'About', skills: 'Skills', projects: 'Projects', experience: 'Experience', lab: 'AI Lab', contact: 'Contact', getInTouch: 'Get in Touch' },
    hero: { badge: 'Available for new opportunities', titlePrefix: 'Engineering the', titleSuffix: 'Future of Web.', bio: "I'm Đồng Minh Phú, a software architect dedicated to building high-performance systems and intuitive AI integrations.", explore: 'Explore My Work' },
    about: { title: 'Engineering Identity', stats: { projects: 'Projects Shipped', lines: 'Lines of Code' }, expTitle: '6+ YRS', expDesc: 'Engineering high-impact solutions.' },
    skills: { title: 'Core Competencies', subtitle: 'The stack I trust for building scalable systems.', cat1: 'Frontend Expertise', cat2: 'Backend Systems', cat3: 'Cloud & DevOps' },
    projects: { title: 'Selected Projects', subtitle: 'Showcasing technical excellence.', filters: ['All', 'Web App', 'AI/ML', 'Architecture'] },
    testimonials: { title: 'Testimonials', subtitle: 'Feedback from partners on quality and technical consulting.' },
    codelab: { title: 'Code Lab', subtitle: 'Showcasing optimized architectural snippets.' },
    ailab: { title: 'AI Innovation Lab', subtitle: 'Describe your vision, and I will architect a live demo in seconds.', placeholder: 'e.g., A minimalist landing page for a sustainable fashion brand...', button: 'Generate Demo', generating: 'Architecting your vision...', result: 'Live Demo Result' },
    newsletter: { title: 'Tech Insights', subtitle: 'Subscribe for weekly deep dives into Cloud & AI.', placeholder: 'Your email...', button: 'Subscribe' },
    contact: { title: 'Ready to start', titleSuffix: 'the next big thing?', labels: { name: 'Full Name', email: 'Email', phone: 'Phone Number', message: 'Message', send: 'Send Inquiry', success: 'Thank you! I will get back to you soon.' } },
    chat: { welcome: "Welcome! I'm Phú's digital twin. How can I assist you today?", agent: "Phú Agent v3.0", typing: "Typing..." },
    terminal: { welcome: "PhúOS v1.0.0. Type 'help' for available commands.", placeholder: "Enter command..." },
    stats: { visits: 'Visits' }
  }
};

const DEFAULT_SKILLS = [
  { id: '1', cat: 'cat1', icon: 'Layout', items: ['React', 'Next.js', 'Tailwind', 'Framer Motion', 'TypeScript'] },
  { id: '2', cat: 'cat2', icon: 'Cpu', items: ['Go', 'Rust', 'Node.js', 'PostgreSQL', 'Redis'] },
  { id: '3', cat: 'cat3', icon: 'Globe', items: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'] },
];

const DEFAULT_PROJECTS: Project[] = [
  { id: '1', title: 'Nexus Core Platform', desc: 'Kiến trúc hệ thống Micro-services cho Fintech.', tags: ['Go', 'gRPC', 'AWS'], cat: 'Architecture' },
  { id: '2', title: 'OmniAI Engine', desc: 'Tích hợp AI dự đoán hành vi người dùng.', tags: ['Python', 'TensorFlow', 'React'], cat: 'AI/ML' },
  { id: '3', title: 'Quantum Dashboard', desc: 'Trình quản lý dữ liệu thời gian thực.', tags: ['Next.js', 'WebSockets'], cat: 'Web App' },
];

const DEFAULT_TESTIMONIALS = [
  { id: '1', author: 'CTO, TechVanguard', content: "Phú không chỉ là một lập trình viên giỏi, anh ấy là một đối tác chiến lược có tầm nhìn sâu sắc.", role: "Đối tác cấp cao" },
  { id: '2', author: 'CEO, InnovateX', content: "Giải pháp kiến trúc của Phú đã giúp chúng tôi scale hệ thống lên gấp 10 lần chỉ trong 3 tháng.", role: "Khách hàng" },
];

const DEFAULT_SOCIALS = {
  facebook: 'https://facebook.com',
  youtube: 'https://youtube.com',
  zalo: 'https://zalo.me',
  linkedin: 'https://linkedin.com',
  github: 'https://github.com'
};

const DEFAULT_CONTACT_INFO = {
  phone: '090 000 0000',
  email: 'phu@example.com',
  address: 'Hồ Chí Minh, Việt Nam'
};

const INITIAL_DATA = {
  translations: DEFAULT_TRANSLATIONS,
  skills: DEFAULT_SKILLS,
  projects: DEFAULT_PROJECTS,
  testimonials: DEFAULT_TESTIMONIALS,
  socials: DEFAULT_SOCIALS,
  contactInfo: DEFAULT_CONTACT_INFO,
  profileImage: null,
  bannerImage: null,
  visitCount: 0,
  inquiries: [] as Inquiry[],
  snapshots: [] as { id: string, date: string, label: string, data: any }[]
};

// --- Utilities ---
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    window.scrollTo({ top: id === 'home' ? 0 : element.offsetTop - 80, behavior: 'smooth' });
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- AI Demo Builder Sub-Component ---

const AiDemoBuilder = ({ t, theme }: { t: any, theme: ThemeColor }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [demoData, setDemoData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

  const generateDemo = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setDemoData(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a web application or landing page demo based on this prompt: "${prompt}". 
        
        RULES:
        1. Keep descriptions and content blocks concise (max 200 words per block).
        2. Ensure the JSON is complete and valid.
        3. Return ONLY a JSON object with this exact structure:
        {
          "title": "Project Name",
          "vibe": "minimalist | futuristic | corporate | playful",
          "hero": { "title": "...", "subtitle": "...", "cta": "..." },
          "features": [ { "icon": "zap|shield|cpu|globe", "title": "...", "desc": "..." } ],
          "contentBlocks": [ { "type": "text-image", "title": "...", "body": "..." } ],
          "footer": { "copyright": "..." }
        }`,
        config: {
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
          thinkingConfig: { thinkingBudget: 1024 },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              vibe: { type: Type.STRING },
              hero: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  cta: { type: Type.STRING },
                },
                required: ["title", "subtitle", "cta"]
              },
              features: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    icon: { type: Type.STRING },
                    title: { type: Type.STRING },
                    desc: { type: Type.STRING },
                  },
                  required: ["icon", "title", "desc"]
                }
              },
              contentBlocks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    body: { type: Type.STRING },
                  }
                }
              },
              footer: {
                type: Type.OBJECT,
                properties: {
                  copyright: { type: Type.STRING }
                }
              }
            },
            required: ["title", "vibe", "hero", "features"]
          }
        }
      });

      const rawText = response.text?.trim() || '{}';
      try {
        const data = JSON.parse(rawText);
        setDemoData(data);
      } catch (parseError) {
        console.error("JSON Parsing Error:", parseError, "Raw text:", rawText);
        alert("The AI generated a response that couldn't be parsed. This usually happens with very long requests. Please try a more specific or shorter prompt.");
      }
    } catch (error) {
      console.error("AI Gen Error", error);
      alert("Error generating demo. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getVibeStyles = (vibe: string) => {
    switch (vibe) {
      case 'futuristic': return 'from-indigo-900 to-black text-cyan-400';
      case 'minimalist': return 'from-slate-50 to-white text-slate-900';
      case 'corporate': return 'from-blue-800 to-blue-950 text-white';
      case 'playful': return 'from-rose-400 to-amber-400 text-white';
      default: return 'from-slate-900 to-black text-white';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div className="space-y-12">
      <div className="glass p-10 rounded-[3rem] border-white/5 shadow-2xl">
        <div className="flex flex-col gap-6">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.ailab.placeholder}
            className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl px-8 py-6 outline-none focus:border-indigo-500 transition-all resize-none text-lg font-medium"
          />
          <button 
            onClick={generateDemo}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-6 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${isGenerating ? 'bg-slate-800 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:scale-[1.02] shadow-[0_0_30px_rgba(99,102,241,0.4)]'}`}
          >
            {isGenerating ? (
              <>
                <RefreshCcw size={20} className="animate-spin" />
                {t.ailab.generating}
              </>
            ) : (
              <>
                <Wand2 size={20} />
                {t.ailab.button}
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {demoData && (
          <motion.div 
            key="demo-result"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center px-4">
              <h4 className="text-xl font-black uppercase tracking-widest text-indigo-400 flex items-center gap-3">
                <Sparkles size={24} /> {t.ailab.result}: {demoData.title}
              </h4>
              <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
                <button 
                  onClick={() => setViewMode('preview')}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  Preview
                </button>
                <button 
                  onClick={() => setViewMode('code')}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  Structure
                </button>
              </div>
            </div>

            {viewMode === 'preview' ? (
              <div className="rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-white min-h-[600px] flex flex-col">
                {/* Simulated Browser Bar */}
                <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-white rounded-lg py-1 px-4 text-[10px] text-slate-400 font-bold border border-slate-200 truncate">
                    https://phu.ai/lab/demo/{demoData.title.toLowerCase().replace(/\s+/g, '-')}
                  </div>
                </div>

                {/* Actual Demo Content */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar ${demoData.vibe === 'minimalist' ? 'text-slate-900 bg-white' : 'text-white bg-slate-950'}`}>
                  {/* Hero */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className={`py-32 px-10 text-center bg-gradient-to-br ${getVibeStyles(demoData.vibe)}`}
                  >
                    <motion.h1 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                      className="text-6xl font-black mb-8 tracking-tight"
                    >
                      {demoData.hero.title}
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-xl opacity-80 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
                    >
                      {demoData.hero.subtitle}
                    </motion.p>
                    <motion.button 
                      whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(99,102,241,0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      className="px-12 py-5 bg-white text-black font-black rounded-2xl shadow-2xl uppercase tracking-widest text-sm"
                    >
                      {demoData.hero.cta}
                    </motion.button>
                  </motion.div>

                  {/* Features */}
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="py-24 px-10 grid md:grid-cols-3 gap-10"
                  >
                    {demoData.features.map((f: any, i: number) => (
                      <motion.div 
                        key={i} 
                        variants={itemVariants}
                        whileHover={{ y: -10, scale: 1.02 }}
                        className={`p-10 rounded-[2.5rem] border transition-colors duration-300 ${demoData.vibe === 'minimalist' ? 'border-slate-100 bg-slate-50 hover:border-indigo-200' : 'border-white/5 bg-white/5 hover:border-indigo-500/30'}`}
                      >
                        <div className="mb-6 text-indigo-500">
                          {f.icon === 'zap' ? <Zap size={32} /> : f.icon === 'shield' ? <ShieldCheck size={32} /> : f.icon === 'cpu' ? <Cpu size={32} /> : <Globe size={32} />}
                        </div>
                        <h3 className="text-2xl font-black mb-4 tracking-tight">{f.title}</h3>
                        <p className="text-sm opacity-60 leading-relaxed">{f.desc}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Content Blocks */}
                  {demoData.contentBlocks?.map((block: any, i: number) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className={`py-24 px-10 border-t ${demoData.vibe === 'minimalist' ? 'border-slate-100' : 'border-white/5'}`}
                    >
                       <h2 className="text-4xl font-black mb-8 tracking-tight">{block.title}</h2>
                       <p className="text-lg opacity-70 leading-relaxed max-w-4xl">{block.body}</p>
                    </motion.div>
                  ))}

                  {/* Footer */}
                  <footer className={`py-16 px-10 text-center border-t ${demoData.vibe === 'minimalist' ? 'border-slate-100' : 'border-white/5'}`}>
                    <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40">{demoData.footer?.copyright || `© 2024 ${demoData.title}`}</p>
                  </footer>
                </div>
              </div>
            ) : (
              <div className="bg-black rounded-[2.5rem] p-8 font-mono text-sm border border-white/10 overflow-hidden relative group">
                <button 
                  onClick={() => { navigator.clipboard.writeText(JSON.stringify(demoData, null, 2)); alert('Copied to clipboard!'); }}
                  className="absolute top-6 right-6 p-3 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
                >
                  <Copy size={16} />
                </button>
                <pre className="text-green-400 custom-scrollbar overflow-auto max-h-[500px]">
                  {JSON.stringify(demoData, null, 2)}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Admin Components ---

const AdminDashboard = ({ isOpen, onClose, onSave, currentData, theme }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void, currentData: any, theme: ThemeColor }) => {
  const [activeTab, setActiveTab] = useState('General');
  const [data, setData] = useState(currentData);
  const [loginPass, setLoginPass] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setData(currentData);
  }, [isOpen, currentData]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPass === 'admin') setIsAuthenticated(true);
    else alert('Mật khẩu sai!');
  };

  const handleGeneralChange = (lang: Language, section: string, key: string, val: string) => {
    const newData = { ...data };
    if (!newData.translations[lang][section]) (newData.translations[lang] as any)[section] = {};
    (newData.translations[lang][section] as any)[key] = val;
    setData(newData);
  };

  const handleSocialChange = (key: string, val: string) => {
    setData({ ...data, socials: { ...data.socials, [key]: val } });
  };

  const handleContactInfoChange = (key: string, val: string) => {
    setData({ ...data, contactInfo: { ...data.contactInfo, [key]: val } });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      const newProjects = data.projects.map((p: Project) => 
        p.id === projectId ? { ...p, image: base64 } : p
      );
      setData({ ...data, projects: newProjects });
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setData({ ...data, profileImage: base64 });
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setData({ ...data, bannerImage: base64 });
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phu_portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      try {
        const imported = JSON.parse(text);
        setData(imported);
        alert('Data imported successfully. Don\'t forget to save!');
      } catch (err) {
        alert('Invalid backup file.');
      }
    }
  };

  const createSnapshot = () => {
    const label = prompt('Tên bản sao lưu (Snapshot):', `Snapshot ${new Date().toLocaleString()}`);
    if (label) {
      const newSnapshot = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        label,
        data: JSON.parse(JSON.stringify(data))
      };
      const newData = { ...data, snapshots: [newSnapshot, ...(data.snapshots || [])].slice(0, 10) };
      setData(newData);
      alert('Đã tạo bản sao lưu thành công!');
    }
  };

  const restoreSnapshot = (snapshot: any) => {
    if (confirm(`Khôi phục về bản sao lưu "${snapshot.label}"?`)) {
      const restoredData = { ...snapshot.data, snapshots: data.snapshots };
      setData(restoredData);
    }
  };

  const deleteInquiry = (id: string) => {
    if (confirm('Xóa yêu cầu này?')) {
      const newInquiries = data.inquiries.filter((inq: Inquiry) => inq.id !== id);
      setData({ ...data, inquiries: newInquiries });
    }
  };

  const clearAllInquiries = () => {
    if (confirm('Xóa tất cả yêu cầu liên hệ? Thao tác này không thể hoàn tác.')) {
      setData({ ...data, inquiries: [] });
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4">
      {!isAuthenticated ? (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black mb-6">Admin Access</h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="password" 
              placeholder="Nhập mật khẩu (admin)" 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-indigo-500"
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              autoFocus
            />
            <button className="w-full py-4 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-700 transition-all">Đăng nhập</button>
            <button type="button" onClick={onClose} className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Hủy bỏ</button>
          </form>
        </motion.div>
      ) : (
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-6xl h-[85vh] bg-slate-900 rounded-[3rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${THEMES[theme].bg} ${THEMES[theme].text}`}><Settings size={24} /></div>
              <div>
                <h2 className="text-xl font-black">Digital CMS Pro</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest bg-green-400/10 px-2 py-0.5 rounded">IndexedDB Active</span>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Database Version: {DB_VERSION}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={async () => { 
                  setIsSaving(true);
                  await onSave(data); 
                  setIsSaving(false);
                  onClose(); 
                }} 
                disabled={isSaving}
                className={`flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-xl font-bold text-sm transition-all ${isSaving ? 'opacity-50' : 'hover:bg-indigo-700'}`}
              >
                {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />} 
                {isSaving ? 'Đang lưu...' : 'Lưu & Đồng bộ'}
              </button>
              <button onClick={onClose} className="p-3 bg-white/5 rounded-xl hover:bg-white/10"><X size={20} /></button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 border-r border-white/5 p-6 space-y-2">
              {[
                { id: 'General', icon: Layout },
                { id: 'Inquiries', icon: Inbox, count: data.inquiries?.length || 0 },
                { id: 'Visuals', icon: ImageLucide },
                { id: 'Socials', icon: Globe },
                { id: 'Skills', icon: Cpu },
                { id: 'Projects', icon: Briefcase },
                { id: 'Testimonials', icon: Quote },
                { id: 'Database', icon: Database },
              ].map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  className={`w-full flex items-center justify-between text-left px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon size={18} />
                    {tab.id}
                  </div>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
              <div className="pt-10">
                <button 
                  onClick={() => { if(confirm('Reset toàn bộ dữ liệu về mặc định?')) { setData({ ...INITIAL_DATA, snapshots: data.snapshots }); } }}
                  className="w-full text-left px-5 py-3.5 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                >
                  <RefreshCcw size={16} /> Reset Default
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
              {activeTab === 'General' && (
                <>
                  <div className="p-8 bg-black/30 rounded-3xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-3 text-indigo-400 mb-2">
                      <BarChart3 size={24} />
                      <h3 className="text-sm font-black uppercase tracking-widest">Site Analytics</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Tổng lượt truy cập</label>
                        <input 
                          type="number"
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-xl font-black outline-none focus:border-indigo-500"
                          value={data.visitCount}
                          onChange={e => setData({...data, visitCount: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                  </div>
                  <SectionSet title="Hero (VI)" lang="vi" section="hero" fields={['badge', 'titlePrefix', 'titleSuffix', 'bio']} data={data} onChange={handleGeneralChange} />
                  <SectionSet title="Hero (EN)" lang="en" section="hero" fields={['badge', 'titlePrefix', 'titleSuffix', 'bio']} data={data} onChange={handleGeneralChange} />
                  <SectionSet title="Contact Info" fields={['phone', 'email', 'address']} data={{ socials: data.contactInfo }} section="socials" onChange={(lang: any, sec: any, field: string, val: string) => handleContactInfoChange(field, val)} />
                </>
              )}

              {activeTab === 'Inquiries' && (
                <div className="space-y-6">
                   <div className="flex justify-between items-center mb-8">
                     <div>
                       <h3 className="text-xl font-black uppercase tracking-widest text-indigo-400">Yêu cầu liên hệ</h3>
                       <p className="text-sm text-slate-500 mt-1">Lưu trữ từ Form Liên Hệ trên website.</p>
                     </div>
                     {data.inquiries.length > 0 && (
                       <button onClick={clearAllInquiries} className="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Xóa tất cả</button>
                     )}
                   </div>

                   <div className="space-y-4">
                     {data.inquiries && data.inquiries.length > 0 ? (
                       [...data.inquiries].reverse().map((inq: Inquiry) => (
                         <div key={inq.id} className="p-8 bg-black/30 rounded-[2rem] border border-white/5 group hover:border-indigo-500/20 transition-all">
                           <div className="flex justify-between items-start mb-6">
                             <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-lg">
                                 {inq.name.charAt(0).toUpperCase()}
                               </div>
                               <div>
                                 <h4 className="font-black text-xl">{inq.name}</h4>
                                 <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                                   <Clock size={12} /> {new Date(inq.timestamp).toLocaleString()}
                                 </div>
                               </div>
                             </div>
                             <button onClick={() => deleteInquiry(inq.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                           </div>
                           
                           <div className="grid md:grid-cols-3 gap-6 mb-6">
                             <div className="space-y-1">
                               <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block">Email</span>
                               <div className="text-sm text-indigo-300">{inq.email}</div>
                             </div>
                             <div className="space-y-1">
                               <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block">Số điện thoại</span>
                               <div className="text-sm">{inq.phone || 'N/A'}</div>
                             </div>
                           </div>

                           <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Tin nhắn</span>
                             <p className="text-slate-300 leading-relaxed text-sm italic">"{inq.message}"</p>
                           </div>
                         </div>
                       ))
                     ) : (
                       <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] text-slate-600">
                         <Inbox size={48} className="mx-auto mb-4 opacity-20" />
                         <p className="font-bold uppercase tracking-widest">Chưa có yêu cầu liên hệ nào.</p>
                       </div>
                     )}
                   </div>
                </div>
              )}

              {activeTab === 'Visuals' && (
                <div className="space-y-12">
                  <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">Banner & Ảnh đại diện</h3>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Ảnh Banner Hero (Khuyên dùng 1920x1080)</label>
                      <div 
                        onClick={() => bannerInputRef.current?.click()}
                        className="group relative aspect-video w-full rounded-3xl bg-slate-900 border-2 border-dashed border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3"
                      >
                        {data.bannerImage ? (
                          <>
                            <img src={data.bannerImage} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" alt="Banner Preview" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="flex flex-col items-center text-white">
                                <Upload size={32} />
                                <span className="text-sm font-bold mt-2">Thay đổi Banner</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center text-slate-500">
                            <ImageLucide size={48} />
                            <span className="text-xs font-bold mt-2">Tải ảnh Banner</span>
                          </div>
                        )}
                      </div>
                      <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleBannerUpload} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-10 pt-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Ảnh đại diện (Avatar)</label>
                        <div 
                          onClick={() => profileInputRef.current?.click()}
                          className="group relative aspect-square w-48 rounded-3xl bg-slate-900 border-2 border-dashed border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3"
                        >
                          {data.profileImage ? (
                            <>
                              <img src={data.profileImage} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" alt="Profile Preview" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload size={24} className="text-white" />
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center text-slate-500">
                              <ImageIcon size={32} />
                              <span className="text-xs font-bold mt-2">Tải Avatar</span>
                            </div>
                          )}
                        </div>
                        <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={handleProfileUpload} />
                      </div>
                      
                      <div className="space-y-4">
                        <SectionSet title="Thông tin bổ sung (VI)" lang="vi" section="about" fields={['title', 'expTitle', 'expDesc']} data={data} onChange={handleGeneralChange} />
                        <SectionSet title="About Info (EN)" lang="en" section="about" fields={['title', 'expTitle', 'expDesc']} data={data} onChange={handleGeneralChange} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Socials' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">Liên kết mạng xã hội</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.keys(data.socials).map(key => (
                      <div key={key} className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter ml-2">{key}</label>
                        <input 
                          className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
                          value={data.socials[key as keyof typeof data.socials]}
                          onChange={e => handleSocialChange(key, e.target.value)}
                          placeholder={`Link ${key}...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Skills' && (
                <div className="space-y-6">
                  {data.skills.map((skill: any, idx: number) => (
                    <div key={skill.id} className="p-6 bg-black/30 rounded-2xl border border-white/5">
                      <div className="flex justify-between mb-4">
                        <span className="font-bold text-indigo-400 uppercase text-xs tracking-widest">{skill.cat}</span>
                        <button onClick={() => {
                          const newSkills = [...data.skills];
                          newSkills.splice(idx, 1);
                          setData({...data, skills: newSkills});
                        }} className="text-rose-500"><Trash2 size={16} /></button>
                      </div>
                      <input 
                        className="w-full bg-transparent border-none text-xl font-bold outline-none mb-4" 
                        value={skill.items.join(', ')} 
                        onChange={e => {
                          const newSkills = [...data.skills];
                          newSkills[idx].items = e.target.value.split(',').map(s => s.trim());
                          setData({...data, skills: newSkills});
                        }}
                      />
                    </div>
                  ))}
                  <button onClick={() => setData({...data, skills: [...data.skills, { id: Date.now().toString(), cat: 'New', items: ['Skill 1'] }]})} className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-slate-500 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2"><Plus size={20} /> Thêm Kỹ năng</button>
                </div>
              )}

              {activeTab === 'Projects' && (
                <div className="space-y-8">
                   {data.projects.map((proj: Project, idx: number) => (
                    <div key={proj.id} className="p-8 bg-black/30 rounded-3xl border border-white/5 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Tiêu đề dự án</label>
                          <input className="w-full bg-transparent text-2xl font-black outline-none border-b border-transparent focus:border-indigo-500 pb-2" value={proj.title} onChange={e => {
                            const newProjects = [...data.projects];
                            newProjects[idx].title = e.target.value;
                            setData({...data, projects: newProjects});
                          }} />
                        </div>
                        <button onClick={() => {
                          const newProjects = [...data.projects];
                          newProjects.splice(idx, 1);
                          setData({...data, projects: newProjects});
                        }} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={18} /></button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Mô tả chi tiết</label>
                            <textarea className="w-full h-32 bg-slate-900/50 border border-white/10 rounded-xl p-4 text-sm text-slate-300 outline-none focus:border-indigo-500 transition-all resize-none" value={proj.desc} onChange={e => {
                              const newProjects = [...data.projects];
                              newProjects[idx].desc = e.target.value;
                              setData({...data, projects: newProjects});
                            }} />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Tags (phân cách bởi dấu phẩy)</label>
                            <input className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-sm text-slate-300 outline-none focus:border-indigo-500 transition-all" value={proj.tags.join(', ')} onChange={e => {
                              const newProjects = [...data.projects];
                              newProjects[idx].tags = e.target.value.split(',').map(s => s.trim());
                              setData({...data, projects: newProjects});
                            }} />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Hình ảnh đại diện (IndexedDB High-Cap)</label>
                          <div 
                            onClick={() => {
                              setEditingProjectId(proj.id);
                              fileInputRef.current?.click();
                            }}
                            className="group relative aspect-video rounded-2xl bg-slate-900 border-2 border-dashed border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3"
                          >
                            {proj.image ? (
                              <>
                                <img src={proj.image} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" alt={proj.title} />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="flex flex-col items-center text-white">
                                    <Upload size={24} />
                                    <span className="text-xs font-bold mt-2">Thay đổi ảnh</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                                  <ImageIcon size={24} />
                                </div>
                                <span className="text-xs font-bold text-slate-400">Tải ảnh lên (Phá bỏ giới hạn 5MB)</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={e => editingProjectId && handleImageUpload(e, editingProjectId)} 
                  />
                  <button onClick={() => setData({...data, projects: [...data.projects, { id: Date.now().toString(), title: 'Dự án mới', desc: 'Mô tả dự án...', tags: [], cat: 'Web App' }]})} className="w-full py-8 border-2 border-dashed border-white/10 rounded-3xl text-slate-500 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-widest"><Plus size={24} /> Thêm Dự án Mới</button>
                </div>
              )}

              {activeTab === 'Database' && (
                <div className="space-y-12">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-8 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/20 space-y-4">
                      <div className="flex items-center gap-4 text-indigo-400 mb-2">
                        <Download size={32} />
                        <h4 className="text-lg font-black uppercase tracking-widest">Backup & Export</h4>
                      </div>
                      <p className="text-sm text-slate-400">Tải xuống toàn bộ dữ liệu trang web (bao gồm cả ảnh chất lượng cao) thành một tệp JSON duy nhất để lưu trữ bên ngoài.</p>
                      <button onClick={handleExport} className="w-full py-4 bg-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                        Xuất dữ liệu (.json)
                      </button>
                    </div>

                    <div className="p-8 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 space-y-4">
                      <div className="flex items-center gap-4 text-emerald-400 mb-2">
                        <Upload size={32} />
                        <h4 className="text-lg font-black uppercase tracking-widest">Import Data</h4>
                      </div>
                      <p className="text-sm text-slate-400">Khôi phục trang web từ một tệp sao lưu đã lưu trước đó. Lưu ý: Thao tác này sẽ ghi đè dữ liệu hiện tại.</p>
                      <label className="w-full py-4 bg-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all cursor-pointer">
                        <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                        Nhập dữ liệu
                      </label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="text-xl font-black uppercase tracking-widest text-indigo-400 flex items-center gap-3">
                          <History size={24} /> Snapshots History
                        </h4>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Lưu trữ tối đa 10 phiên bản gần nhất trong trình duyệt</p>
                      </div>
                      <button onClick={createSnapshot} className="px-6 py-3 bg-white/5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
                        <Plus size={18} /> Tạo Snapshot
                      </button>
                    </div>

                    <div className="space-y-3">
                      {data.snapshots && data.snapshots.length > 0 ? (
                        data.snapshots.map((snap: any) => (
                          <div key={snap.id} className="flex items-center justify-between p-6 bg-black/30 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500">
                                <HardDrive size={24} />
                              </div>
                              <div>
                                <div className="font-bold text-lg">{snap.label}</div>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{new Date(snap.date).toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => restoreSnapshot(snap)} className="px-5 py-2.5 bg-indigo-600/10 text-indigo-400 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Restore</button>
                              <button onClick={() => {
                                const newSnaps = data.snapshots.filter((s: any) => s.id !== snap.id);
                                setData({ ...data, snapshots: newSnaps });
                              }} className="p-2.5 text-slate-600 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] text-slate-600">
                          Chưa có bản sao lưu nào được tạo.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Testimonials' && (
                <div className="space-y-6">
                  {data.testimonials.map((testi: any, idx: number) => (
                    <div key={testi.id} className="p-6 bg-black/30 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex justify-between">
                        <input className="bg-transparent font-bold outline-none" value={testi.author} onChange={e => {
                          const newTesti = [...data.testimonials];
                          newTesti[idx].author = e.target.value;
                          setData({...data, testimonials: newTesti});
                        }} />
                        <button onClick={() => {
                          const newTesti = [...data.testimonials];
                          newTesti.splice(idx, 1);
                          setData({...data, testimonials: newTesti});
                        }} className="text-rose-500"><Trash2 size={16} /></button>
                      </div>
                      <textarea className="w-full bg-transparent border border-white/5 rounded-lg p-3 text-sm text-slate-400 outline-none italic" value={testi.content} onChange={e => {
                        const newTesti = [...data.testimonials];
                        newTesti[idx].content = e.target.value;
                        setData({...data, testimonials: newTesti});
                      }} />
                    </div>
                  ))}
                  <button onClick={() => setData({...data, testimonials: [...data.testimonials, { id: Date.now().toString(), author: 'Tên đối tác', content: 'Nội dung đánh giá...', role: 'CEO' }]})} className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-slate-500 flex items-center justify-center gap-2"><Plus size={20} /> Thêm Đánh giá</button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const SectionSet = ({ title, lang, section, fields, data, onChange }: any) => (
  <div className="space-y-4">
    <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">{title}</h3>
    <div className="grid grid-cols-1 gap-4">
      {fields.map((f: string) => (
        <div key={f} className="space-y-1">
          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter ml-2">{f}</label>
          <input 
            className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/20"
            value={lang ? data.translations[lang][section]?.[f] || '' : (data.socials?.[f] || data.contactInfo?.[f])}
            onChange={e => onChange(lang, section, f, e.target.value)}
          />
        </div>
      ))}
    </div>
  </div>
);

// --- Sub-Components ---

const ReadingProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-indigo-500 origin-left z-[200] shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ scaleX }} />;
};

const SectionHeading = ({ children, icon: Icon, subtitle, theme }: { children: any, icon: any, subtitle?: string, theme: ThemeColor }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
    <div className="flex items-center gap-4 mb-3">
      <div className={`p-3 rounded-2xl ${THEMES[theme].bg} ${THEMES[theme].text} border ${THEMES[theme].border} shadow-xl`}>
        <Icon size={28} />
      </div>
      <h2 className="text-4xl font-black tracking-tight">{children}</h2>
    </div>
    {subtitle && <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">{subtitle}</p>}
  </motion.div>
);

const TerminalOverlay = ({ isOpen, onClose, t }: { isOpen: boolean, onClose: () => void, t: any }) => {
  const [history, setHistory] = useState<{cmd: string, res: string}[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    let res = "Command not found. Type 'help' for list.";
    const cmd = input.toLowerCase().trim();

    if (cmd === 'help') res = "Available: whois, skills, projects, contact, clear, exit, dbstats";
    else if (cmd === 'whois') res = "Đồng Minh Phú - Senior Software Engineer & Architect.";
    else if (cmd === 'skills') res = "Frontend: React, Next.js. Backend: Go, Rust. Infra: AWS, K8s.";
    else if (cmd === 'dbstats') res = `DB: IndexedDB, Model: Gemini 3 Flash, Store: siteData, Mode: Premium Persistence.`;
    else if (cmd === 'clear') { setHistory([]); setInput(''); return; }
    else if (cmd === 'exit') { onClose(); return; }

    setHistory([...history, { cmd: input, res }]);
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-4xl aspect-video bg-black rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden font-mono text-sm">
            <div className="p-4 bg-slate-900 border-b border-white/5 flex justify-between items-center">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">PhúOS Terminal v2.1 (IndexedDB Edition)</span>
              <button onClick={onClose}><X size={18} className="text-slate-500 hover:text-white" /></button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar text-green-400 space-y-4">
              <p className="text-slate-500">{t.terminal.welcome}</p>
              {history.map((h, i) => (
                <div key={i}>
                  <p><span className="text-indigo-400">guest@phu:~$</span> {h.cmd}</p>
                  <p className="text-slate-300 ml-4">{h.res}</p>
                </div>
              ))}
              <div ref={endRef} />
              <form onSubmit={handleCommand} className="flex gap-2 items-center">
                <span className="text-indigo-400">guest@phu:~$</span>
                <input autoFocus value={input} onChange={e => setInput(e.target.value)} className="bg-transparent border-none outline-none flex-1 text-green-400" />
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main Components ---

const App = () => {
  const [lang, setLang] = useState<Language>('vi');
  const [theme, setTheme] = useState<ThemeColor>('indigo');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [siteData, setSiteData] = useState<any>(INITIAL_DATA);

  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await getFromDB('portfolio_data');
        let currentData = INITIAL_DATA;
        if (saved) {
          // Merge with INITIAL_DATA to ensure new fields like inquiries exist
          currentData = { ...INITIAL_DATA, ...saved };
        } else {
          const legacy = localStorage.getItem('phu_portfolio_data_v3');
          if (legacy) {
            const parsed = JSON.parse(legacy);
            currentData = { ...INITIAL_DATA, ...parsed };
          }
        }
        
        const updatedData = { ...currentData, visitCount: (currentData.visitCount || 0) + 1 };
        setSiteData(updatedData);
        await saveToDB('portfolio_data', updatedData);
        
      } catch (e) {
        console.error("DB Load Error", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  const t = siteData.translations[lang];

  const handleSaveData = async (newData: any) => {
    setSiteData(newData);
    await saveToDB('portfolio_data', newData);
    localStorage.setItem('phu_portfolio_data_v3', JSON.stringify(newData));
  };

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        setIsAdminOpen(true);
      }
    };
    
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('keydown', handleShortcut);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('keydown', handleShortcut);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newInquiry: Inquiry = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      message: formData.get('message') as string,
      timestamp: new Date().toISOString()
    };

    // Auto-save to inquiries array
    const updatedData = {
      ...siteData,
      inquiries: [newInquiry, ...(siteData.inquiries || [])]
    };

    setSiteData(updatedData);
    await saveToDB('portfolio_data', updatedData);
    
    setIsFormSubmitted(true);
    e.currentTarget.reset();
    setTimeout(() => setIsFormSubmitted(false), 5000);
  };

  const SocialLinks = ({ className = "" }) => (
    <div className={`flex gap-4 ${className}`}>
      {siteData.socials.facebook && <a href={siteData.socials.facebook} target="_blank" className="p-3 bg-white/5 rounded-xl hover:bg-indigo-600 transition-all text-slate-400 hover:text-white" rel="noreferrer"><Facebook size={20} /></a>}
      {siteData.socials.youtube && <a href={siteData.socials.youtube} target="_blank" className="p-3 bg-white/5 rounded-xl hover:bg-rose-600 transition-all text-slate-400 hover:text-white" rel="noreferrer"><Youtube size={20} /></a>}
      {siteData.socials.zalo && <a href={siteData.socials.zalo} target="_blank" className="p-3 bg-white/5 rounded-xl hover:bg-blue-500 transition-all text-slate-400 hover:text-white" rel="noreferrer"><MessageCircle size={20} /></a>}
      {siteData.socials.linkedin && <a href={siteData.socials.linkedin} target="_blank" className="p-3 bg-white/5 rounded-xl hover:bg-indigo-500 transition-all text-slate-400 hover:text-white" rel="noreferrer"><Linkedin size={20} /></a>}
      {siteData.socials.github && <a href={siteData.socials.github} target="_blank" className="p-3 bg-white/5 rounded-xl hover:bg-slate-700 transition-all text-slate-400 hover:text-white" rel="noreferrer"><Github size={20} /></a>}
    </div>
  );

  if (!isLoaded) return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-black text-slate-800 text-4xl animate-pulse">PHÚOS DB BOOTING...</div>;

  return (
    <div className={`min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500 selection:text-white`}>
      <ReadingProgress />
      <TerminalOverlay isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} t={t} />
      <AdminDashboard 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        onSave={handleSaveData} 
        currentData={siteData} 
        theme={theme}
      />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] py-6 glass">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <button onClick={() => scrollToSection('home')} className="text-2xl font-black tracking-tighter text-gradient">PHÚ.</button>
          
          <div className="hidden md:flex items-center gap-8">
            {['Home', 'About', 'Skills', 'Lab', 'Projects', 'Contact'].map(item => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-sm font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest">
                {t.nav[item.toLowerCase() as keyof typeof t.nav]}
              </button>
            ))}
            
            <div className="flex gap-2 p-1 bg-slate-900 rounded-full border border-white/5">
              {Object.keys(THEMES).map(color => (
                <button 
                  key={color} 
                  onClick={() => setTheme(color as ThemeColor)} 
                  className={`w-6 h-6 rounded-full ${THEMES[color as ThemeColor].primary} transition-transform ${theme === color ? 'scale-125 ring-2 ring-white' : 'scale-90 hover:scale-110'}`} 
                />
              ))}
            </div>

            <button onClick={() => setIsTerminalOpen(true)} className="p-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
              <TerminalIcon size={18} />
            </button>
            
            <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="text-xs font-black text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg">
              {lang.toUpperCase()}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center pt-20 relative overflow-hidden">
        {/* Background Layer */}
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          {siteData.bannerImage ? (
            <div className="absolute inset-0">
               <img src={siteData.bannerImage} className="w-full h-full object-cover opacity-30" alt="Banner" />
               <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-[#020617]/80 to-[#020617]" />
            </div>
          ) : (
            <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] ${theme === 'indigo' ? 'bg-indigo-600/10' : theme === 'emerald' ? 'bg-emerald-600/10' : 'bg-rose-600/10'} rounded-full blur-[180px]`} />
          )}
        </div>

        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest mb-10 text-slate-400">
              <Sparkles size={14} className="text-indigo-400" />
              {t.hero.badge}
            </div>
            <h1 className="text-7xl md:text-9xl font-black mb-10 leading-[0.95] tracking-tighter">
              {t.hero.titlePrefix} <br />
              <span className={`bg-gradient-to-r ${theme === 'indigo' ? 'from-indigo-400 to-cyan-400' : theme === 'emerald' ? 'from-emerald-400 to-cyan-400' : 'from-rose-400 to-amber-400'} bg-clip-text text-transparent`}>{t.hero.titleSuffix}</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl leading-relaxed mb-12 font-medium">{t.hero.bio}</p>
            <div className="flex flex-wrap gap-6 items-center">
              <button onClick={() => scrollToSection('about')} className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-3">
                {t.hero.explore} <ChevronRight size={20} />
              </button>
              <SocialLinks />
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <SectionHeading icon={User} subtitle={t.about.expDesc} theme={theme}>{t.about.title}</SectionHeading>
          
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className={`absolute -inset-4 rounded-[4rem] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${THEMES[theme].bg}`} />
              <div className="relative aspect-square rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
                {siteData.profileImage ? (
                  <img src={siteData.profileImage} alt="Đồng Minh Phú" loading="lazy" decoding="async" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-900">
                    <User size={80} strokeWidth={1} />
                    <span className="text-xs font-bold uppercase tracking-widest mt-4">Photo Placeholder</span>
                  </div>
                )}
              </div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="absolute -bottom-10 -right-10 glass p-8 rounded-3xl border border-white/10 shadow-2xl hidden md:block"
              >
                <div className={`text-4xl font-black mb-1 ${THEMES[theme].text}`}>{t.about.expTitle}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.about.expDesc}</div>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <h3 className="text-3xl font-black leading-tight">Mở khóa tiềm năng kỹ thuật với các giải pháp phần mềm hiện đại.</h3>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Tôi chuyên về thiết kế các hệ thống có khả năng mở rộng cao, tập trung vào hiệu năng thực tế và trải nghiệm người dùng cuối. Hành trình của tôi được định nghĩa bởi sự tò mò và cam kết không ngừng nghỉ đối với sự xuất sắc của mã nguồn.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${THEMES[theme].bg} ${THEMES[theme].text}`}>
                    <Trophy size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-black">50+</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.about.stats.projects}</div>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${THEMES[theme].bg} ${THEMES[theme].text}`}>
                    <Target size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-black">1M+</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.about.stats.lines}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Code Lab Section */}
      <section className="py-32 bg-slate-950/50">
        <div className="container mx-auto px-6">
          <SectionHeading icon={Code} subtitle={t.codelab.subtitle} theme={theme}>{t.codelab.title}</SectionHeading>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold">Tối ưu hiệu năng kiến trúc Micro-frontend</h3>
              <p className="text-lg text-slate-400">Giải pháp xử lý state đồng nhất giữa các module độc lập bằng cách sử dụng Custom Events và Shared Service Layer.</p>
              <div className="flex gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/5">
                  <Zap size={24} className="text-yellow-400 mb-2" />
                  <div className="text-sm font-bold text-slate-300">LCP &lt; 1.2s</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/5">
                  <ShieldCheck size={24} className="text-green-400 mb-2" />
                  <div className="text-sm font-bold text-slate-300">ISO/IEC 27001</div>
                </div>
              </div>
            </div>
            <div className="p-1 rounded-3xl bg-gradient-to-br from-white/10 to-transparent">
              <div className="bg-black rounded-[1.4rem] p-8 font-mono text-sm overflow-hidden">
                <div className="flex gap-2 mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                </div>
                <pre className="text-indigo-300">
{`const useOptimization = (config) => {
  const [perf, setPerf] = useState(0);
  
  // Real-time architecture analysis
  useEffect(() => {
    const report = Performance.audit(config);
    setPerf(report.score);
  }, [config]);

  return { score: perf, status: 'OPTIMIZED' };
};`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Innovation Lab */}
      <section id="lab" className="py-32 relative">
        <div className="absolute inset-0 bg-indigo-600/5 -z-10 blur-[120px]" />
        <div className="container mx-auto px-6">
          <SectionHeading icon={Wand2} subtitle={t.ailab.subtitle} theme={theme}>{t.ailab.title}</SectionHeading>
          <AiDemoBuilder t={t} theme={theme} />
        </div>
      </section>

      {/* Projects Grid */}
      <section id="projects" className="py-32">
        <div className="container mx-auto px-6">
          <SectionHeading icon={Briefcase} subtitle={t.projects.subtitle} theme={theme}>{t.projects.title}</SectionHeading>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {siteData.projects.map((proj: Project) => (
              <motion.div key={proj.id} whileHover={{ y: -10 }} className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl">
                {proj.image ? (
                  <img src={proj.image} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={proj.title} />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme === 'indigo' ? 'from-indigo-900/40 to-slate-900' : theme === 'emerald' ? 'from-emerald-900/40 to-slate-900' : 'from-rose-900/40 to-slate-900'}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />
                <div className="absolute bottom-0 left-0 right-0 p-10 z-20">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-3 block">{proj.cat}</span>
                  <h3 className="text-2xl font-black mb-4">{proj.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2">{proj.desc}</p>
                  <div className="flex gap-2 flex-wrap mb-8">
                    {proj.tags?.map((tag: string) => <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase">{tag}</span>)}
                  </div>
                  <button className="flex items-center gap-2 text-sm font-black group-hover:gap-4 transition-all uppercase tracking-widest">
                    VIEW PROJECT <ChevronRight size={16} className="text-indigo-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-32 bg-slate-950">
        <div className="container mx-auto px-6">
          <SectionHeading icon={Layers} theme={theme}>{t.skills.title}</SectionHeading>
          <div className="grid md:grid-cols-3 gap-8">
            {siteData.skills.map((skill: any) => (
              <div key={skill.id} className="p-10 rounded-[2.5rem] bg-slate-900/50 border border-white/5 hover:border-indigo-500/20 transition-all">
                <div className={`p-4 rounded-2xl inline-block mb-8 ${THEMES[theme].bg} ${THEMES[theme].text}`}>
                  {skill.icon === 'Layout' ? <Layout /> : skill.icon === 'Cpu' ? <Cpu /> : <Globe />}
                </div>
                <h3 className="text-2xl font-black mb-6">{t.skills[skill.cat as keyof typeof t.skills] || skill.cat}</h3>
                <div className="flex flex-wrap gap-2">
                  {skill.items.map((s: string) => (
                    <span key={s} className="px-4 py-2 rounded-xl bg-slate-950 border border-white/5 text-slate-400 text-xs font-bold">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <SectionHeading icon={Quote} subtitle={t.testimonials.subtitle} theme={theme}>{t.testimonials.title}</SectionHeading>
          <div className="grid md:grid-cols-3 gap-8">
            {siteData.testimonials.map((testi: any) => (
              <motion.div key={testi.id} whileHover={{ y: -10 }} className="p-10 glass rounded-[2.5rem] border-white/5 relative">
                <div className="flex gap-1 mb-6 text-yellow-500">
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                </div>
                <p className="text-slate-300 text-lg italic mb-8">"{testi.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800" />
                  <div>
                    <div className="font-bold">{testi.author}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{testi.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-slate-950/50">
        <div className="container mx-auto px-6">
          <SectionHeading icon={Mail} subtitle={t.contact.titleSuffix} theme={theme}>{t.contact.title}</SectionHeading>
          <div className="grid lg:grid-cols-2 gap-20">
            <div className="space-y-12">
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl ${THEMES[theme].bg} ${THEMES[theme].text}`}><Phone size={24} /></div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t.contact.labels.phone}</div>
                    <div className="text-xl font-bold">{siteData.contactInfo.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl ${THEMES[theme].bg} ${THEMES[theme].text}`}><Mail size={24} /></div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t.contact.labels.email}</div>
                    <div className="text-xl font-bold">{siteData.contactInfo.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl ${THEMES[theme].bg} ${THEMES[theme].text}`}><MapPin size={24} /></div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Location</div>
                    <div className="text-xl font-bold">{siteData.contactInfo.address}</div>
                  </div>
                </div>
              </div>

              <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden border border-white/10 group shadow-2xl">
                <iframe 
                  title="Office Location"
                  className="w-full h-full grayscale brightness-[0.4] contrast-[1.2] invert-[0.9] hue-rotate-[180deg]"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(siteData.contactInfo.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0}
                ></iframe>
                <div className="absolute inset-0 bg-transparent z-10 cursor-default" />
              </div>

              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">Kết nối trực tiếp qua</h4>
                <SocialLinks />
              </div>
            </div>

            <div className="glass p-10 rounded-[3rem] border-white/5">
              {isFormSubmitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black mb-4">{t.contact.labels.success}</h3>
                </motion.div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">{t.contact.labels.name}</label>
                      <input name="name" required className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">{t.contact.labels.email}</label>
                      <input name="email" required type="email" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">{t.contact.labels.phone}</label>
                    <input name="phone" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">{t.contact.labels.message}</label>
                    <textarea name="message" required className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all resize-none" />
                  </div>
                  <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3">
                    <Send size={18} /> {t.contact.labels.send}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-32 container mx-auto px-6">
        <div className={`p-16 md:p-24 rounded-[3.5rem] ${THEMES[theme].primary} text-white relative overflow-hidden flex flex-col items-center text-center`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-5xl font-black mb-6">{t.newsletter.title}</h2>
            <p className="text-xl text-white/80 mb-10">{t.newsletter.subtitle}</p>
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <input placeholder={t.newsletter.placeholder} className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-5 text-white placeholder:text-white/40 outline-none" />
              <button className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-slate-100 transition-all">{t.newsletter.button}</button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-12">
            <button onClick={() => scrollToSection('home')} className="text-3xl font-black tracking-tighter text-gradient">PHÚ.</button>
            <div className="flex gap-8">
              {['Home', 'About', 'Skills', 'Lab', 'Projects', 'Contact'].map(item => (
                <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-xs font-bold text-slate-500 hover:text-white transition-all uppercase tracking-widest">
                  {t.nav[item.toLowerCase() as keyof typeof t.nav]}
                </button>
              ))}
            </div>
            <SocialLinks />
          </div>
          
          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
              <BarChart3 size={18} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {t.stats.visits}: <span className="text-white text-sm ml-1">{siteData.visitCount?.toLocaleString() || 0}</span>
              </span>
            </div>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">© 2024 ĐỒNG MINH PHÚ STUDIO — BUILT WITH ART & CODE & INDEXEDDB</p>
          </div>
          
          <div className="flex justify-center gap-6">
            <button onClick={() => setIsAdminOpen(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:text-white transition-all">
              <Lock size={12} /> Digital CMS Pro
            </button>
          </div>
        </div>
      </footer>

      {/* Chat Assistant */}
      <ChatAssistant lang={lang} t={t} theme={theme} />

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scrollToSection('home')}
            className={`fixed bottom-10 left-10 z-[120] w-14 h-14 rounded-2xl ${THEMES[theme].primary} text-white shadow-2xl flex items-center justify-center border border-white/10`}
          >
            <ArrowUp size={24} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChatAssistant = ({ lang, t, theme }: { lang: Language, t: any, theme: ThemeColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => { setMessages([{role: 'bot', text: t.chat.welcome}]); }, [lang, t.chat.welcome]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, {role: 'user', text: userText}]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: `You are Phú's Digital Representative. Professional, witty, and extremely technical. Respond in ${lang}. Mention that you are powered by Gemini 3 and a custom IndexedDB architecture.`,
        }
      });
      setMessages(prev => [...prev, {role: 'bot', text: response.text || ''}]);
    } catch (e) {
      setMessages(prev => [...prev, {role: 'bot', text: 'Disconnected.'}]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[120]">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="absolute bottom-24 right-0 w-[380px] h-[500px] glass rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border-white/10">
            <div className={`p-6 ${THEMES[theme].primary} flex justify-between items-center`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center"><Zap size={20} /></div>
                <div className="font-black text-sm">{t.chat.agent}</div>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-3xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-white/5'}`}>{m.text}</div>
                </div>
              ))}
              {isTyping && <div className="text-xs text-slate-500 animate-pulse">{t.chat.typing}</div>}
            </div>
            <div className="p-4 bg-slate-900/50 border-t border-white/5">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500" placeholder="Type a message..." />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setIsOpen(!isOpen)} className={`w-16 h-16 rounded-3xl ${THEMES[theme].primary} text-white shadow-2xl flex items-center justify-center`}><MessageSquare size={28} /></button>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
