import './App.css';
import { Routes, Route, HashRouter } from 'react-router-dom';
import AuthCallback from './pages/AuthCallback';
import { useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Dashboard from '../src/pages/Dashboard.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

function AppContent() {
  const location = useLocation();
  const isAuthRoute = location.pathname === "/auth/callback";

  return (
    <>
      {!isAuthRoute && <NavBar />}

      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>

      {!isAuthRoute && <ContactUs />}
    </>
  );
}

export default App;
