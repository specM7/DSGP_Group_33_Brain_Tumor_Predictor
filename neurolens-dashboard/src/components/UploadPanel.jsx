import { useState, useRef } from 'react';
import { CloudUpload, Sparkles } from 'lucide-react';

const formatBadges = ['DICOM', 'PNG', 'JPG'];

export default function UploadPanel() {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    return (
        <div className="upload-panel">
            <div
                className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="upload-icon">
                    <CloudUpload size={32} color="var(--color-primary)" />
                </div>
                <h3 className="upload-title">Upload MRI Scan</h3>
                <p className="upload-desc">
                    Drag and drop DICOM, JPG, or PNG image series.
                    <br />
                    Minimum resolution 512×512 required for accurate analysis.
                </p>
                <button
                    className="btn-primary"
                    onClick={() => fileInputRef.current?.click()}
                >
                    Select Files
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".dcm,.dicom,.jpg,.jpeg,.png"
                    multiple
                    hidden
                />
            </div>
            <div className="upload-footer">
                <div className="format-badges">
                    {formatBadges.map((fmt) => (
                        <span key={fmt} className="format-badge">{fmt}</span>
                    ))}
                </div>
                <span className="formats-label">Supported formats: DICOM, PNG, JPG</span>
                <a href="#" className="analyze-link">
                    <Sparkles size={14} />
                    Analyze MRI
                </a>
            </div>
        </div>
    );
}
