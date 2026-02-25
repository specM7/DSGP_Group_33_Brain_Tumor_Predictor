import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Layers, Download, ClipboardList, Eye, EyeOff } from 'lucide-react';

/* ── Simulated detection data generator ── */
function generateDetectionData() {
    const tumorTypes = [
        { name: 'Meningioma Detected', desc: 'Classification based on axial T1-weighted contrast-enhanced sequence.' },
        { name: 'Glioblastoma Detected', desc: 'High-grade astrocytoma identified via enhanced MRI contrast patterns.' },
        { name: 'Pituitary Adenoma Detected', desc: 'Classification from sagittal contrast-enhanced T1 sequence.' },
    ];

    const tumor = tumorTypes[Math.floor(Math.random() * tumorTypes.length)];
    const confidence = (92 + Math.random() * 7).toFixed(1);
    const volume = (5 + Math.random() * 20).toFixed(1);
    const locations = ['Right Frontal', 'Left Temporal', 'Right Parietal', 'Left Occipital', 'Central'];
    const location = locations[Math.floor(Math.random() * locations.length)];

    // Generate 1-4 hotspots for the heatmap
    const spotCount = 1 + Math.floor(Math.random() * 3);
    const spots = [];
    for (let i = 0; i < spotCount; i++) {
        spots.push({
            x: 0.2 + Math.random() * 0.6,   // normalized 0-1
            y: 0.15 + Math.random() * 0.65,
            radius: 0.06 + Math.random() * 0.12,
            intensity: 0.5 + Math.random() * 0.5,
        });
    }

    return { tumor, confidence, volume, location, spots };
}

