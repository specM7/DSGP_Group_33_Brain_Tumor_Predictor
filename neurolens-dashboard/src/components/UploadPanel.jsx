import { useState, useRef } from 'react';
import { CloudUpload, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const formatBadges = ['DICOM', 'PNG', 'JPG'];

export default function UploadPanel({ onImageUpload, onPrediction }) {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const processFile = (file) => {
        if (!file) return;
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/dicom'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(dcm|dicom|png|jpg|jpeg)$/i)) {
            setError('Unsupported file format. Please use DICOM, PNG, or JPG.');
            return;
        }

        setError(null);
        setFileName(file.name);
        setSelectedFile(file);

        // Show image preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
            onImageUpload?.(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await axios.post("http://localhost:5000/predict", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            onPrediction?.(response.data);
        } catch (err) {
            console.error("Error uploading image:", err);
            setError(
                err.response?.data?.error ||
                'Failed to connect to the analysis server. Make sure the backend is running on port 5000.'
            );
        } finally {
            setIsLoading(false);
        }
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

    const handleReset = () => {
        setFileName(null);
        setSelectedFile(null);
        setError(null);
        onPrediction?.(null);
        onImageUpload?.(null);
        fileInputRef.current.value = '';
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
                        <h3 className="upload-title">Analyzing...</h3>
                        <p className="upload-desc">Sending image to AI model for prediction</p>
                    </>
                ) : error ? (
                    <>
                        <div className="upload-icon error">
                            <AlertCircle size={32} color="var(--color-accent-red, #ef4444)" />
                        </div>
                        <h3 className="upload-title">Upload Failed</h3>
                        <p className="upload-desc upload-error">{error}</p>
                        <button className="btn-primary" onClick={handleReset}>
                            Try Again
                        </button>
                    </>
                ) : fileName ? (
                    <>
                        <div className="upload-icon success">
                            <CheckCircle size={32} color="var(--color-accent-green)" />
                        </div>
                        <h3 className="upload-title">File Selected</h3>
                        <p className="upload-desc upload-filename">{fileName}</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn-primary" onClick={handleUpload}>
                                <Sparkles size={14} />
                                Analyze MRI
                            </button>
                            <button className="btn-primary" onClick={handleReset}
                                style={{ background: 'transparent', border: '1px solid var(--color-border)' }}>
                                Upload Another
                            </button>
                        </div>
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
                {selectedFile && !isLoading && !error && (
                    <a href="#" className="analyze-link" onClick={(e) => { e.preventDefault(); handleUpload(); }}>
                        <Sparkles size={14} />
                        Analyze MRI
                    </a>
                )}
            </div>
        </div>
    );
}
