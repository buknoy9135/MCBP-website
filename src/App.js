import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
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
import ImageCleaner from './pages/ImageCleaner.jsx';

function App() {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/auth/callback';

  // Only hide navbar once auth is confirmed — prevents both flash and blank screen
  const hideNav = isAdminRoute || isAuthRoute;
  const publicTheme = 'theme-clean';
  const appClassName = hideNav ? 'app-shell' : `app-shell public-shell ${publicTheme}`;

  return (
    <div className={appClassName}>
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

        <Route
          path="/admin/blog/:slug"
          element={
            <ProtectedRoute>
              <BlogDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/image-cleaner"
          element={
            <ProtectedRoute>
              <ImageCleaner />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!hideNav && <ContactUs />}
    </div>
  );
}

export default App;
