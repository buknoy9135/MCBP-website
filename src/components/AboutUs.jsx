import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "../css/AboutUs.css";

function AboutUs() {
  return (
    <Container>
      <Row>
        <Col sm={1} lg={1}></Col>
        <Col sm={10} lg={10}>
          <div className="text-start aboutus-container">
            <h3 className="text-primary aboutus-heading">About Us</h3>
            <p className="text-justify aboutus-text">
              The{" "}
              <strong>Metro Cebu Businessmen and Professionals (MCBP)</strong>{" "}
              is a dynamic assembly of entrepreneurs, professionals, and civic
              leaders dedicated to empowering communities through service,
              leadership, and collaboration.
            </p>
            <p className="text-justify aboutus-text">
              Chartered under{" "}
              <strong>
                <em>ACCERT</em>
              </strong>{" "}
              (Anti Crime and Community Emergency Response Team) and affiliated
              with{" "}
              <strong>
                <em>TFOE-PE</em>
              </strong>{" "}
              (The Fraternal Order of Eagles - Philippine Eagles), MCBP blends
              business acumen with a deep commitment to civic duty. Our members
              share a passion for service, leadership, and nation-building,
              actively engaging in initiatives that enhance public safety,
              social welfare, and community resilience.
            </p>
            <p className="text-justify aboutus-text">
              Grounded in the principles of service through leadership, we
              strive to be catalysts of progress by promoting responsible
              citizenship, professional growth, and collaborative initiatives
              that strengthen our communities.
            </p>
            <h4 className="text-primary aboutus-heading-h4">Our Mission</h4>
            <p className="text-justify aboutus-text">
              To empower businessmen and professionals to serve as agents of
              transformation by promoting civic responsibility, fostering
              leadership, and participating in initiatives that contribute to
              peace, safety, and progress in society—guided by the ideals of
              ACCERT and the brotherhood of Philippine Eagles.
            </p>
            <h4 className="text-primary aboutus-heading-h4">Our Vision</h4>
            <p className="text-justify aboutus-text">
              To cultivate a community where empowered leaders work hand in hand
              to create lasting impact—championing safety, service, and
              solidarity. We envision a Cebu strengthened by collaboration,
              guided by integrity, and inspired by a shared commitment to the
              common good.
            </p>
            <h4 className="text-primary aboutus-heading-h4">What We Do:</h4>
            <ul className="text-justify aboutus-text">
              <li>
                Community Engagement - We conduct outreach programs, feeding
                missions, livelihood training, and educational support aimed at
                uplifting underprivileged sectors.
              </li>
              <li>
                Emergency Response & Safety - As part of ACCERT, we provide
                volunteer support in disaster response, traffic assistance,
                medical emergencies, and public safety operations.
              </li>
              <li>
                Professional Growth - We create avenues for continuous learning,
                leadership development, and business networking among our
                members.
              </li>
              <li>
                Civic & Fraternal Collaboration - We actively support the
                missions of TFOE-PE, fostering brotherhood and strengthening
                partnerships with other civic and fraternal groups.
              </li>
            </ul>
            <p className="text-justify aboutus-text">
              MCBP is more than a team — it's a movement of civic-minded leaders
              dedicated to uplifting one another and empowering communities
              through unity, vigilance, and service. Together, we stand in
              unity-driving outreach programs that uplift lives, strengthen
              communities, and inspire positive, lasting change.
            </p>
          </div>
        </Col>
        <Col sm={1} lg={1}></Col>
      </Row>
    </Container>
  );
}

export default AboutUs;
