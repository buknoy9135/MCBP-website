import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import NavBar from '../components/NavBar.jsx';
import AboutUs from '../components/AboutUs';
import CarouselArea from '../components/CarouselArea';
import PersonalDetailsForm from '../components/JoinUs';
import BlogThumbnails from '../components/BlogThumbnails.jsx';

function Dashboard() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top or to specific section based on hash
    if (location.hash) {
      const section = document.querySelector(location.hash);
      if (section) {
        section.scrollIntoView({ behavior: 'auto' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div id="dashboard-container" className='page-background'>
      <NavBar />

      <div id="home">
        <CarouselArea />
      </div>

      <div id="about">
        <AboutUs />
      </div>

      <div id="thumbnails">
        <BlogThumbnails />
      </div>

      <div id="join">
        <PersonalDetailsForm />
      </div>

      {/* <div id="contact">
        <ContactUs />
      </div> */}
    </div>
  );
}

export default Dashboard;
