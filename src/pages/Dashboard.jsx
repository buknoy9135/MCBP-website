import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";

import NavBar from "../components/NavBar.jsx";
import AboutUs from "../components/AboutUs";
import CarouselArea from "../components/CarouselArea";
import PersonalDetailsForm from "../components/JoinUs";
import BlogThumbnails from "../components/BlogThumbnails.jsx";

function Dashboard() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top or to specific section based on hash
    if (location.hash) {
      const section = document.querySelector(location.hash);
      if (section) {
        section.scrollIntoView({ behavior: "auto" });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div id="dashboard-container" className="page-background">
      {/* React Helmet for SEO */}
      <Helmet>
        <title>Metro Cebu Businessmen and Professionals (MCBP) - Home</title>
        <meta
          name="description"
          content="Welcome to Metro Cebu Businessmen and Professionals (MCBP). Discover our events, community news, and join us to connect with local professionals."
        />
        <meta name="robots" content="index, follow" />
        {/* Open Graph example */}
        <meta
          property="og:title"
          content="Metro Cebu Businessmen and Professionals (MCBP) - Home"
        />
        <meta
          property="og:description"
          content="Welcome to Metro Cebu Businessmen and Professionals (MCBP). Discover our events, community news, and join us to connect with local professionals."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mcbp-org.com/" />
        {/* Add your site logo or hero image URL */}
        <meta
          property="og:image"
          content="https://www.mcbp-org.com/path-to-your-image.jpg"
        />
      </Helmet>

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
