import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import UploadPanel from './components/UploadPanel';
import ChatPanel from './components/ChatPanel';
import AnalysisResults from './components/AnalysisResults';
import LandingPage from './components/LandingPage';
import { SignedIn as RealSignedIn, SignedOut as RealSignedOut } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkValid = PUBLISHABLE_KEY && !PUBLISHABLE_KEY.includes("YOUR_CLERK");

const SignedIn = isClerkValid ? RealSignedIn : ({ children }) => null;
const SignedOut = isClerkValid ? RealSignedOut : ({ children }) => <>{children}</>;

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // When signed out, Clerk will render the children of <SignedOut> (e.g. LandingPage)
  // When signed in, Clerk will render the children of <SignedIn> (e.g. Dashboard)
  return (
    <>
      <SignedOut>
        <LandingPage />
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
              <UploadPanel onImageUpload={setUploadedImage} onPrediction={setPrediction} />
              <ChatPanel />
            </div>

            <AnalysisResults uploadedImage={uploadedImage} prediction={prediction} />
          </main>
        </div>
      </SignedIn>
    </>
  );
}

export default App;
