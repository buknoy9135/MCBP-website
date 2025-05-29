import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useState } from "react";
import logo from "../assets/mcbp-logo.jpeg";
import '../css/NavBar.css'

function NavBar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Navbar expand="lg" fixed="top" className="bg-body-tertiary" expanded={expanded} onToggle={() => setExpanded(!expanded)}>
      <Container >
        {/* Logo aligned left */}
        <Navbar.Brand
      href="#home"
      className="d-flex align-items-center brand-responsive"
    >
      <img
        src={logo}
        alt="MCBP Logo"
        className="navbar-logo d-inline-block align-top me-2"
      />
      Metro Cebu Businessmen and Professionals
    </Navbar.Brand>

        {/* Navbar toggle for collapse on mobile */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="custom-toggle"/>

        {/* Nav links aligned right */}
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="ms-auto pe-4">
            <Nav.Link href="#home" style={{ color: '#0a58ca' }} onClick={() => setExpanded(false)}>Home</Nav.Link>
            <Nav.Link href="#about" style={{ color: '#0a58ca' }} onClick={() => setExpanded(false)}>About Us</Nav.Link>
            <Nav.Link href="#join" style={{ color: '#0a58ca' }} onClick={() => setExpanded(false)}>Join Us</Nav.Link>
            <Nav.Link href="#contact" style={{ color: '#0a58ca' }} onClick={() => setExpanded(false)}>Contact Us</Nav.Link>
            <NavDropdown title={<span style={{ color: '#0a58ca' }} onClick={() => setExpanded(false)}>Affiliation</span>}         id="basic-nav-dropdown"
            >
              <NavDropdown.Item a href="https://accert.org.ph/about.html" target="_blank"
              rel="noopener noreferrer" aria-label="ACCERT website">ACCERT</NavDropdown.Item>
              <NavDropdown.Item a href="https://thefraternalorderofeagles.club/" target="_blank"
              rel="noopener noreferrer" aria-label="EAGLES website">EAGLES</NavDropdown.Item>
              {/* <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item> */}
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
