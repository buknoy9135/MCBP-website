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
      let raf1 = 0;
      let raf2 = 0;
      raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          const section = document.querySelector(location.hash);
          if (!section) return;
          const nav = document.querySelector(".custom-navbar");
          const navOffset = nav ? nav.getBoundingClientRect().height : 56;
          const top = section.getBoundingClientRect().top + window.scrollY - navOffset - 2;
          window.scrollTo({ top: Math.max(top, 0), behavior: "auto" });
        });
      });
      return () => {
        window.cancelAnimationFrame(raf1);
        window.cancelAnimationFrame(raf2);
      };
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div id="dashboard-container" className="page-background">
      <Helmet>
        <title>Metro Cebu Businessmen and Professionals - Ecozones Eagles Club (MCBP-EEC)</title>
        <meta
          name="description"
          content="Welcome to MCBP-EEC — Metro Cebu Businessmen and Professionals - Ecozones Eagles Club. Discover our events, community news, and join us to connect with local professionals in Metro Cebu."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Metro Cebu Businessmen and Professionals - Ecozones Eagles Club (MCBP-EEC)" />
        <meta property="og:description" content="Welcome to MCBP-EEC — Metro Cebu Businessmen and Professionals - Ecozones Eagles Club. Discover our events, community news, and join us to connect with local professionals in Metro Cebu." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mcbp-org.com/" />
        <meta property="og:image" content="https://www.mcbp-org.com/mcbp-login_logo.png" />
        <meta property="og:site_name" content="MCBP-EEC" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Metro Cebu Businessmen and Professionals - Ecozones Eagles Club (MCBP-EEC)" />
        <meta name="twitter:description" content="Welcome to MCBP-EEC — Metro Cebu Businessmen and Professionals - Ecozones Eagles Club. Discover our events, community news, and join us to connect with local professionals in Metro Cebu." />
        <meta name="twitter:image" content="https://www.mcbp-org.com/mcbp-login_logo.png" />
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
