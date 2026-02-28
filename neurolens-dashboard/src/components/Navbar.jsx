import { Brain } from 'lucide-react';

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
                    <span className="navbar-caption">AI-Powered MRI for Smarter Cancer Detection</span>
                </div>
            </div>
        </nav>
    );
}
