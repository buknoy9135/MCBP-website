import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";

import AboutUs from "../components/AboutUs";
import CarouselArea from "../components/CarouselArea";
import PersonalDetailsForm from "../components/JoinUs";
import BlogThumbnails from "../components/BlogThumbnails.jsx";

function Dashboard() {
  const location = useLocation();

  useEffect(() => {
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
      <Helmet>
        <title>Metro Cebu Businessmen and Professionals (MCBP) - Home</title>
        <meta
          name="description"
          content="Welcome to Metro Cebu Businessmen and Professionals (MCBP). Discover our events, community news, and join us to connect with local professionals."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Metro Cebu Businessmen and Professionals (MCBP) - Home" />
        <meta property="og:description" content="Welcome to Metro Cebu Businessmen and Professionals (MCBP). Discover our events, community news, and join us to connect with local professionals." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mcbp-org.com/" />
        <meta property="og:image" content="https://res.cloudinary.com/doeovg6x9/image/upload/v1749197428/mcbp-logo.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Metro Cebu Businessmen and Professionals (MCBP) - Home" />
        <meta name="twitter:description" content="Welcome to Metro Cebu Businessmen and Professionals (MCBP). Discover our events, community news, and join us to connect with local professionals." />
        <meta name="twitter:image" content="https://res.cloudinary.com/doeovg6x9/image/upload/v1749197428/mcbp-logo.jpg" />
        <link rel="canonical" href="https://www.mcbp-org.com/" />
      </Helmet>

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
    </div>
  );
}

export default Dashboard;
