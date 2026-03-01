import { useState, useRef, useEffect } from 'react';
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

    // Size canvas to the image, capped at 512 for performance
    const maxSize = 512;
    const scale = Math.min(maxSize / image.naturalWidth, maxSize / image.naturalHeight, 1);
    const w = Math.round(image.naturalWidth * scale);
    const h = Math.round(image.naturalHeight * scale);
    canvas.width = w;
    canvas.height = h;

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

/* ── Canvas-rendered MRI with heatmap placeholder ── */
function MriPlaceholder() {
    const cRef = useRef(null);

    useEffect(() => {
        const canvas = cRef.current;
        if (!canvas) return;
        const S = 512;
        canvas.width = S;
        canvas.height = S;
        const ctx = canvas.getContext('2d');
        const cx = S / 2, cy = S / 2 - 10;

        // Dark background
        ctx.fillStyle = '#070b14';
        ctx.fillRect(0, 0, S, S);

        // Helper: draw ellipse fill
        const ellipse = (x, y, rx, ry, color, alpha = 1) => {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();
        };

        // Outer skull
        const skullGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 190);
        skullGrad.addColorStop(0, '#5a5a5a');
        skullGrad.addColorStop(0.7, '#3a3a3a');
        skullGrad.addColorStop(1, '#181818');
        ctx.beginPath();
        ctx.ellipse(cx, cy, 175, 190, 0, 0, Math.PI * 2);
        ctx.fillStyle = skullGrad;
        ctx.fill();

        // Skull bone ring
        const boneGrad = ctx.createRadialGradient(cx, cy, 140, cx, cy, 175);
        boneGrad.addColorStop(0, 'rgba(160,160,170,0.15)');
        boneGrad.addColorStop(0.5, 'rgba(200,200,210,0.25)');
        boneGrad.addColorStop(1, 'rgba(100,100,110,0.1)');
        ctx.beginPath();
        ctx.ellipse(cx, cy, 175, 190, 0, 0, Math.PI * 2);
        ctx.fillStyle = boneGrad;
        ctx.fill();

        // Brain matter
        const brainGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150);
        brainGrad.addColorStop(0, '#6a6a72');
        brainGrad.addColorStop(0.5, '#505058');
        brainGrad.addColorStop(0.85, '#38383f');
        brainGrad.addColorStop(1, '#282830');
        ctx.beginPath();
        ctx.ellipse(cx, cy, 148, 158, 0, 0, Math.PI * 2);
        ctx.fillStyle = brainGrad;
        ctx.fill();

        // Midline fissure
        ctx.strokeStyle = 'rgba(30,30,35,0.7)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 165);
        ctx.lineTo(cx, cy + 165);
        ctx.stroke();

        // Sulci (brain folds) — left side
        ctx.strokeStyle = 'rgba(50,50,55,0.6)';
        ctx.lineWidth = 1.8;
        const sulci = [
            [[120, 105], [142, 90], [165, 100], [180, 120], [168, 145]],
            [[98, 170], [120, 155], [148, 162], [168, 175], [152, 200]],
            [[105, 230], [132, 215], [158, 228], [172, 248], [158, 268]],
            [[115, 290], [138, 278], [158, 285], [168, 300]],
            // Right side
            [[392, 105], [370, 90], [347, 100], [332, 120], [344, 145]],
            [[414, 170], [392, 155], [364, 162], [344, 175], [360, 200]],
            [[407, 230], [380, 215], [354, 228], [340, 248], [354, 268]],
            [[397, 290], [374, 278], [354, 285], [344, 300]],
        ];
        sulci.forEach(pts => {
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (let i = 1; i < pts.length - 1; i++) {
                const xc = (pts[i][0] + pts[i + 1][0]) / 2;
                const yc = (pts[i][1] + pts[i + 1][1]) / 2;
                ctx.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc);
            }
            ctx.stroke();
        });

        // Ventricles (dark butterfly shape)
        ellipse(cx - 30, cy + 5, 26, 11, '#1a1a1e', 0.9);
        ellipse(cx + 30, cy + 5, 26, 11, '#1a1a1e', 0.9);
        ellipse(cx, cy + 10, 5, 16, '#151518', 0.95);

        // Small calcification spot (bottom-left)
        ellipse(cx - 50, cy + 80, 8, 8, '#aaa', 0.3);

        // ── TUMOR mass (right hemisphere, large) ──
        const tumorX = cx + 55, tumorY = cy - 20;
        const tumorGrad = ctx.createRadialGradient(tumorX, tumorY, 0, tumorX, tumorY, 80);
        tumorGrad.addColorStop(0, 'rgba(180,170,155,0.85)');
        tumorGrad.addColorStop(0.4, 'rgba(150,140,125,0.7)');
        tumorGrad.addColorStop(0.7, 'rgba(110,105,95,0.5)');
        tumorGrad.addColorStop(1, 'rgba(70,65,60,0)');
        ctx.beginPath();
        ctx.ellipse(tumorX, tumorY, 75, 68, -0.15, 0, Math.PI * 2);
        ctx.fillStyle = tumorGrad;
        ctx.fill();

        // ── HEATMAP OVERLAY ──
        const heatCanvas = document.createElement('canvas');
        heatCanvas.width = S;
        heatCanvas.height = S;
        const hctx = heatCanvas.getContext('2d');

        // Main tumor hotspot
        const drawSpot = (sx, sy, sr, intensity) => {
            const g = hctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
            g.addColorStop(0, `rgba(255, 0, 0, ${intensity * 0.9})`);
            g.addColorStop(0.2, `rgba(255, 60, 0, ${intensity * 0.75})`);
            g.addColorStop(0.4, `rgba(255, 180, 0, ${intensity * 0.5})`);
            g.addColorStop(0.6, `rgba(100, 255, 40, ${intensity * 0.3})`);
            g.addColorStop(0.8, `rgba(0, 100, 255, ${intensity * 0.15})`);
            g.addColorStop(1, 'rgba(0, 0, 255, 0)');
            hctx.fillStyle = g;
            hctx.fillRect(0, 0, S, S);
        };

        drawSpot(tumorX, tumorY, 110, 0.95);
        drawSpot(tumorX + 20, tumorY - 15, 60, 0.5);
        drawSpot(tumorX - 15, tumorY + 25, 50, 0.4);
        // Small secondary spot
        drawSpot(cx - 45, cy + 75, 30, 0.25);

        ctx.globalAlpha = 0.6;
        ctx.drawImage(heatCanvas, 0, 0);
        ctx.globalAlpha = 1.0;

        // Detection dashed circle
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.ellipse(tumorX, tumorY, 88, 80, -0.15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Subtle vignette
        const vig = ctx.createRadialGradient(cx, cy, S * 0.3, cx, cy, S * 0.52);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, S, S);

    }, []);

    return <canvas ref={cRef} className="mri-image heatmap-canvas" />;
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
    useEffect(() => {
        if (!detection) return;
        // Wait for canvas to mount in the DOM
        requestAnimationFrame(() => {
            const canvas = canvasRef.current;
            const img = imageRef.current;
            if (!canvas || !img) return;
            drawHeatmap(canvas, img, detection.spots, showHeatmap);
        });
    }, [detection, showHeatmap]);

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
