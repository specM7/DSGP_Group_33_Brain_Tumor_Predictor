import { Brain, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="navbar-left">
                    <div className="navbar-brand">
                        <div className="brand-icon">
                            <Brain size={22} color="#fff" />
                        </div>
                        <span className="brand-text">NeuroLens</span>
                    </div>
                    <div className="navbar-divider" />
                    <span className="navbar-caption">
                        AI-Powered MRI for Smarter Cancer Detection
                    </span>
                </div>
                <div className="navbar-right">
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
                </div>
            </div>
        </nav>
    );
}
