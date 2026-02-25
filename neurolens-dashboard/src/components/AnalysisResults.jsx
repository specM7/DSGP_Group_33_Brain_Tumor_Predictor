import { Search, Layers, Download, ClipboardList } from 'lucide-react';

function MriPlaceholder() {
    return (
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="mri-image">
            <defs>
                <radialGradient id="skull" cx="50%" cy="48%" r="42%">
                    <stop offset="0%" stopColor="#4a4a4a" />
                    <stop offset="70%" stopColor="#2a2a2a" />
                    <stop offset="100%" stopColor="#111" />
                </radialGradient>
                <radialGradient id="brain" cx="50%" cy="48%" r="34%">
                    <stop offset="0%" stopColor="#6b6b6b" />
                    <stop offset="50%" stopColor="#555" />
                    <stop offset="100%" stopColor="#333" />
                </radialGradient>
                <radialGradient id="tumor" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ddd" />
                    <stop offset="60%" stopColor="#aaa" />
                    <stop offset="100%" stopColor="#777" />
                </radialGradient>
                <radialGradient id="ventricle" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1a1a1a" />
                    <stop offset="100%" stopColor="#222" />
                </radialGradient>
            </defs>
            {/* Background */}
            <rect width="400" height="400" fill="#0a0e17" />
            {/* Outer skull */}
            <ellipse cx="200" cy="192" rx="155" ry="165" fill="url(#skull)" />
            {/* Inner brain */}
            <ellipse cx="200" cy="192" rx="130" ry="140" fill="url(#brain)" />
            {/* Midline fissure */}
            <line x1="200" y1="48" x2="200" y2="320" stroke="#222" strokeWidth="2" opacity="0.6" />
            {/* Gyri texture - left */}
            <path d="M120,120 Q140,100 160,115 Q180,130 165,155" fill="none" stroke="#555" strokeWidth="1.5" opacity="0.5" />
            <path d="M100,180 Q120,165 145,175 Q165,185 150,210" fill="none" stroke="#555" strokeWidth="1.5" opacity="0.5" />
            <path d="M110,240 Q135,225 155,240 Q170,255 155,275" fill="none" stroke="#555" strokeWidth="1.5" opacity="0.5" />
            {/* Gyri texture - right */}
            <path d="M280,120 Q260,100 240,115 Q220,130 235,155" fill="none" stroke="#555" strokeWidth="1.5" opacity="0.5" />
            <path d="M300,180 Q280,165 255,175 Q235,185 250,210" fill="none" stroke="#555" strokeWidth="1.5" opacity="0.5" />
            <path d="M290,240 Q265,225 245,240 Q230,255 245,275" fill="none" stroke="#555" strokeWidth="1.5" opacity="0.5" />
            {/* Lateral ventricles */}
            <ellipse cx="175" cy="188" rx="22" ry="10" fill="url(#ventricle)" transform="rotate(-15 175 188)" />
            <ellipse cx="225" cy="188" rx="22" ry="10" fill="url(#ventricle)" transform="rotate(15 225 188)" />
            {/* Third ventricle */}
            <ellipse cx="200" cy="200" rx="4" ry="12" fill="#1a1a1a" />
            {/* Tumor - right frontal (bright on T1 contrast) */}
            <ellipse cx="260" cy="130" rx="28" ry="24" fill="url(#tumor)" opacity="0.85" />
            <ellipse cx="260" cy="130" rx="20" ry="16" fill="#ccc" opacity="0.4" />
            {/* Detection circle overlay */}
            <circle cx="260" cy="130" r="38" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" opacity="0.9" />
        </svg>
    );
}

export default function AnalysisResults() {
    return (
        <section className="analysis-section">
            <h2 className="section-title">
                <ClipboardList size={22} />
                Analysis Results
            </h2>

            <div className="analysis-card">
                <div className="analysis-image-container">
                    <div className="mri-image-wrapper">
                        <MriPlaceholder />
                        <div className="detected-badge">DETECTED</div>
                        <div className="image-toolbar">
                            <button className="toolbar-btn" aria-label="Zoom">
                                <Search size={16} />
                            </button>
                            <button className="toolbar-btn" aria-label="Layers">
                                <Layers size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="analysis-details">
                    <div className="detail-group">
                        <span className="detail-label-sm">TUMOR TYPE</span>
                        <h3 className="tumor-title">Meningioma Detected</h3>
                        <p className="classification-text">
                            Classification based on axial T1-weighted contrast-enhanced sequence.
                        </p>
                    </div>

                    <div className="confidence-group">
                        <div className="confidence-header">
                            <span className="detail-label-sm">CONFIDENCE LEVEL</span>
                            <span className="confidence-value">98.5%</span>
                        </div>
                        <div className="confidence-bar-track">
                            <div className="confidence-bar-fill" style={{ width: '98.5%' }}></div>
                        </div>
                        <span className="confidence-note">Historical accuracy for this model: 96.2%</span>
                    </div>

                    <div className="metrics-row">
                        <div className="metric-card">
                            <span className="metric-label">VOLUME</span>
                            <span className="metric-value">14.2 cm³</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">LOCATION</span>
                            <span className="metric-value">Right Frontal</span>
                        </div>
                    </div>

                    <button className="btn-export">
                        <Download size={16} />
                        Export Medical Report
                    </button>
                </div>
            </div>
        </section>
    );
}
