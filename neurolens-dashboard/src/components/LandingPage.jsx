import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Brain, Upload, Shield, MessageSquare, Search, ArrowRight,
    Menu, X, Zap, Database, Monitor, FlaskConical, Cpu, FileImage,
    Stethoscope, Building2, GraduationCap, Microscope, Activity,
    Eye, Lock, Play
} from 'lucide-react';
import './LandingPage.css';

/* ── Animated Counter ── */
function useCounter(end, duration = 1800) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const t0 = performance.now();
                const step = (now) => {
                    const p = Math.min((now - t0) / duration, 1);
                    setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
                    if (p < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            }
        }, { threshold: 0.3 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration]);

    return { count, ref };
}

export default function LandingPage({ onGetStarted }) {
    const [navScrolled, setNavScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const canvasRef = useRef(null);
    const revealRefs = useRef([]);

    const acc = useCounter(95, 1600);
    const spd = useCounter(3, 1000);
    const types = useCounter(4, 900);
    const scans = useCounter(10000, 2000);

    /* Navbar scroll */
    useEffect(() => {
        const fn = () => setNavScrolled(window.scrollY > 40);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    /* Neural canvas */
    useEffect(() => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext('2d');
        let nodes = [], raf;

        const resize = () => {
            c.width = c.offsetWidth * devicePixelRatio;
            c.height = c.offsetHeight * devicePixelRatio;
            ctx.scale(devicePixelRatio, devicePixelRatio);
        };
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < 70; i++) {
            nodes.push({
                x: Math.random() * c.offsetWidth,
                y: Math.random() * c.offsetHeight,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                r: Math.random() * 1.5 + 0.4,
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, c.offsetWidth, c.offsetHeight);
            for (const n of nodes) {
                n.x += n.vx; n.y += n.vy;
                if (n.x < 0 || n.x > c.offsetWidth) n.vx *= -1;
                if (n.y < 0 || n.y > c.offsetHeight) n.vy *= -1;
            }
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.04 * (1 - d / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }
            for (const n of nodes) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
                ctx.fill();
            }
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
    }, []);

    /* Scroll reveal */
    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
        );
        revealRefs.current.forEach(el => el && obs.observe(el));
        return () => obs.disconnect();
    }, []);

    const addRef = useCallback((el) => {
        if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
    }, []);

    const scrollTo = (id) => {
        setMobileOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    /* Data */
    const features = [
        { icon: <Eye size={20} />, title: 'AI Tumor Detection', desc: 'Deep learning algorithms detect brain tumors with clinical-grade accuracy from a single MRI scan.' },
        { icon: <Cpu size={20} />, title: 'Smart Classification', desc: 'Classifies tumors into glioma, meningioma, pituitary, or healthy — with confidence scoring.' },
        { icon: <FileImage size={20} />, title: 'Multi-Format Upload', desc: 'Supports DICOM, PNG, and JPG formats with drag-and-drop and 512×512+ resolution validation.' },
        { icon: <Shield size={20} />, title: 'Clinical Dashboard', desc: 'Secure, HIPAA-aware interface with authentication, scan history, and professional reports.' },
        { icon: <MessageSquare size={20} />, title: 'AI Clinical Chat', desc: 'Conversational AI assistant explains findings and answers diagnostic questions in real-time.' },
        { icon: <Activity size={20} />, title: 'Real-Time Analysis', desc: 'Get results in under 3 seconds. Watch the AI analyze your scan with a live progress feed.' },
    ];

    const steps = [
        { icon: <Upload size={20} />, title: 'Upload MRI', desc: 'Drag & drop your brain scan in DICOM, PNG, or JPG format.' },
        { icon: <Zap size={20} />, title: 'AI Analysis', desc: 'CNN model processes scan through multi-layer feature extraction.' },
        { icon: <Search size={20} />, title: 'Detection', desc: 'AI identifies, localizes, and classifies potential tumors.' },
        { icon: <Monitor size={20} />, title: 'View Results', desc: 'Review classification, segmentation, and clinical insights.' },
    ];

    const tech = [
        { icon: <Monitor size={24} />, name: 'React + Vite', desc: 'Blazing-fast frontend with HMR and optimized production builds.' },
        { icon: <FlaskConical size={24} />, name: 'Flask API', desc: 'Lightweight Python backend for image processing and model inference.' },
        { icon: <Brain size={24} />, name: 'CNN Model', desc: 'Convolutional network trained on 10,000+ labeled brain MRI scans.' },
        { icon: <Database size={24} />, name: 'DICOM Engine', desc: 'Full DICOM standard support for clinical-grade medical imaging.' },
    ];

    const users = [
        { icon: <Stethoscope size={24} />, title: 'Radiologists', desc: 'AI-assisted second opinion for faster, more confident diagnoses.' },
        { icon: <Building2 size={24} />, title: 'Hospitals', desc: 'Streamline radiology workflows with integrated AI screening.' },
        { icon: <Microscope size={24} />, title: 'Researchers', desc: 'Automated analysis for large-scale brain tumor research studies.' },
        { icon: <GraduationCap size={24} />, title: 'AI Researchers', desc: 'Benchmark deep learning architectures for medical imaging.' },
    ];

    const navLinks = ['Features', 'How It Works', 'Technology'];

    return (
        <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">

            {/* ═══════════ NAVBAR ═══════════ */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navScrolled ? 'nl-nav-scrolled' : 'bg-white/60 backdrop-blur-md'}`}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                                <Brain size={16} className="text-white" />
                            </div>
                            <span className="text-lg font-bold text-slate-900">Neuro<span className="text-blue-600">Lens</span></span>
                        </div>

                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map(l => (
                                <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/ /g, '-'))}
                                    className="px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all">
                                    {l}
                                </button>
                            ))}
                            <div className="w-px h-5 bg-slate-200 mx-2" />
                            <button onClick={onGetStarted}
                                className="px-5 py-2 text-[13px] font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center gap-1.5">
                                <Lock size={12} /> Sign In
                            </button>
                        </div>

                        <button className="md:hidden p-2 text-slate-500" onClick={() => setMobileOpen(!mobileOpen)}>
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="nl-mobile-panel md:hidden px-6 py-4 flex flex-col gap-1">
                        {navLinks.map(l => (
                            <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/ /g, '-'))}
                                className="text-left text-sm text-slate-600 hover:text-blue-600 py-2.5 px-3 rounded-lg hover:bg-blue-50 transition-all">
                                {l}
                            </button>
                        ))}
                        <button onClick={onGetStarted}
                            className="mt-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white text-center">
                            Sign In
                        </button>
                    </div>
                )}
            </nav>

            {/* ═══════════ HERO ═══════════ */}
            <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
                <canvas ref={canvasRef} className="nl-canvas" />
                <div className="nl-hero-bg" />
                <div className="nl-orb nl-orb-1" />
                <div className="nl-orb nl-orb-2" />
                <div className="nl-orb nl-orb-3" />

                <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
                        {/* Text */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 mb-8">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-xs font-semibold text-blue-600">AI-Powered Medical Imaging</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.12] tracking-tight mb-6 text-slate-900">
                                AI-Powered Brain{' '}
                                <span className="text-blue-600">Tumor Detection</span>{' '}
                                & Classification
                            </h1>

                            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10">
                                Upload MRI brain scans and receive instant AI-driven analysis.
                                Clinical-grade detection and classification — in under 3 seconds.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                                <button onClick={onGetStarted}
                                    className="group px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all flex items-center gap-2">
                                    Get Started Free
                                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                                <button onClick={onGetStarted}
                                    className="px-7 py-3.5 rounded-xl font-semibold text-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm">
                                    <Play size={14} className="text-blue-500" /> Watch Demo
                                </button>
                            </div>

                            {/* Stats */}
                            <div ref={acc.ref} className="flex items-center gap-8 sm:gap-10 mt-12 justify-center lg:justify-start">
                                {[
                                    { val: `${acc.count}%+`, label: 'Accuracy' },
                                    { val: `<${spd.count}s`, label: 'Analysis' },
                                    { val: types.count, label: 'Tumor Types' },
                                    { val: `${scans.count.toLocaleString()}+`, label: 'Scans Trained' },
                                ].map((s, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-xl font-bold text-blue-600">{s.val}</div>
                                        <div className="text-[11px] text-slate-400 mt-0.5 font-medium uppercase tracking-wider">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Brain */}
                        <div className="nl-brain-wrap">
                            <div className="nl-brain-glow" />
                            <div className="nl-orbit nl-orbit-1"><div className="nl-orbit-dot" /></div>
                            <div className="nl-orbit nl-orbit-2"><div className="nl-orbit-dot" /></div>
                            <div className="nl-orbit nl-orbit-3"><div className="nl-orbit-dot" /></div>
                            <div className="nl-scan-line" />

                            <svg className="nl-brain-svg" viewBox="0 0 200 200" fill="none">
                                <path d="M100 22 C62 22, 30 50, 25 88 C20 120, 38 150, 58 165 C70 175, 85 180, 100 180"
                                    stroke="url(#g1)" strokeWidth="1.5" className="nl-brain-path" />
                                <path d="M100 38 C70 38, 48 58, 43 88 C39 112, 50 138, 64 150 C73 158, 85 163, 100 163"
                                    stroke="url(#g2)" strokeWidth="1" className="nl-brain-path" opacity="0.6" />
                                <path d="M100 22 C138 22, 170 50, 175 88 C180 120, 162 150, 142 165 C130 175, 115 180, 100 180"
                                    stroke="url(#g1)" strokeWidth="1.5" className="nl-brain-path" />
                                <path d="M100 38 C130 38, 152 58, 157 88 C161 112, 150 138, 136 150 C127 158, 115 163, 100 163"
                                    stroke="url(#g2)" strokeWidth="1" className="nl-brain-path" opacity="0.6" />
                                <path d="M58 70 C74 59, 90 64, 100 70 C110 64, 126 59, 142 70"
                                    stroke="url(#g3)" strokeWidth="1" className="nl-brain-path" />
                                <path d="M48 95 C68 84, 86 90, 100 95 C114 90, 132 84, 152 95"
                                    stroke="url(#g3)" strokeWidth="1" className="nl-brain-path" />
                                <path d="M44 120 C66 111, 84 116, 100 120 C116 116, 134 111, 156 120"
                                    stroke="url(#g3)" strokeWidth="1" className="nl-brain-path" />
                                <path d="M54 144 C70 136, 86 140, 100 144 C114 140, 130 136, 146 144"
                                    stroke="url(#g3)" strokeWidth="1" className="nl-brain-path" />
                                <line x1="100" y1="22" x2="100" y2="180" stroke="url(#g2)" strokeWidth="0.4" opacity="0.3" />

                                {[[58, 70], [142, 70], [48, 95], [152, 95], [44, 120], [156, 120], [54, 144], [146, 144], [100, 22], [100, 180], [25, 88], [175, 88]].map(([cx, cy], i) => (
                                    <circle key={i} cx={cx} cy={cy} r="2.5" fill="url(#ng)">
                                        <animate attributeName="r" values="2;3.5;2" dur={`${2.5 + i * 0.2}s`} repeatCount="indefinite" />
                                        <animate attributeName="opacity" values="0.4;0.85;0.4" dur={`${2.5 + i * 0.2}s`} repeatCount="indefinite" />
                                    </circle>
                                ))}

                                <defs>
                                    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#6366f1" />
                                    </linearGradient>
                                    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#2563eb" /><stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                    <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                                        <stop offset="50%" stopColor="#2563eb" stopOpacity="0.6" />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
                                    </linearGradient>
                                    <radialGradient id="ng">
                                        <stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#3b82f6" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            <div className="nl-divider" />

            {/* ═══════════ FEATURES ═══════════ */}
            <section id="features" className="py-24 lg:py-28">
                <div className="max-w-6xl mx-auto px-6">
                    <div ref={addRef} className="nl-reveal text-center mb-16">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3 block">Core Capabilities</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
                            Everything You Need for <span className="text-blue-600">Clinical AI</span>
                        </h2>
                        <p className="text-slate-500 max-w-lg mx-auto text-[15px]">
                            A complete AI-powered platform for brain tumor analysis — from upload to diagnosis.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <div key={i} ref={addRef} className="nl-reveal nl-card p-6" style={{ '--d': i }}>
                                <div className="nl-icon-box mb-4">{f.icon}</div>
                                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="nl-divider" />

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section id="how-it-works" className="py-24 lg:py-28 bg-slate-50/50">
                <div className="max-w-6xl mx-auto px-6">
                    <div ref={addRef} className="nl-reveal text-center mb-16">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3 block">Workflow</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
                            How It <span className="text-blue-600">Works</span>
                        </h2>
                        <p className="text-slate-500 max-w-lg mx-auto text-[15px]">
                            Four simple steps from upload to diagnosis.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="nl-timeline-line hidden lg:block" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                            {steps.map((s, i) => (
                                <div key={i} ref={addRef} className="nl-reveal text-center" style={{ '--d': i }}>
                                    <div className="nl-step-orb mx-auto mb-5">{s.icon}</div>
                                    <div className="text-[10px] font-bold text-blue-400 mb-1 tracking-[0.15em]">STEP {String(i + 1).padStart(2, '0')}</div>
                                    <h3 className="text-base font-semibold text-slate-900 mb-1.5">{s.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed max-w-[220px] mx-auto">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <div className="nl-divider" />

            {/* ═══════════ TECHNOLOGY ═══════════ */}
            <section id="technology" className="py-24 lg:py-28">
                <div className="max-w-6xl mx-auto px-6">
                    <div ref={addRef} className="nl-reveal text-center mb-16">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3 block">Tech Stack</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
                            Built With <span className="text-blue-600">Modern Technology</span>
                        </h2>
                        <p className="text-slate-500 max-w-lg mx-auto text-[15px]">
                            Enterprise-grade architecture for speed, accuracy, and reliability.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {tech.map((t, i) => (
                            <div key={i} ref={addRef} className="nl-reveal nl-card p-6 text-center" style={{ '--d': i }}>
                                <div className="nl-icon-box w-12 h-12 mx-auto mb-4">{t.icon}</div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{t.name}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="nl-divider" />

            {/* ═══════════ TARGET USERS ═══════════ */}
            <section className="py-24 lg:py-28 bg-slate-50/50">
                <div className="max-w-6xl mx-auto px-6">
                    <div ref={addRef} className="nl-reveal text-center mb-16">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3 block">Who It's For</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
                            Designed For <span className="text-blue-600">Healthcare Professionals</span>
                        </h2>
                        <p className="text-slate-500 max-w-lg mx-auto text-[15px]">
                            From radiologists to AI researchers — NeuroLens fits any clinical or research workflow.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {users.map((u, i) => (
                            <div key={i} ref={addRef} className="nl-reveal nl-card p-6 text-center" style={{ '--d': i }}>
                                <div className="nl-icon-box w-12 h-12 mx-auto mb-4">{u.icon}</div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{u.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{u.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            <section className="py-24 lg:py-28 nl-cta-bg">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <div ref={addRef} className="nl-reveal">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-7 shadow-lg shadow-blue-500/20">
                            <Brain size={24} className="text-white" />
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
                            Ready to Transform Your <span className="text-blue-600">Diagnostic Workflow?</span>
                        </h2>

                        <p className="text-slate-500 mb-8 max-w-md mx-auto text-[15px] leading-relaxed">
                            Join healthcare professionals using AI for faster, more accurate brain tumor detection.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                            <button onClick={onGetStarted}
                                className="group px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2">
                                Start Analyzing Now
                                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                            <button onClick={onGetStarted}
                                className="px-8 py-3.5 rounded-xl font-semibold text-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-sm">
                                Try Demo Account
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="py-8 border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <Brain size={13} className="text-white" />
                            </div>
                            <span className="text-sm font-bold text-slate-800">Neuro<span className="text-blue-600">Lens</span></span>
                        </div>

                        <div className="flex items-center gap-5">
                            {navLinks.map(l => (
                                <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/ /g, '-'))}
                                    className="text-[11px] text-slate-400 hover:text-blue-600 transition-colors font-medium uppercase tracking-wider">
                                    {l}
                                </button>
                            ))}
                        </div>

                        <p className="text-[11px] text-slate-400">© 2026 NeuroLens. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
