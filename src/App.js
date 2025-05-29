import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import AboutUs from './components/AboutUs';
import CarouselArea from './components/CarouselArea';
import PersonalDetailsForm from './components/JoinUs';
import ContactUs from './components/ContactUs';
import LoremIpsum from './components/LoremIpsum';
import Dashboard from '../src/pages/Dashboard.jsx';

function App() {
  return (
    <div id="app-container">

      <Dashboard />

    </div>
  );
}

// function App() {
//   return (
//     <div className="">
//       <BrowserRouter>
//       <NavBar />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/about" element={<AboutUs />} />
//       </Routes>
//     </BrowserRouter>
//     </div>
//   );
// }

export default App;
