import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../css/AboutUs.css'

function AboutUs () {
    return (
        <Container >
            <Row>
                <Col sm={1} lg={1}></Col>
                <Col sm={10} lg={10}>
                    <div className="text-start aboutus-container">
                    <h3 className="text-primary aboutus-heading">About Us</h3>
                    <p className="text-justify aboutus-text"><strong>Metro Cebu Businessmen and Professionals (MCBP)</strong> is a dedicated organization committed to enhancing public safety, empowering communities, and supporting rapid response to emergencies. We stand at the intersection of crime prevention and community resilience, working tirelessly to create safer neighborhoods through collaboration, education, and action.</p>
                    <p className="text-justify aboutus-text">Founded on the principles of service, vigilance, and unity, MCBP brings together volunteers, trained responders, and local partners to deter crime, assist in crisis situations, and provide vital support in times of need. Whether it’s assisting during natural disasters, supporting search and rescue efforts, or helping prevent criminal activity through proactive community outreach, we are there—ready to respond.</p>
                    <h4 className="text-primary aboutus-heading-h4">Our Mission</h4>
                    <p className="text-justify aboutus-text">To reduce crime and enhance community safety through proactive engagement, emergency preparedness, and swift response during critical incidents.</p>
                    <h4 className="text-primary aboutus-heading-h4">Our Vision</h4>
                    <p className="text-justify aboutus-text">A resilient, informed, and empowered community where safety and support are shared responsibilities.</p>
                    <h4 className="text-primary aboutus-heading-h4">What We Do:</h4>
                    <ul className="text-justify aboutus-text">
                        <li>Community Patrols & Crime Watch</li>
                        <li>Emergency Response Assistance</li>
                        <li>Disaster Relief & Recovery Support</li>
                        <li>Public Safety Education & Training</li>
                        <li>Partnerships with Law Enforcement & First Responders</li>                 
                    </ul>
                    <p className="text-justify aboutus-text">MCBP is more than a team—it's a movement of citizens committed to protecting one another and strengthening the fabric of our communities. Together, we stand strong against crime and ready for any emergency.</p>
                    </div>
                </Col>
                <Col sm={1} lg={1}></Col>
            </Row>
            
        </Container>
    )
}

export default AboutUs;