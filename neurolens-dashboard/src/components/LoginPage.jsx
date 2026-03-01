import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage({ onLogin }) {
    const { theme, toggleTheme } = useTheme();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [errors, setErrors] = useState({});
    const [particles, setParticles] = useState([]);
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

    const validate = () => {
        const newErrors = {};
        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email address';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Minimum 6 characters';
        if (isSignUp && !name) newErrors.name = 'Name is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onLogin({ email, name: name || email.split('@')[0] });
        }, 1800);
    };

    const handleDemoLogin = () => {
        setIsLoading(true);
        setEmail('doctor@neurolens.ai');
        setPassword('••••••••');
        setTimeout(() => {
            setIsLoading(false);
            onLogin({ email: 'doctor@neurolens.ai', name: 'Dr. Neural' });
        }, 1200);
    };

    return (
        <div className="login-page">
            <canvas ref={canvasRef} className="login-particles" />

            {/* Theme Toggle */}
            <button className="login-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'dark' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                )}
            </button>

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

                {/* Right - Form */}
                <div className="login-form-side">
                    <div className="login-form-wrapper">
                        <div className="login-form-header">
                            <h2 className="login-form-title">
                                {isSignUp ? 'Create Account' : 'Welcome Back'}
                            </h2>
                            <p className="login-form-subtitle">
                                {isSignUp
                                    ? 'Start analyzing MRI scans in minutes'
                                    : 'Sign in to access your diagnostic dashboard'}
                            </p>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="login-social-row">
                            <button className="login-social-btn" type="button">
                                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                Google
                            </button>
                            <button className="login-social-btn" type="button">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                                GitHub
                            </button>
                        </div>

                        <div className="login-divider">
                            <span>or continue with email</span>
                        </div>

                        <form className="login-form" onSubmit={handleSubmit}>
                            {isSignUp && (
                                <div className={`login-field ${focusedField === 'name' ? 'focused' : ''} ${errors.name ? 'error' : ''}`}>
                                    <label htmlFor="login-name">Full Name</label>
                                    <div className="login-input-wrap">
                                        <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <input
                                            id="login-name"
                                            type="text"
                                            placeholder="Dr. Jane Smith"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            onFocus={() => setFocusedField('name')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                    </div>
                                    {errors.name && <span className="login-error">{errors.name}</span>}
                                </div>
                            )}

                            <div className={`login-field ${focusedField === 'email' ? 'focused' : ''} ${errors.email ? 'error' : ''}`}>
                                <label htmlFor="login-email">Email Address</label>
                                <div className="login-input-wrap">
                                    <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" />
                                    </svg>
                                    <input
                                        id="login-email"
                                        type="email"
                                        placeholder="doctor@hospital.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                </div>
                                {errors.email && <span className="login-error">{errors.email}</span>}
                            </div>

                            <div className={`login-field ${focusedField === 'password' ? 'focused' : ''} ${errors.password ? 'error' : ''}`}>
                                <label htmlFor="login-password">Password</label>
                                <div className="login-input-wrap">
                                    <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                    <button
                                        type="button"
                                        className="login-eye-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && <span className="login-error">{errors.password}</span>}
                            </div>

                            {!isSignUp && (
                                <div className="login-remember-row">
                                    <label className="login-checkbox-label">
                                        <input type="checkbox" className="login-checkbox" />
                                        <span className="login-checkmark" />
                                        Remember me
                                    </label>
                                    <a href="#" className="login-forgot">Forgot password?</a>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`login-submit-btn ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="login-spinner" />
                                ) : (
                                    <>
                                        {isSignUp ? 'Create Account' : 'Sign In'}
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        <button type="button" className="login-demo-btn" onClick={handleDemoLogin} disabled={isLoading}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            Try Demo Account
                        </button>

                        <p className="login-switch-text">
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                            <button
                                type="button"
                                className="login-switch-btn"
                                onClick={() => { setIsSignUp(!isSignUp); setErrors({}); }}
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
