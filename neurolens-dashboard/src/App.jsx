import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import UploadPanel from './components/UploadPanel';
import ChatPanel from './components/ChatPanel';
import AnalysisResults from './components/AnalysisResults';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import { SignedIn as RealSignedIn, SignedOut as RealSignedOut } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const inIframe = typeof window !== 'undefined' && window !== window.top;
const isClerkValid = PUBLISHABLE_KEY && !PUBLISHABLE_KEY.includes("YOUR_CLERK") && !inIframe;

const SignedIn = isClerkValid ? RealSignedIn : ({ children }) => null;
const SignedOut = isClerkValid ? RealSignedOut : ({ children }) => <>{children}</>;

function App() {
  const [currentAuthPage, setCurrentAuthPage] = useState('landing'); // 'landing' or 'login'
  const [uploadedImage, setUploadedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // When signed out, Clerk will render the children of <SignedOut>
  // When signed in, Clerk will render the children of <SignedIn>
  return (
    <>
      <SignedOut>
        {currentAuthPage === 'landing' ? (
          <LandingPage onNavigateLogin={() => setCurrentAuthPage('login')} />
        ) : (
          <LoginPage onBack={() => setCurrentAuthPage('landing')} />
        )}
      </SignedOut>

      <SignedIn>
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
              <UploadPanel 
                onImageUpload={setUploadedImage} 
                onPrediction={setPrediction} 
                onError={setUploadError}
              />
              <ChatPanel />
            </div>

            <AnalysisResults 
              uploadedImage={uploadedImage} 
              prediction={prediction} 
              uploadError={uploadError} 
            />
          </main>
        </div>
      </SignedIn>
    </>
  );
}

export default App;
