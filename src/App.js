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
      
      <div id="home">
        <NavBar />
        <CarouselArea />
        {/* <LoremIpsum />
        <LoremIpsum />
        <LoremIpsum /> */}
      </div>
      
      <div id="about" className='pt-4'>
        <AboutUs />
      </div>     

      {/* <LoremIpsum />
        <LoremIpsum />
        <LoremIpsum />  */}

      <div>
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
