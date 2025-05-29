import '../css/Dashboard.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from '../components/NavBar.jsx';
import AboutUs from '../components/AboutUs';
import CarouselArea from '../components/CarouselArea';
import PersonalDetailsForm from '../components/JoinUs';
import ContactUs from '../components/ContactUs';

function Dashboard() {
  return (
    <div id="dashboard-container">

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


export default Dashboard;
