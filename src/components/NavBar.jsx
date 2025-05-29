import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import logo from "../assets/mcbp-logo.jpeg";
import '../css/NavBar.css'

function NavBar() {
  return (
    <Navbar expand="lg" fixed="top" className="bg-body-tertiary">
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
            <Nav.Link href="#home" style={{ color: '#0a58ca' }}>Home</Nav.Link>
            <Nav.Link href="#about" style={{ color: '#0a58ca' }}>About Us</Nav.Link>
            <Nav.Link href="#contact" style={{ color: '#0a58ca' }}>Contact Us</Nav.Link>
            <NavDropdown title={<span style={{ color: '#0a58ca' }}>Affiliation</span>}         id="basic-nav-dropdown"
            >
              <NavDropdown.Item a href="https://accert.org.ph/about.html" target="_blank"
              rel="noopener noreferrer" aria-label="ACCERT website">ACCERT</NavDropdown.Item>
              <NavDropdown.Item a href="https://thefraternalorderofeagles.club/" target="_blank"
              rel="noopener noreferrer" aria-label="EAGLES website">EAGLES</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
