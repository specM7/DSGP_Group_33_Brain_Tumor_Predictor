import { Bell, Brain } from 'lucide-react';

const navLinks = ['Dashboard', 'Patient Records', 'Lab Reports', 'Settings'];

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
                    <ul className="nav-links">
                        {navLinks.map((link) => (
                            <li key={link}>
                                <a href="#" className={link === 'Dashboard' ? 'active' : ''}>
                                    {link}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="navbar-right">
                    <button className="icon-btn" aria-label="Notifications">
                        <Bell size={20} />
                    </button>
                    <div className="user-profile">
                        <div className="user-info">
                            <span className="user-name">Dr. Sarah Chen</span>
                            <span className="user-role">Radiologist</span>
                        </div>
                        <div className="user-avatar">
                            <img
                                src="https://ui-avatars.com/api/?name=Sarah+Chen&background=1a8cff&color=fff&size=80&font-size=0.4&bold=true"
                                alt="Dr. Sarah Chen"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
