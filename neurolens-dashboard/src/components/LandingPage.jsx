import { useState, useEffect, useRef } from 'react';
import { Brain, Upload, Shield, MessageSquare, Search, ArrowRight, ChevronRight, Menu, X, Zap, Database, Monitor, Users, FlaskConical, Cpu, FileImage, Stethoscope, Building2, GraduationCap, Microscope } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage({ onGetStarted }) {
    const [isNavScrolled, setIsNavScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const canvasRef = useRef(null);
    const revealRefs = useRef([]);

    // Navbar scroll effect
    useEffect(() => {
        const handleScroll = () => setIsNavScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Neural network canvas animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let nodes = [];
        let animFrame;

        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < 80; i++) {
            nodes.push({
                x: Math.random() * canvas.offsetWidth,
                y: Math.random() * canvas.offsetHeight,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 1.5 + 0.5,
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
            nodes.forEach(n => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > canvas.offsetWidth) n.vx *= -1;
                if (n.y < 0 || n.y > canvas.offsetHeight) n.vy *= -1;
            });
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(6, 182, 212, ${0.06 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }
            nodes.forEach(n => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
                ctx.fill();
            });
            animFrame = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animFrame);
        };
    }, []);

    // Scroll reveal observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );
        revealRefs.current.forEach(el => { if (el) observer.observe(el); });
        return () => observer.disconnect();
    }, []);

    const addRevealRef = (el) => {
        if (el && !revealRefs.current.includes(el)) {
            revealRefs.current.push(el);
        }
    };

    const scrollToSection = (id) => {
        setMobileMenuOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const features = [
        { icon: <Search size={24} />, title: 'AI-Powered Tumor Detection', desc: 'Advanced deep learning algorithms detect tumors in MRI scans with clinical-grade accuracy in seconds.' },
        { icon: <Cpu size={24} />, title: 'Tumor Classification', desc: 'Automatically classify detected tumors into glioma, meningioma, pituitary, or no-tumor categories.' },
        { icon: <FileImage size={24} />, title: 'Multi-Format Upload', desc: 'Upload MRI scans in DICOM, PNG, or JPG formats. Drag-and-drop interface with 512×512 minimum resolution.' },
        { icon: <Shield size={24} />, title: 'Secure Clinical Dashboard', desc: 'HIPAA-aware design with secure authentication and a professional diagnostic results dashboard.' },
        { icon: <MessageSquare size={24} />, title: 'AI Clinical Assistant', desc: 'Built-in AI chat assistant provides clinical insights and answers questions about detected findings.' },
    ];

    const steps = [
        { num: '01', title: 'Upload MRI', desc: 'Drag and drop or select an MRI brain scan in any supported format.', icon: <Upload size={22} /> },
        { num: '02', title: 'AI Analysis', desc: 'Our CNN model processes the scan through multiple detection layers.', icon: <Zap size={22} /> },
        { num: '03', title: 'Tumor Detection', desc: 'AI identifies and localizes potential tumors with confidence scores.', icon: <Search size={22} /> },
        { num: '04', title: 'View Results', desc: 'Review detailed classification results and AI-generated clinical insights.', icon: <Monitor size={22} /> },
    ];

    const techStack = [
        { icon: <Monitor size={28} />, name: 'React + Vite', desc: 'Modern frontend with lightning-fast hot module replacement and optimized builds.' },
        { icon: <FlaskConical size={28} />, name: 'Flask Backend', desc: 'Lightweight Python server handling image processing and model inference.' },
        { icon: <Brain size={28} />, name: 'Deep Learning CNN', desc: 'Convolutional Neural Network trained on thousands of brain MRI scans.' },
        { icon: <Database size={28} />, name: 'DICOM Support', desc: 'Full DICOM imaging standard compatibility for clinical-grade scan processing.' },
    ];

    const targetUsers = [
        { icon: <Stethoscope size={28} />, title: 'Radiologists', desc: 'Enhance diagnostic accuracy with AI-assisted MRI analysis as a second opinion tool.' },
        { icon: <Building2 size={28} />, title: 'Hospitals & Clinics', desc: 'Integrate AI-powered screening into existing clinical workflows for faster turnaround.' },
        { icon: <Microscope size={28} />, title: 'Medical Researchers', desc: 'Accelerate brain tumor research with automated scan analysis and classification.' },
        { icon: <GraduationCap size={28} />, title: 'AI Healthcare Researchers', desc: 'Explore and benchmark deep learning models for medical imaging applications.' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white overflow-x-hidden">
            {/* ==================== NAVBAR ==================== */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isNavScrolled ? 'landing-nav-scrolled' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Brain size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                            NeuroLens
                        </span>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'How It Works', 'Technology'].map(link => (
                            <button
                                key={link}
                                onClick={() => scrollToSection(link.toLowerCase().replace(/ /g, '-'))}
                                className="text-sm text-slate-300 hover:text-cyan-400 transition-colors"
                            >
                                {link}
                            </button>
                        ))}
                        <button
                            onClick={onGetStarted}
                            className="px-5 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
                        >
                            Login
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-slate-300 hover:text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="landing-mobile-menu md:hidden px-6 py-4 flex flex-col gap-3">
                        {['Features', 'How It Works', 'Technology'].map(link => (
                            <button
                                key={link}
                                onClick={() => scrollToSection(link.toLowerCase().replace(/ /g, '-'))}
                                className="text-left text-sm text-slate-300 hover:text-cyan-400 py-2 transition-colors"
                            >
                                {link}
                            </button>
                        ))}
                        <button
                            onClick={onGetStarted}
                            className="mt-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-center"
                        >
                            Login
                        </button>
                    </div>
                )}
            </nav>

            {/* ==================== HERO ==================== */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                <canvas ref={canvasRef} className="landing-hero-canvas" />
                <div className="landing-hero-bg" />
                <div className="landing-orb landing-orb-1" />
                <div className="landing-orb landing-orb-2" />
                <div className="landing-orb landing-orb-3" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Hero Text */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-xs font-medium text-cyan-300">AI-Powered Medical Imaging</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                            <span className="bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
                                AI-Powered Brain
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                                Tumor Detection
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
                                & Classification
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                            Upload MRI brain scans and receive instant AI analysis powered by deep learning.
                            Clinical-grade tumor detection and classification for healthcare professionals.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <button
                                onClick={onGetStarted}
                                className="group px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 font-semibold text-sm transition-all shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center gap-2"
                            >
                                Get Started
                                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                            <button
                                onClick={onGetStarted}
                                className="px-7 py-3.5 rounded-xl border border-white/10 hover:border-cyan-500/30 bg-white/5 hover:bg-white/8 font-semibold text-sm text-slate-300 hover:text-white transition-all flex items-center gap-2"
                            >
                                View Demo
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-8 mt-10 justify-center lg:justify-start">
                            {[
                                { val: '95%+', label: 'Accuracy' },
                                { val: '<3s', label: 'Analysis' },
                                { val: '4', label: 'Tumor Types' },
                            ].map((s, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-xl font-bold text-cyan-400">{s.val}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Brain Visualization */}
                    <div className="landing-brain-container">
                        <div className="landing-brain-glow" />
                        <div className="landing-brain-ring landing-brain-ring-1" />
                        <div className="landing-brain-ring landing-brain-ring-2" />
                        <div className="landing-brain-ring landing-brain-ring-3" />
                        <div className="landing-scan-line" />

                        <svg className="landing-brain-svg" viewBox="0 0 200 200" fill="none">
                            <path d="M100 25 C65 25, 35 50, 30 85 C25 115, 42 145, 60 160 C72 170, 85 175, 100 175"
                                stroke="url(#lg1)" strokeWidth="1.5" className="brain-path-anim" />
                            <path d="M100 40 C73 40, 50 58, 45 85 C41 108, 52 133, 65 145 C74 153, 85 158, 100 158"
                                stroke="url(#lg2)" strokeWidth="1" className="brain-path-anim" />
                            <path d="M100 25 C135 25, 165 50, 170 85 C175 115, 158 145, 140 160 C128 170, 115 175, 100 175"
                                stroke="url(#lg1)" strokeWidth="1.5" className="brain-path-anim" />
                            <path d="M100 40 C127 40, 150 58, 155 85 C159 108, 148 133, 135 145 C126 153, 115 158, 100 158"
                                stroke="url(#lg2)" strokeWidth="1" className="brain-path-anim" />
                            <path d="M60 72 C75 62, 90 66, 100 72 C110 66, 125 62, 140 72"
                                stroke="url(#lg3)" strokeWidth="1" className="brain-path-anim" />
                            <path d="M52 95 C70 85, 86 90, 100 95 C114 90, 130 85, 148 95"
                                stroke="url(#lg3)" strokeWidth="1" className="brain-path-anim" />
                            <path d="M48 118 C68 110, 84 114, 100 118 C116 114, 132 110, 152 118"
                                stroke="url(#lg3)" strokeWidth="1" className="brain-path-anim" />
                            <path d="M56 140 C72 132, 86 136, 100 140 C114 136, 128 132, 144 140"
                                stroke="url(#lg3)" strokeWidth="1" className="brain-path-anim" />
                            <line x1="100" y1="25" x2="100" y2="175" stroke="url(#lg2)" strokeWidth="0.5" opacity="0.5" />

                            {[[60, 72], [140, 72], [52, 95], [148, 95], [48, 118], [152, 118], [56, 140], [144, 140], [100, 25], [100, 175], [30, 85], [170, 85]].map(([cx, cy], i) => (
                                <circle key={i} cx={cx} cy={cy} r="2.5" fill="url(#ng)" opacity="0.8">
                                    <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                                </circle>
                            ))}

                            <defs>
                                <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#06b6d4" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                                <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                                <linearGradient id="lg3" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                                </linearGradient>
                                <radialGradient id="ng">
                                    <stop offset="0%" stopColor="#fff" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </radialGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
            </section>

            {/* ==================== FEATURES ==================== */}
            <section id="features" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div ref={addRevealRef} className="reveal text-center mb-16">
                        <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3 block">Capabilities</span>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                Powerful Features for
                            </span>{' '}
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                Clinical AI
                            </span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Everything you need for AI-powered brain tumor analysis in one integrated platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                ref={addRevealRef}
                                className="reveal landing-feature-card rounded-2xl p-6"
                                style={{ '--i': i }}
                            >
                                <div className="landing-feature-icon w-12 h-12 rounded-xl flex items-center justify-center text-cyan-400 mb-4">
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== HOW IT WORKS ==================== */}
            <section id="how-it-works" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div ref={addRevealRef} className="reveal text-center mb-16">
                        <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3 block">Workflow</span>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                How It
                            </span>{' '}
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                Works
                            </span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            From upload to diagnosis in four simple steps.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connector line (desktop) */}
                        <div className="landing-step-connector hidden lg:block" style={{ left: '12.5%', right: '12.5%' }} />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {steps.map((s, i) => (
                                <div key={i} ref={addRevealRef} className="reveal landing-step-card text-center" style={{ '--i': i }}>
                                    <div className="landing-step-number w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-5 text-white">
                                        {s.icon}
                                    </div>
                                    <div className="text-xs font-bold text-cyan-500/60 mb-1">{s.num}</div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                                    <p className="text-sm text-slate-400">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== TECHNOLOGY ==================== */}
            <section id="technology" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div ref={addRevealRef} className="reveal text-center mb-16">
                        <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3 block">Tech Stack</span>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                Built With Modern
                            </span>{' '}
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                Technology
                            </span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            A cutting-edge stack designed for speed, accuracy, and clinical reliability.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {techStack.map((t, i) => (
                            <div key={i} ref={addRevealRef} className="reveal landing-tech-card rounded-2xl p-6 text-center" style={{ '--i': i }}>
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/10 flex items-center justify-center text-cyan-400 mx-auto mb-4">
                                    {t.icon}
                                </div>
                                <h3 className="text-base font-semibold text-white mb-2">{t.name}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== TARGET USERS ==================== */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div ref={addRevealRef} className="reveal text-center mb-16">
                        <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3 block">Who It's For</span>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                Designed For
                            </span>{' '}
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                Healthcare Professionals
                            </span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Whether you're a radiologist, researcher, or hospital administrator — NeuroLens fits your workflow.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {targetUsers.map((u, i) => (
                            <div key={i} ref={addRevealRef} className="reveal landing-feature-card rounded-2xl p-6 text-center" style={{ '--i': i }}>
                                <div className="landing-feature-icon w-14 h-14 rounded-xl flex items-center justify-center text-cyan-400 mx-auto mb-4">
                                    {u.icon}
                                </div>
                                <h3 className="text-base font-semibold text-white mb-2">{u.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{u.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== CTA ==================== */}
            <section className="py-24 relative landing-cta-bg">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <div ref={addRevealRef} className="reveal">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-cyan-500/20">
                            <Brain size={28} className="text-white" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                Ready to Transform Your
                            </span>{' '}
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                Diagnostic Workflow?
                            </span>
                        </h2>
                        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                            Sign in now and start analyzing MRI scans with the power of AI.
                            Faster diagnoses. Greater accuracy. Better patient outcomes.
                        </p>
                        <button
                            onClick={onGetStarted}
                            className="group px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 font-semibold text-sm transition-all shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 inline-flex items-center gap-2"
                        >
                            Get Started Now
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ==================== FOOTER ==================== */}
            <footer className="py-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                                <Brain size={16} className="text-white" />
                            </div>
                            <span className="text-base font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                NeuroLens
                            </span>
                        </div>

                        <div className="flex items-center gap-6">
                            {['Features', 'How It Works', 'Technology'].map(link => (
                                <button
                                    key={link}
                                    onClick={() => scrollToSection(link.toLowerCase().replace(/ /g, '-'))}
                                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {link}
                                </button>
                            ))}
                        </div>

                        <p className="text-xs text-slate-600">
                            © 2026 NeuroLens. AI-Powered Brain Tumor Detection.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
