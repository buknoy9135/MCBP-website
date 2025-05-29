import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import AboutUs from './components/AboutUs';
import CarouselArea from './components/CarouselArea';
import PersonalDetailsForm from './components/JoinUs';
import ContactUs from './components/ContactUs';
import LoremIpsum from './components/LoremIpsum';

function App() {
  return (
    <div id="app-container">

      <NavBar />
      
      <div id="home">        
        <CarouselArea />
      </div>
      
      <div id="about">
        <AboutUs />
      </div>     

      <div id="join"> 
        <PersonalDetailsForm />
      </div>
      
      <div id="contact">
        <ContactUs />
      </div>
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
