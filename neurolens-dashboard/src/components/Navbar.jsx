import { Brain, Activity } from 'lucide-react';

export default function Navbar() {
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
                        <Activity size={14} className="caption-icon" />
                        AI-Powered MRI for Smarter Cancer Detection
                    </span>
                </div>
                <div className="navbar-right">
                    <div className="navbar-status">
                        <span className="status-dot" />
                        <span className="status-label">System Online</span>
                    </div>
                </div>
            </div>
        </nav>
    );
}