/* ── Heatmap drawing on canvas ── */
function drawHeatmap(canvas, image, spots, showHeatmap) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw the uploaded image
    ctx.drawImage(image, 0, 0, w, h);

    if (!showHeatmap) return;

    // Create an offscreen canvas for the heatmap layer
    const heatCanvas = document.createElement('canvas');
    heatCanvas.width = w;
    heatCanvas.height = h;
    const hctx = heatCanvas.getContext('2d');

    // Draw each hot spot as a radial gradient
    spots.forEach((spot) => {
        const cx = spot.x * w;
        const cy = spot.y * h;
        const r = spot.radius * Math.max(w, h);

        const grad = hctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(255, 0, 0, ${spot.intensity * 0.85})`);
        grad.addColorStop(0.25, `rgba(255, 80, 0, ${spot.intensity * 0.6})`);
        grad.addColorStop(0.5, `rgba(255, 200, 0, ${spot.intensity * 0.35})`);
        grad.addColorStop(0.75, `rgba(0, 255, 100, ${spot.intensity * 0.15})`);
        grad.addColorStop(1, 'rgba(0, 0, 255, 0)');

        hctx.fillStyle = grad;
        hctx.fillRect(0, 0, w, h);
    });

    // Composite the heatmap onto the main canvas
    ctx.globalAlpha = 0.55;
    ctx.drawImage(heatCanvas, 0, 0);
    ctx.globalAlpha = 1.0;

    // Draw detection circles on top of the hotspots
    spots.forEach((spot) => {
        const cx = spot.x * w;
        const cy = spot.y * h;
        const r = spot.radius * Math.max(w, h) * 0.7;

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    });
}

/* ── Static MRI placeholder (when no image uploaded) ── */
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
            <rect width="400" height="400" fill="#0a0e17" />
            <ellipse cx="200" cy="192" rx="155" ry="165" fill="url(#skull)" />
            <ellipse cx="200" cy="192" rx="130" ry="140" fill="url(#brain)" />
            <line x1="200" y1="48" x2="200" y2="320" stroke="#222" strokeWidth="2" opacity="0.6" />
            <path d="M120,120 Q140,100 160,115 Q180,130 165,155" fill="none" stroke="#555" strokeWidth="1.5" opacity="0.5" />
            <path d="M100,180 Q120,165 145,175 Q165,185 150,210" fill="none" stroke="#555" strokeWidth="1.5" opacity="0.5" />
            <path d="M110,240 Q135,225 155,240 Q170,255 155,275" fill="none" stroke="#555" strokeWidth="1.5" opacity="0.5" />
            <path d="M280,120 Q260,100 240,115 Q220,130 235,155" fill="none" stroke="#555" strokeWidth="1.5" opacity="0.5" />
            <path d="M300,180 Q280,165 255,175 Q235,185 250,210" fill="none" stroke="#555" strokeWidth="1.5" opacity="0.5" />
            <path d="M290,240 Q265,225 245,240 Q230,255 245,275" fill="none" stroke="#555" strokeWidth="1.5" opacity="0.5" />
            <ellipse cx="175" cy="188" rx="22" ry="10" fill="url(#ventricle)" transform="rotate(-15 175 188)" />
            <ellipse cx="225" cy="188" rx="22" ry="10" fill="url(#ventricle)" transform="rotate(15 225 188)" />
            <ellipse cx="200" cy="200" rx="4" ry="12" fill="#1a1a1a" />
            <ellipse cx="260" cy="130" rx="28" ry="24" fill="url(#tumor)" opacity="0.85" />
            <ellipse cx="260" cy="130" rx="20" ry="16" fill="#ccc" opacity="0.4" />
            <circle cx="260" cy="130" r="38" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" opacity="0.9" />
        </svg>
    );
}

/* ── Heatmap Legend ── */
function HeatmapLegend() {
    return (
        <div className="heatmap-legend">
            <span className="legend-label">Low</span>
            <div className="legend-gradient" />
            <span className="legend-label">High</span>
        </div>
    );
}

/* ── Main Component ── */
export default function AnalysisResults({ uploadedImage }) {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [detection, setDetection] = useState(null);

    // When a new image is uploaded, simulate analysis
    useEffect(() => {
        if (!uploadedImage) {
            setDetection(null);
            return;
        }

        setIsAnalyzing(true);
        setShowHeatmap(true);

        const img = new Image();
        img.onload = () => {
            imageRef.current = img;

            // Simulate analysis delay
            setTimeout(() => {
                const data = generateDetectionData();
                setDetection(data);
                setIsAnalyzing(false);
            }, 1500);
        };
        img.src = uploadedImage;
    }, [uploadedImage]);

    // Re-draw canvas whenever detection, showHeatmap, or the image changes
    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img || !detection) return;

        canvas.width = img.naturalWidth || 512;
        canvas.height = img.naturalHeight || 512;
        drawHeatmap(canvas, img, detection.spots, showHeatmap);
    }, [detection, showHeatmap]);

    useEffect(() => {
        redraw();
    }, [redraw]);

    const hasImage = !!uploadedImage;
    const analysisReady = hasImage && detection && !isAnalyzing;

    return (
        <section className="analysis-section">
            <h2 className="section-title">
                <ClipboardList size={22} />
                Analysis Results
            </h2>

            <div className="analysis-card">
                <div className="analysis-image-container">
                    <div className="mri-image-wrapper">
                        {/* No image uploaded → show placeholder */}
                        {!hasImage && <MriPlaceholder />}

                        {/* Analyzing state */}
                        {hasImage && isAnalyzing && (
                            <>
                                <img src={uploadedImage} alt="Uploaded MRI" className="mri-image uploaded-img dimmed" />
                                <div className="analyzing-overlay">
                                    <div className="analyzing-spinner" />
                                    <span>ANALYZING...</span>
                                </div>
                            </>
                        )}

                        {/* Analysis complete → show canvas with heatmap */}
                        {analysisReady && (
                            <>
                                <canvas ref={canvasRef} className="mri-image heatmap-canvas" />
                                <div className="detected-badge">DETECTED</div>
                                <HeatmapLegend />
                            </>
                        )}

                        {/* Toolbar */}
                        <div className="image-toolbar">
                            <button className="toolbar-btn" aria-label="Zoom">
                                <Search size={16} />
                            </button>
                            {analysisReady && (
                                <button
                                    className={`toolbar-btn ${showHeatmap ? 'toolbar-btn-active' : ''}`}
                                    aria-label="Toggle Heatmap"
                                    onClick={() => setShowHeatmap((v) => !v)}
                                    title={showHeatmap ? 'Hide heatmap' : 'Show heatmap'}
                                >
                                    {showHeatmap ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            )}
                            <button className="toolbar-btn" aria-label="Layers">
                                <Layers size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="analysis-details">
                    <div className="detail-group">
                        <span className="detail-label-sm">TUMOR TYPE</span>
                        <h3 className="tumor-title">
                            {analysisReady ? detection.tumor.name : 'Meningioma Detected'}
                        </h3>
                        <p className="classification-text">
                            {analysisReady
                                ? detection.tumor.desc
                                : 'Classification based on axial T1-weighted contrast-enhanced sequence.'}
                        </p>
                    </div>

                    <div className="confidence-group">
                        <div className="confidence-header">
                            <span className="detail-label-sm">CONFIDENCE LEVEL</span>
                            <span className="confidence-value">
                                {analysisReady ? `${detection.confidence}%` : '98.5%'}
                            </span>
                        </div>
                        <div className="confidence-bar-track">
                            <div
                                className="confidence-bar-fill"
                                style={{ width: analysisReady ? `${detection.confidence}%` : '98.5%' }}
                            />
                        </div>
                        <span className="confidence-note">Historical accuracy for this model: 96.2%</span>
                    </div>

                    <div className="metrics-row">
                        <div className="metric-card">
                            <span className="metric-label">VOLUME</span>
                            <span className="metric-value">
                                {analysisReady ? `${detection.volume} cm³` : '14.2 cm³'}
                            </span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">LOCATION</span>
                            <span className="metric-value">
                                {analysisReady ? detection.location : 'Right Frontal'}
                            </span>
                        </div>
                    </div>

                    {analysisReady && (
                        <div className="metrics-row">
                            <div className="metric-card">
                                <span className="metric-label">HOTSPOTS</span>
                                <span className="metric-value">{detection.spots.length}</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">HEATMAP</span>
                                <span className={`metric-value ${showHeatmap ? 'heatmap-on' : 'heatmap-off'}`}>
                                    {showHeatmap ? 'Visible' : 'Hidden'}
                                </span>
                            </div>
                        </div>
                    )}

                    <button className="btn-export">
                        <Download size={16} />
                        Export Medical Report
                    </button>
                </div>
            </div>
        </section>
    );
}
