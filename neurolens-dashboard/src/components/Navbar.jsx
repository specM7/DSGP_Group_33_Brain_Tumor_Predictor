import { Brain, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ user, onLogout }) {
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

                    {user && (
                        <div className="navbar-user-area">
                            <div className="navbar-avatar">
                                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="navbar-username">{user.name || user.email}</span>
                            <button
                                className="navbar-logout-btn"
                                onClick={onLogout}
                                title="Sign out"
                                aria-label="Sign out"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
