import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import AuthCallback from './pages/AuthCallback';
import NavBar from './components/NavBar';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Dashboard from './pages/Dashboard.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NewPost from './pages/NewPost.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Track auth state globally so navbar hides for logged-in admins
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/auth/callback';

  // Hide navbar for admin routes OR when a logged-in admin is browsing the site
  const hideNav = isAdminRoute || isAuthRoute || isLoggedIn;

  return (
    <>
      {!hideNav && <NavBar />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Auth */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/admin" element={<AdminLogin />} />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/new-post"
          element={
            <ProtectedRoute>
              <NewPost />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/edit-post/:id"
          element={
            <ProtectedRoute>
              <NewPost />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!hideNav && <ContactUs />}
    </>
  );
}

export default App;