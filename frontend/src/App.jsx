import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Certificates from './pages/Certificates';
import AdminDashboard from './pages/admin/AdminDashboard';
import Navbar from './components/Navbar';
import TopicDetail from './pages/TopicDetail';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import Internships from './pages/Internships';
import CareerAnalysis from './pages/CareerAnalysis';
import AllActivity from './pages/AllActivity';

function App() {
  // Check for dark mode preference
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col transition-colors duration-300">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/topics/:topicId" element={<TopicDetail />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/internships" element={<Internships />} />
            <Route path="/career-analysis" element={<CareerAnalysis />} />
            <Route path="/activity" element={<AllActivity />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
