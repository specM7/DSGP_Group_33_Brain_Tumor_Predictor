import { useState, useRef } from 'react';
import { CloudUpload, Sparkles, CheckCircle } from 'lucide-react';

const formatBadges = ['DICOM', 'PNG', 'JPG'];

export default function UploadPanel({ onImageUpload }) {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const processFile = (file) => {
        if (!file) return;
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/dicom'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(dcm|dicom|png|jpg|jpeg)$/i)) {
            return;
        }

        setIsLoading(true);
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            setTimeout(() => {
                setIsLoading(false);
                onImageUpload?.(e.target.result);
            }, 600);
        };
        reader.readAsDataURL(file);
    };

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
        const file = e.dataTransfer.files?.[0];
        processFile(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        processFile(file);
    };

    return (
        <div className="upload-panel">
            <div
                className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${fileName ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isLoading ? (
                    <>
                        <div className="upload-icon loading">
                            <CloudUpload size={32} color="var(--color-primary)" />
                        </div>
                        <h3 className="upload-title">Processing...</h3>
                        <p className="upload-desc">Reading image data for analysis</p>
                    </>
                ) : fileName ? (
                    <>
                        <div className="upload-icon success">
                            <CheckCircle size={32} color="var(--color-accent-green)" />
                        </div>
                        <h3 className="upload-title">Upload Complete</h3>
                        <p className="upload-desc upload-filename">{fileName}</p>
                        <button
                            className="btn-primary"
                            onClick={() => {
                                setFileName(null);
                                fileInputRef.current.value = '';
                            }}
                        >
                            Upload Another
                        </button>
                    </>
                ) : (
                    <>
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
                    </>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".dcm,.dicom,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
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
