import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Quiz from "./pages/Quiz";
import Schedule from "./pages/Schedule";
import Notes from "./pages/Notes";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AITutor from "./pages/AITutor";
import Flashcards from "./pages/Flashcards";
import MockTest from "./pages/MockTest";
import Progress from "./pages/Progress";
import PYQAnalysis from "./pages/PYQAnalysis";
import PredictionDashboard from "./pages/PredictionDashboard";
import ExamStrategy from "./pages/ExamStrategy";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/upload" element={<Upload />} />
                        <Route path="/quiz" element={<Quiz />} />
                        <Route path="/schedule" element={<Schedule />} />
                        <Route path="/notes" element={<Notes />} />
                        <Route path="/ai-tutor" element={<AITutor />} />
                        <Route path="/flashcards" element={<Flashcards />} />
                        <Route path="/mock-test" element={<MockTest />} />
                        <Route path="/progress" element={<Progress />} />
                        <Route path="/pyq-analysis" element={<PYQAnalysis />} />
                        <Route path="/prediction" element={<PredictionDashboard />} />
                        <Route path="/strategy" element={<ExamStrategy />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;