import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import NavBar from './components/NavBar';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Dashboard from '../src/pages/Dashboard.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';

function App() {
  return (
    <BrowserRouter basename="/MCBP-website">
      <NavBar />
      <Routes>        
        <Route path="/" element={<Dashboard />} />
        <Route path='/about' element={<AboutUs />} />
        <Route path='/blog/:slug' element={<BlogDetail />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
      <ContactUs />
    </BrowserRouter>   
    

  );
}



export default App;
