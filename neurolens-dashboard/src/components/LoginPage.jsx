import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { SignIn as ClerkSignIn, SignUp as ClerkSignUp } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const inIframe = typeof window !== 'undefined' && window !== window.top;
const isClerkValid = PUBLISHABLE_KEY && !PUBLISHABLE_KEY.includes("YOUR_CLERK") && !inIframe;

export default function LoginPage({ onLogin, onBack }) {
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);

    // Neural network particle animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let nodes = [];
        const nodeCount = 60;

        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * canvas.offsetWidth,
                y: Math.random() * canvas.offsetHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                r: Math.random() * 2 + 1,
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
            const primaryColor = theme === 'dark' ? '59, 130, 246' : '26, 140, 255';

            nodes.forEach((n) => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > canvas.offsetWidth) n.vx *= -1;
                if (n.y < 0 || n.y > canvas.offsetHeight) n.vy *= -1;
            });

            // Draw connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${primaryColor}, ${0.12 * (1 - dist / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            nodes.forEach((n) => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${primaryColor}, 0.3)`;
                ctx.fill();
            });

            animFrameRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animFrameRef.current);
        };
    }, [theme]);

    const handleSignIn = () => {
        setIsLoading('signin');
        setTimeout(() => {
            setIsLoading(false);
            onLogin({ email: 'doctor@neurolens.ai', name: 'Dr. Neural' });
        }, 1500);
    };

    const handleDemoLogin = () => {
        setIsLoading('demo');
        setTimeout(() => {
            setIsLoading(false);
            onLogin({ email: 'demo@neurolens.ai', name: 'Demo User' });
        }, 1200);
    };

    return (
        <div className="login-page">
            <button 
                onClick={onBack}
                style={{ position: 'absolute', top: '24px', left: '24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', zIndex: 100, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', backdropFilter: 'blur(10px)' }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back to Home
            </button>
            <canvas ref={canvasRef} className="login-particles" />

            <div className="login-container">
                {/* Left - Anime Brain Animation */}
                <div className="login-brand-side">
                    <div className="login-anime-scene">
                        {/* Floating particles */}
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className={`anime-particle p-${i}`} />
                        ))}

                        {/* Orbiting rings */}
                        <div className="anime-orbit orbit-1" />
                        <div className="anime-orbit orbit-2" />
                        <div className="anime-orbit orbit-3" />

                        {/* Central brain glow */}
                        <div className="anime-brain-glow" />
                        <div className="anime-brain-glow glow-2" />

                        {/* Brain SVG */}
                        <svg className="anime-brain-svg" viewBox="0 0 200 200" fill="none">
                            {/* Left hemisphere */}
                            <path d="M100 30 C70 30, 40 50, 35 80 C30 110, 45 140, 60 155 C70 165, 80 170, 100 170"
                                stroke="url(#brainGrad1)" strokeWidth="2" fill="none" className="brain-path brain-path-1" />
                            <path d="M100 45 C78 45, 55 60, 50 85 C46 105, 55 130, 68 142 C76 150, 86 155, 100 155"
                                stroke="url(#brainGrad2)" strokeWidth="1.5" fill="none" className="brain-path brain-path-2" />
                            {/* Right hemisphere */}
                            <path d="M100 30 C130 30, 160 50, 165 80 C170 110, 155 140, 140 155 C130 165, 120 170, 100 170"
                                stroke="url(#brainGrad1)" strokeWidth="2" fill="none" className="brain-path brain-path-3" />
                            <path d="M100 45 C122 45, 145 60, 150 85 C154 105, 145 130, 132 142 C124 150, 114 155, 100 155"
                                stroke="url(#brainGrad2)" strokeWidth="1.5" fill="none" className="brain-path brain-path-4" />
                            {/* Inner folds */}
                            <path d="M65 75 C75 65, 90 68, 100 75 C110 68, 125 65, 135 75"
                                stroke="url(#brainGrad3)" strokeWidth="1.5" fill="none" className="brain-path brain-path-5" />
                            <path d="M58 95 C72 85, 88 90, 100 95 C112 90, 128 85, 142 95"
                                stroke="url(#brainGrad3)" strokeWidth="1.5" fill="none" className="brain-path brain-path-6" />
                            <path d="M55 115 C70 108, 85 112, 100 115 C115 112, 130 108, 145 115"
                                stroke="url(#brainGrad3)" strokeWidth="1.5" fill="none" className="brain-path brain-path-7" />
                            <path d="M62 135 C73 128, 87 132, 100 135 C113 132, 127 128, 138 135"
                                stroke="url(#brainGrad3)" strokeWidth="1.5" fill="none" className="brain-path brain-path-8" />
                            {/* Center line */}
                            <line x1="100" y1="30" x2="100" y2="170" stroke="url(#brainGrad2)" strokeWidth="1" className="brain-center-line" />

                            {/* Synapse nodes */}
                            {[[65, 75], [135, 75], [58, 95], [142, 95], [55, 115], [145, 115], [62, 135], [138, 135], [100, 30], [100, 170], [35, 80], [165, 80]].map(([cx, cy], i) => (
                                <circle key={i} cx={cx} cy={cy} r="3" fill="url(#nodeGrad)" className={`synapse-node node-${i}`} />
                            ))}

                            {/* Gradient definitions */}
                            <defs>
                                <linearGradient id="brainGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#60a5fa" />
                                    <stop offset="100%" stopColor="#a78bfa" />
                                </linearGradient>
                                <linearGradient id="brainGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                                <linearGradient id="brainGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                                </linearGradient>
                                <radialGradient id="nodeGrad">
                                    <stop offset="0%" stopColor="#fff" />
                                    <stop offset="100%" stopColor="#60a5fa" />
                                </radialGradient>
                            </defs>
                        </svg>

                        {/* Scanning beam */}
                        <div className="anime-scan-beam" />
                    </div>

                    {/* Title overlay */}
                    <div className="anime-title-overlay">
                        <div className="anime-logo-row">
                            <div className="login-logo-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </div>
                            <span className="anime-brand-name">NeuroLens</span>
                        </div>
                        <p className="anime-tagline">AI-Powered Neural Diagnostics</p>
                    </div>
                </div>

                {/* Right - Sign In / Clerk */}
                <div className="login-form-side" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {isClerkValid ? (
                        <ClerkSignIn routing="hash" />
                    ) : (
                        <div className="login-form-wrapper">
                            <div className="login-form-header">
                                <h2 className="login-form-title">
                                    Welcome to NeuroLens
                                </h2>
                                <p className="login-form-subtitle">
                                    Sign in to access your AI-powered diagnostic dashboard
                                </p>
                            </div>

                            <button
                                className={`login-submit-btn ${isLoading === 'signin' ? 'loading' : ''}`}
                                type="button"
                                onClick={handleSignIn}
                                disabled={isLoading}
                                id="sign-in-btn"
                            >
                                {isLoading === 'signin' ? (
                                    <div className="login-spinner" />
                                ) : (
                                    <>
                                        Sign In
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                className={`login-demo-btn ${isLoading === 'demo' ? 'loading' : ''}`}
                                onClick={handleDemoLogin}
                                disabled={isLoading}
                                id="demo-login-btn"
                            >
                                {isLoading === 'demo' ? (
                                    <div className="login-spinner" />
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                        Try Demo Account
                                    </>
                                )}
                            </button>

                            <div className="login-security-note">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                                <span>Your data is protected with enterprise-grade encryption</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
