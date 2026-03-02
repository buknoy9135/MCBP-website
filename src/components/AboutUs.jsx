import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../css/AboutUs.css";

function AboutUs() {
  const location = useLocation();
  const isStandalonePage = location.pathname === "/about";

  return (
    <section className="aboutus-section" id="about">
      {isStandalonePage && (
        <Helmet>
          <title>About Us | MCBP-EEC - Metro Cebu Businessmen and Professionals</title>
          <meta name="description" content="Learn about MCBP-EEC — Metro Cebu Businessmen and Professionals - Ecozones Eagles Club. Our mission, vision, and commitment to community service, emergency response, and civic leadership in Cebu." />
          <meta name="robots" content="index, follow" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="About Us | MCBP-EEC" />
          <meta property="og:description" content="Learn about MCBP-EEC — our mission, vision, and commitment to community service, emergency response, and civic leadership in Metro Cebu." />
          <meta property="og:url" content="https://www.mcbp-org.com/about" />
          <meta property="og:image" content="https://www.mcbp-org.com/mcbp-login_logo.png" />
          <meta property="og:site_name" content="MCBP-EEC" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="About Us | MCBP-EEC" />
          <meta name="twitter:description" content="Learn about MCBP-EEC — our mission, vision, and commitment to community service, emergency response, and civic leadership in Metro Cebu." />
          <meta name="twitter:image" content="https://www.mcbp-org.com/mcbp-login_logo.png" />
          <link rel="canonical" href="https://www.mcbp-org.com/about" />
        </Helmet>
      )}
      <div className="container">

        {/* Section header */}
        <div className="aboutus-header">
          {/* <span className="aboutus-eyebrow-badge">Who We Are</span> */}
          <h2 className="aboutus-main-heading">About Us</h2>
          <div className="aboutus-divider" />
        </div>

        {/* Intro */}
        <div className="aboutus-intro">
          <p>
            The <strong>Metro Cebu Businessmen and Professionals - Ecozones Eagles Club (MCBP - EEC)</strong> is a dynamic assembly of entrepreneurs, professionals, and civic leaders
            dedicated to empowering communities through service, leadership, and
            collaboration. Based in Lapu-Lapu City, Cebu, our members come from
            diverse professional backgrounds — from business owners and engineers
            to medical practitioners and public servants — all united by a shared
            conviction that those entrusted with privilege and expertise have a
            greater responsibility to give back to the communities that shaped them.
          </p>
          <p>
            Chartered under <strong>TFOE-PE</strong>{" "}
            (The Fraternal Order of Eagles - Philippine Eagles) and <strong>ACCERT</strong> (Anti Crime and Community
            Emergency Response Team), MCBP-EEC blends
            business acumen with a deep commitment to civic duty. Our members share
            a passion for service, leadership, and nation-building, actively
            engaging in initiatives that enhance public safety, social welfare, and
            community resilience.
          </p>
          <p>
            Grounded in the principles of service through leadership, we strive to
            be catalysts of progress by promoting responsible citizenship,
            professional growth, and collaborative initiatives that strengthen our
            communities.
          </p>
        </div>

        {/* Mission + Vision — glassmorphism cards */}
        <div className="aboutus-mv-row">
          <div className="aboutus-mv-item">
            <div className="aboutus-mv-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1a56a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="36" height="36">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="2" x2="12" y2="5"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="5" y2="12"/>
                <line x1="19" y1="12" x2="22" y2="12"/>
              </svg>
            </div>
            <h3 className="aboutus-mv-heading">Our Mission</h3>
            <p className="aboutus-mv-text">
              To empower businessmen and professionals to serve as agents of
              transformation by promoting civic responsibility, fostering
              leadership, and participating in initiatives that contribute to
              peace, safety, and progress in society — guided by the ideals of
              ACCERT and the brotherhood of Philippine Eagles.
            </p>
          </div>

          <div className="aboutus-mv-item">
            <div className="aboutus-mv-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1a56a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="36" height="36">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <h3 className="aboutus-mv-heading">Our Vision</h3>
            <p className="aboutus-mv-text">
              To cultivate a community where empowered leaders work hand in hand
              to create lasting impact — championing safety, service, and
              solidarity. We envision a Cebu strengthened by collaboration,
              guided by integrity, and inspired by a shared commitment to the
              common good.
            </p>
          </div>
        </div>

        {/* What We Do */}
        <div className="aboutus-whatwedo">
          {/* <span className="aboutus-eyebrow-badge">Our Work</span> */}
          <h3 className="aboutus-whatwedo-heading">What We Do</h3>
          <div className="aboutus-pillars">
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1a56a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ),
                title: "Community Engagement",
                text: "We conduct outreach programs, feeding missions, livelihood training, and educational support aimed at uplifting underprivileged sectors. Through sustained community presence and partnerships with local government units, we ensure that our initiatives create measurable and lasting impact in the lives of those we serve.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1a56a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                ),
                title: "Emergency Response & Safety",
                text: "As part of ACCERT, we provide volunteer support in disaster response, traffic assistance, medical emergencies, and public safety operations. Our trained members stand ready to mobilize at any time, working alongside local authorities to protect lives and restore order in times of crisis and calamity.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1a56a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                  </svg>
                ),
                title: "Professional Growth",
                text: "We create avenues for continuous learning, leadership development, and business networking among our members. Through regular forums, seminars, and mentorship programs, MCBP-EEC empowers its members to grow not only as professionals but as community leaders who can drive meaningful change in their respective fields.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1a56a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                ),
                title: "Civic & Fraternal Collaboration",
                text: "We actively support the missions of TFOE-PE, fostering brotherhood and strengthening partnerships with other civic and fraternal groups. By building bridges across organizations, MCBP amplifies its collective impact — uniting professionals, volunteers, and community advocates under a shared vision of service, solidarity, and nation-building.",
              },
            ].map((item, i) => (
              <div key={i} className="aboutus-pillar">
                <div className="aboutus-pillar-icon-box">
                  <span className="aboutus-pillar-icon">{item.icon}</span>
                </div>
                <div>
                  <h5 className="aboutus-pillar-title">{item.title}</h5>
                  <p className="aboutus-pillar-text">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closing */}
        <div className="aboutus-closing">
          <p>
            MCBP-EEC is more than a team — it's a movement of civic-minded leaders
            dedicated to uplifting one another and empowering communities through
            unity, vigilance, and service. Together, we stand in unity — driving
            outreach programs that uplift lives, strengthen communities, and inspire
            positive, lasting change.
          </p>
        </div>

      </div>
    </section>
  );
}

export default AboutUs;
