import "../css/AboutUs.css";

function AboutUs() {
  return (
    <section className="aboutus-section">
      <div className="container">

        {/* Section header */}
        <div className="aboutus-header">
          <h2 className="aboutus-main-heading">About Us</h2>
          <div className="aboutus-divider" />
        </div>

        {/* Intro paragraphs */}
        <div className="aboutus-intro">
          <p>
            The <strong>Metro Cebu Businessmen and Professionals (MCBP)</strong> is
            a dynamic assembly of entrepreneurs, professionals, and civic leaders
            dedicated to empowering communities through service, leadership, and
            collaboration.
          </p>
          <p>
            Chartered under <strong>ACCERT</strong> (Anti Crime and Community
            Emergency Response Team) and affiliated with <strong>TFOE-PE</strong>{" "}
            (The Fraternal Order of Eagles - Philippine Eagles), MCBP blends
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

        {/* Mission + Vision cards */}
        <div className="aboutus-cards-row">
          <div className="aboutus-card aboutus-card--mission">
            <div className="aboutus-card-icon">🎯</div>
            <h4>Our Mission</h4>
            <p>
              To empower businessmen and professionals to serve as agents of
              transformation by promoting civic responsibility, fostering
              leadership, and participating in initiatives that contribute to
              peace, safety, and progress in society — guided by the ideals of
              ACCERT and the brotherhood of Philippine Eagles.
            </p>
          </div>

          <div className="aboutus-card aboutus-card--vision">
            <div className="aboutus-card-icon">🌟</div>
            <h4>Our Vision</h4>
            <p>
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
          <h4 className="aboutus-whatwedo-heading">What We Do</h4>
          <div className="aboutus-pillars">
            {[
              {
                icon: "🤝",
                title: "Community Engagement",
                text: "We conduct outreach programs, feeding missions, livelihood training, and educational support aimed at uplifting underprivileged sectors.",
              },
              {
                icon: "🚨",
                title: "Emergency Response & Safety",
                text: "As part of ACCERT, we provide volunteer support in disaster response, traffic assistance, medical emergencies, and public safety operations.",
              },
              {
                icon: "📈",
                title: "Professional Growth",
                text: "We create avenues for continuous learning, leadership development, and business networking among our members.",
              },
              {
                icon: "🦅",
                title: "Civic & Fraternal Collaboration",
                text: "We actively support the missions of TFOE-PE, fostering brotherhood and strengthening partnerships with other civic and fraternal groups.",
              },
            ].map((item, i) => (
              <div key={i} className="aboutus-pillar">
                <div className="aboutus-pillar-icon">{item.icon}</div>
                <h5>{item.title}</h5>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing statement */}
        <div className="aboutus-closing">
          <p>
            MCBP is more than a team — it's a movement of civic-minded leaders
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
