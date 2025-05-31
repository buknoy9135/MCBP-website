// import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import NavBar from './components/NavBar';
import AboutUs from './components/AboutUs';
import CarouselArea from './components/CarouselArea';
import PersonalDetailsForm from './components/JoinUs';
import ContactUs from './components/ContactUs';
import LoremIpsum from './components/LoremIpsum';
import Dashboard from '../src/pages/Dashboard.jsx';
import BlogDetail from './pages/BlogDetail.jsx';

function App() {
  return (
    <BrowserRouter basename="/MCBP-website">
      <Routes>        
        <Route path="/" element={<Dashboard />} />
        <Route path='/blog/:slug' element={<BlogDetail />} />
      </Routes>
    </BrowserRouter>   
    

  );
}



export default App;
