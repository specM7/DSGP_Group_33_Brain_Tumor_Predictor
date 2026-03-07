import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Brain, Upload, Shield, MessageSquare, Search, ArrowRight,
    Menu, X, Zap, Database, Monitor, FlaskConical, Cpu, FileImage,
    Stethoscope, Building2, GraduationCap, Microscope, Activity,
    Eye, Lock, Play, Sparkles, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
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

/* ── Particle System ── */
function useParticles(canvasRef, isDark) {
    useEffect(() => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext('2d');
        let particles = [];
        let raf;
        let mouse = { x: -1000, y: -1000 };

        const resize = () => {
            c.width = window.innerWidth * devicePixelRatio;
            c.height = window.innerHeight * devicePixelRatio;
            c.style.width = window.innerWidth + 'px';
            c.style.height = window.innerHeight + 'px';
            ctx.scale(devicePixelRatio, devicePixelRatio);
        };
        resize();
        window.addEventListener('resize', resize);

        const w = () => window.innerWidth;
        const h = () => window.innerHeight;

        // Create particles
        const count = Math.min(100, Math.floor(window.innerWidth / 15));
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w(),
                y: Math.random() * h(),
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 1.5 + 0.3,
                opacity: Math.random() * 0.5 + 0.1,
            });
        }

        const handleMouse = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        window.addEventListener('mousemove', handleMouse, { passive: true });

        const draw = () => {
            ctx.clearRect(0, 0, w(), h());

            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w()) p.vx *= -1;
                if (p.y < 0 || p.y > h()) p.vy *= -1;

                // Mouse interaction
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    p.x -= dx * 0.005;
                    p.y -= dy * 0.005;
                }
            }

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 140) {
                        ctx.beginPath();
                        ctx.strokeStyle = isDark
                            ? `rgba(99, 102, 241, ${0.06 * (1 - d / 140)})`
                            : `rgba(99, 102, 241, ${0.08 * (1 - d / 140)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw particles
            for (const p of particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = isDark
                    ? `rgba(129, 140, 248, ${p.opacity})`
                    : `rgba(79, 70, 229, ${p.opacity * 0.6})`;
                ctx.fill();
            }

            raf = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouse);
            cancelAnimationFrame(raf);
        };
    }, [canvasRef, isDark]);
}

export default function LandingPage({ onGetStarted }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const [navScrolled, setNavScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const canvasRef = useRef(null);
    const revealRefs = useRef([]);

    const acc = useCounter(95, 1600);
    const spd = useCounter(3, 1000);
    const types = useCounter(4, 900);
    const scans = useCounter(10000, 2000);

    useParticles(canvasRef, isDark);

    /* Navbar scroll */
    useEffect(() => {
        const fn = () => setNavScrolled(window.scrollY > 40);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
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
        { icon: <Eye size={22} />, title: 'AI Tumor Detection', desc: 'Deep learning algorithms detect brain tumors with clinical-grade accuracy from a single MRI scan.' },
        { icon: <Cpu size={22} />, title: 'Smart Classification', desc: 'Classifies tumors into glioma, meningioma, pituitary, or healthy — with confidence scoring.' },
        { icon: <FileImage size={22} />, title: 'Multi-Format Upload', desc: 'Supports DICOM, PNG, and JPG formats with drag-and-drop and resolution validation.' },
        { icon: <Shield size={22} />, title: 'Clinical Dashboard', desc: 'Secure, HIPAA-aware interface with authentication, scan history, and professional reports.' },
        { icon: <MessageSquare size={22} />, title: 'AI Clinical Chat', desc: 'Conversational AI assistant explains findings and answers diagnostic questions in real-time.' },
        { icon: <Activity size={22} />, title: 'Real-Time Analysis', desc: 'Get results in under 3 seconds. Watch the AI analyze your scan with a live progress feed.' },
    ];

    const steps = [
        { icon: <Upload size={22} />, title: 'Upload MRI', desc: 'Drag & drop your brain scan in DICOM, PNG, or JPG format.' },
        { icon: <Zap size={22} />, title: 'AI Analysis', desc: 'CNN model processes scan through multi-layer feature extraction.' },
        { icon: <Search size={22} />, title: 'Detection', desc: 'AI identifies, localizes, and classifies potential tumors.' },
        { icon: <Monitor size={22} />, title: 'View Results', desc: 'Review classification, segmentation, and clinical insights.' },
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
        <div className={`nl-landing ${isDark ? '' : 'nl-light'}`}>
            {/* ── Ambient Background ── */}
            <div className="nl-ambient" />
            <canvas ref={canvasRef} className="nl-particles-canvas" />
            <div className="nl-grid-overlay" />

            {/* ═══════════ NAVBAR ═══════════ */}
            <nav className={`nl-navbar ${navScrolled ? 'scrolled' : ''}`}>
                <div className="nl-navbar-inner">
                    <div className="nl-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="nl-logo-icon">
                            <Brain size={18} color="#fff" />
                        </div>
                        <div className="nl-logo-text">Neuro<span>Lens</span></div>
                    </div>

                    <div className="nl-nav-links">
                        {navLinks.map(l => (
                            <button key={l} className="nl-nav-link"
                                onClick={() => scrollTo(l.toLowerCase().replace(/ /g, '-'))}>
                                {l}
                            </button>
                        ))}
                        <button className="nl-theme-toggle" onClick={toggleTheme} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                            {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <div className="nl-nav-divider" />
                        <button className="nl-nav-cta" onClick={onGetStarted}>
                            <Lock size={13} /> Sign In
                        </button>
                    </div>

                    <button className="nl-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                <div className={`nl-mobile-menu ${mobileOpen ? 'open' : ''}`}>
                    {navLinks.map(l => (
                        <button key={l} className="nl-mobile-link"
                            onClick={() => scrollTo(l.toLowerCase().replace(/ /g, '-'))}>
                            {l}
                        </button>
                    ))}
                    <button className="nl-mobile-cta" onClick={onGetStarted}>
                        Sign In
                    </button>
                </div>
            </nav>

            {/* ═══════════ HERO ═══════════ */}
            <section className="nl-hero">
                <div className="nl-hero-container">
                    <div className="nl-hero-content">
                        <div className="nl-hero-badge">
                            <div className="nl-hero-badge-dot" />
                            <span className="nl-hero-badge-text">AI-Powered Medical Imaging</span>
                        </div>

                        <h1 className="nl-hero-title">
                            AI-Powered Brain{' '}
                            <span className="nl-hero-title-gradient">Tumor Detection</span>
                            {' '}& Classification
                        </h1>

                        <p className="nl-hero-desc">
                            Upload MRI brain scans and receive instant AI-driven analysis.
                            Clinical-grade detection and classification — in under 3 seconds.
                        </p>

                        <div className="nl-hero-actions">
                            <button className="nl-btn-primary" onClick={onGetStarted}>
                                <Sparkles size={16} />
                                Get Started Free
                                <ArrowRight size={15} />
                            </button>
                            <button className="nl-btn-secondary" onClick={onGetStarted}>
                                <Play size={14} />
                                Watch Demo
                            </button>
                        </div>

                    </div>

                    {/* Brain Visualization */}
                    <div className="nl-hero-visual">
                        <div className="nl-brain-container">
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
                                        <animate attributeName="opacity" values="0.4;0.9;0.4" dur={`${2.5 + i * 0.2}s`} repeatCount="indefinite" />
                                    </circle>
                                ))}

                                <defs>
                                    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#6366f1" />
                                    </linearGradient>
                                    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#22d3ee" />
                                    </linearGradient>
                                    <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1" />
                                        <stop offset="50%" stopColor="#818cf8" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.1" />
                                    </linearGradient>
                                    <radialGradient id="ng">
                                        <stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#818cf8" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            <div className="nl-divider" />

            {/* ═══════════ FEATURES ═══════════ */}
            <section id="features" className="nl-section">
                <div className="nl-section-container">
                    <div ref={addRef} className="nl-reveal nl-section-header">
                        <span className="nl-section-tag">
                            <Sparkles size={12} /> Core Capabilities
                        </span>
                        <h2 className="nl-section-title">
                            Everything You Need for <span>Clinical AI</span>
                        </h2>
                        <p className="nl-section-desc">
                            A complete AI-powered platform for brain tumor analysis — from upload to diagnosis.
                        </p>
                    </div>

                    <div className="nl-features-grid">
                        {features.map((f, i) => (
                            <div key={i} ref={addRef} className="nl-reveal nl-glass-card" style={{ '--d': i }}>
                                <div className="nl-icon-box">{f.icon}</div>
                                <h3 className="nl-card-title">{f.title}</h3>
                                <p className="nl-card-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="nl-divider" />

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section id="how-it-works" className="nl-section nl-section-alt">
                <div className="nl-section-container">
                    <div ref={addRef} className="nl-reveal nl-section-header">
                        <span className="nl-section-tag">Workflow</span>
                        <h2 className="nl-section-title">
                            How It <span>Works</span>
                        </h2>
                        <p className="nl-section-desc">
                            Four simple steps from upload to diagnosis.
                        </p>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <div className="nl-timeline-line" style={{ display: 'none' }} />
                        <div className="nl-grid-4" style={{ position: 'relative' }}>
                            {/* Show timeline on large screens */}
                            <div className="nl-timeline-line" style={{ display: undefined }} />
                            {steps.map((s, i) => (
                                <div key={i} ref={addRef} className="nl-reveal" style={{ '--d': i, textAlign: 'center' }}>
                                    <div className="nl-step-orb">{s.icon}</div>
                                    <div className="nl-step-label">STEP {String(i + 1).padStart(2, '0')}</div>
                                    <h3 className="nl-step-title">{s.title}</h3>
                                    <p className="nl-step-desc">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <div className="nl-divider" />

            {/* ═══════════ TECHNOLOGY ═══════════ */}
            <section id="technology" className="nl-section">
                <div className="nl-section-container">
                    <div ref={addRef} className="nl-reveal nl-section-header">
                        <span className="nl-section-tag">Tech Stack</span>
                        <h2 className="nl-section-title">
                            Built With <span>Modern Technology</span>
                        </h2>
                        <p className="nl-section-desc">
                            Enterprise-grade architecture for speed, accuracy, and reliability.
                        </p>
                    </div>

                    <div className="nl-grid-4">
                        {tech.map((t, i) => (
                            <div key={i} ref={addRef} className="nl-reveal nl-glass-card" style={{ '--d': i, textAlign: 'center' }}>
                                <div className="nl-icon-box" style={{ margin: '0 auto 20px' }}>{t.icon}</div>
                                <h3 className="nl-card-title">{t.name}</h3>
                                <p className="nl-card-desc">{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="nl-divider" />

            {/* ═══════════ TARGET USERS ═══════════ */}
            <section className="nl-section nl-section-alt">
                <div className="nl-section-container">
                    <div ref={addRef} className="nl-reveal nl-section-header">
                        <span className="nl-section-tag">Who It's For</span>
                        <h2 className="nl-section-title">
                            Designed For <span>Healthcare Professionals</span>
                        </h2>
                        <p className="nl-section-desc">
                            From radiologists to AI researchers — NeuroLens fits any clinical or research workflow.
                        </p>
                    </div>

                    <div className="nl-grid-4">
                        {users.map((u, i) => (
                            <div key={i} ref={addRef} className="nl-reveal nl-glass-card" style={{ '--d': i, textAlign: 'center' }}>
                                <div className="nl-icon-box" style={{ margin: '0 auto 20px' }}>{u.icon}</div>
                                <h3 className="nl-card-title">{u.title}</h3>
                                <p className="nl-card-desc">{u.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="nl-divider" />

            {/* ═══════════ FOUNDERS ═══════════ */}
            <section className="nl-section">
                <div className="nl-section-container">
                    <div ref={addRef} className="nl-reveal nl-section-header">
                        <span className="nl-section-tag">Our Team</span>
                        <h2 className="nl-section-title">
                            Meet the <span>Founders</span>
                        </h2>
                        <p className="nl-section-desc">
                            The minds behind NeuroLens — building the future of AI-powered medical imaging.
                        </p>
                    </div>

                    <div className="nl-founders-grid">
                        {[
                            { name: 'Malindu Manchanayake', initials: 'MM', linkedin: 'https://www.linkedin.com/in/malindu-manchanayake-8b2b993b1/', email: 'malindu.20241239@iit.ac.lk' },
                            { name: 'Adrian Vethanayagam', initials: 'AV', linkedin: 'https://www.linkedin.com/in/joshua-adrian-/', email: 'joshua.20240846@iit.ac.lk' },
                            { name: 'Vidu Liyanage', initials: 'VL', linkedin: 'https://www.linkedin.com/in/viduliyanage7/', email: 'vidu.20240197@iit.ac.lk' },
                            { name: 'Mohamed Ahshaan', initials: 'MA', linkedin: 'https://www.linkedin.com/in/mohamedahshaan/', email: 'ahshaan.20240128@iit.ac.lk' },
                        ].map((f, i) => (
                            <div key={i} ref={addRef} className="nl-reveal nl-founder-card" style={{ '--d': i }}>
                                <div className="nl-founder-avatar-ring">
                                    <div className="nl-founder-avatar">
                                        <span>{f.initials}</span>
                                    </div>
                                </div>
                                <h3 className="nl-founder-name">{f.name}</h3>
                                <span className="nl-founder-role">Co-Founder</span>
                                <div className="nl-founder-socials">
                                    <a href={f.linkedin} target="_blank" rel="noopener noreferrer" className="nl-founder-social" title="LinkedIn">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    </a>
                                    <a href={`mailto:${f.email}`} className="nl-founder-social" title={f.email}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="20" height="16" x="2" y="4" rx="2" />
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            <section className="nl-cta">
                <div className="nl-cta-container">
                    <div ref={addRef} className="nl-reveal">
                        <div className="nl-cta-icon">
                            <Brain size={28} color="#fff" />
                        </div>

                        <h2 className="nl-cta-title">
                            Ready to Transform Your <span>Diagnostic Workflow?</span>
                        </h2>

                        <p className="nl-cta-desc">
                            Join healthcare professionals using AI for faster, more accurate brain tumor detection.
                        </p>

                        <div className="nl-cta-actions">
                            <button className="nl-btn-primary" onClick={onGetStarted}>
                                Start Analyzing Now
                                <ArrowRight size={15} />
                            </button>
                            <button className="nl-btn-secondary" onClick={onGetStarted}>
                                Try Demo Account
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="nl-footer">
                <div className="nl-footer-inner">
                    <div className="nl-logo">
                        <div className="nl-logo-icon" style={{ width: 28, height: 28, borderRadius: 8 }}>
                            <Brain size={14} color="#fff" />
                        </div>
                        <div className="nl-logo-text" style={{ fontSize: 14 }}>Neuro<span>Lens</span></div>
                    </div>

                    <div className="nl-footer-links">
                        {navLinks.map(l => (
                            <button key={l} className="nl-footer-link"
                                onClick={() => scrollTo(l.toLowerCase().replace(/ /g, '-'))}>
                                {l}
                            </button>
                        ))}
                    </div>

                    <p className="nl-footer-copy">© 2026 NeuroLens. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
