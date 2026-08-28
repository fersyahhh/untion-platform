import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { LandingPage } from "./features/landing";
import { LoginPage, RegisterPage } from "./features/auth";
import { DashboardPage } from "./features/dashboard";
import {
  SoloSetupPage,
  PracticeSessionPage,
  PracticeResultPage,
} from "./features/practice";
import { 
  GroupLobbyPage, 
  GroupWaitingPage,
  GroupSessionPage,
  GroupResultPage 
} from "./features/group-practice";

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right" 
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            background: '#FDFBF7',
            color: '#4A403A',
            border: '1px solid #E8DFD0',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(74, 64, 58, 0.1)',
          },
          className: 'font-body',
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/practice/solo" element={<SoloSetupPage />} />
        <Route path="/practice/session" element={<PracticeSessionPage />} />
        <Route path="/practice/result" element={<PracticeResultPage />} />
        
        {/* Group Practice Routes */}
        <Route path="/practice/group" element={<GroupLobbyPage />} />
        <Route path="/practice/group/waiting/:roomId" element={<GroupWaitingPage />} />
        <Route path="/practice/group/session/:roomId" element={<GroupSessionPage />} />
        <Route path="/practice/group/result/:roomId" element={<GroupResultPage />} />
      </Routes>
    </Router>
  );
}

export default App;
