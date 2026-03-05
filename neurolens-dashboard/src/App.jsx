import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import UploadPanel from './components/UploadPanel';
import ChatPanel from './components/ChatPanel';
import AnalysisResults from './components/AnalysisResults';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import './components/LoginPage.css';

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('landing'); // 'landing' | 'login' | 'dashboard'

  // Landing page
  if (page === 'landing') {
    return <LandingPage onGetStarted={() => setPage('login')} />;
  }

  // Login page
  if (!user) {
    return (
      <LoginPage
        onLogin={(userData) => {
          setUser(userData);
          setPage('dashboard');
        }}
      />
    );
  }

  // Dashboard
  return (
    <div className="app">
      <Navbar user={user} onLogout={() => { setUser(null); setPage('landing'); }} />
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
          <UploadPanel onImageUpload={setUploadedImage} onPrediction={setPrediction} />
          <ChatPanel />
        </div>

        <AnalysisResults uploadedImage={uploadedImage} prediction={prediction} />
      </main>
    </div>
  );
}

export default App;

