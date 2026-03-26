import { Brain, Sun, Moon, Home } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef, useMemo } from 'react';
import { UserButton as RealUserButton } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkValid = PUBLISHABLE_KEY && !PUBLISHABLE_KEY.includes("YOUR_CLERK");
const UserButton = isClerkValid ? RealUserButton : () => null;

export default function Navbar({ onLogout }) {
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const navRef = useRef(null);

    // Generate stable random particles once
    const particles = useMemo(() =>
        Array.from({ length: 12 }, (_, i) => ({
            id: i,
            left: `${8 + Math.random() * 84}%`,
            size: 2 + Math.random() * 3,
            delay: Math.random() * 3,
            duration: 2 + Math.random() * 3,
        })), []
    );

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 20);
            // Progress from 0 to 1 over 200 pixels of scrolling
            setScrollProgress(Math.min(y / 200, 1));
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            ref={navRef}
            className={`navbar ${scrolled ? 'scrolled' : ''}`}
            style={{ '--scroll-progress': scrollProgress }}
        >
            {/* Animated gradient sweep line at bottom */}
            <div className="navbar-glow-line" />

            {/* Floating neural particles */}
            <div className="navbar-particles" aria-hidden="true">
                {particles.map(p => (
                    <span
                        key={p.id}
                        className="navbar-particle"
                        style={{
                            left: p.left,
                            width: p.size,
                            height: p.size,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                        }}
                    />
                ))}
            </div>

            <div className="navbar-inner">
                <div className="navbar-left">
                    <div className="navbar-brand">
                        <div className="brand-icon">
                            {/* Pulse ring around icon */}
                            <span className="brand-icon-ring" />
                            <Brain size={22} color="#fff" />
                        </div>
                        <span className="brand-text">NeuroLens</span>
                    </div>
                    <div className="navbar-divider" />
                    <span className="navbar-caption">
                        AI-Powered MRI for Smarter Cancer Detection
                    </span>
                </div>
                <div className="navbar-right" style={{ gap: '1rem' }}>
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        <div className="toggle-track">
                            <Sun size={13} className="toggle-icon-sun" />
                            <Moon size={13} className="toggle-icon-moon" />
                            <div className={`toggle-thumb ${theme === 'dark' ? 'dark' : ''}`} />
                        </div>
                    </button>

                    {onLogout && (
                        <button
                            className="navbar-logout-btn"
                            onClick={onLogout}
                            title="Back to Home"
                            aria-label="Back to Home"
                        >
                            <Home size={16} />
                        </button>
                    )}
                    
                    <UserButton />
                </div>
            </div>
        </nav>
    );
}
