import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import UploadPanel from './components/UploadPanel';
import ChatPanel from './components/ChatPanel';
import AnalysisResults from './components/AnalysisResults';

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);

  return (
    <div className="app">
      <Navbar />
      <main className="dashboard">
        <header className="dashboard-header">
          <h1 className="dashboard-title">
            NeuroLens
      
          </h1>
          <p className="dashboard-subtitle">
            Upload a patient's MRI scan to initiate AI-driven clinical tumor detection and classification.
          </p>
          <div className="dashboard-accent-line" />
        </header>

        <div className="dashboard-top-row">
          <UploadPanel onImageUpload={setUploadedImage} />
          <ChatPanel />
        </div>

        <AnalysisResults uploadedImage={uploadedImage} />
      </main>
    </div>
  );
}

export default App;
