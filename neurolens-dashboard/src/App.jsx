import './App.css';
import Navbar from './components/Navbar';
import UploadPanel from './components/UploadPanel';
import ChatPanel from './components/ChatPanel';
import AnalysisResults from './components/AnalysisResults';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="dashboard">
        <header className="dashboard-header">
          <h1 className="dashboard-title">MRI Analysis Dashboard</h1>
          <p className="dashboard-subtitle">
            Upload a patient's MRI scan to initiate AI-driven clinical tumor detection and classification.
          </p>
        </header>

        <div className="dashboard-top-row">
          <UploadPanel />
          <ChatPanel />
        </div>

        <AnalysisResults />
      </main>
    </div>
  );
}

export default App;
