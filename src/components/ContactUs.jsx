import React from "react";
import '../css/ContactUs.css'

function ContactUs() {
  return (
    <footer>
      <div className="container d-flex flex-wrap justify-content-between align-items-center">
        <div>
          <i className="bi bi-geo-alt-fill me-2"></i>
          123 Business Street, Cebu City, Philippines
        </div>
        <div>
          <i className="bi bi-telephone-fill me-2"></i>
          +63 912 345 6789
        </div>
        <div>
          <i className="bi bi-envelope-fill me-2"></i>
          contact@mcbp.ph
        </div>
        <div>
          <a href="https://facebook.com/mcbp" target="_blank" rel="noreferrer" aria-label="Facebook">
            <i className="bi bi-facebook"></i>
          </a>
          <a href="https://twitter.com/mcbp" target="_blank" rel="noreferrer" aria-label="Twitter">
            <i className="bi bi-twitter"></i>
          </a>
          <a href="https://linkedin.com/company/mcbp" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <i className="bi bi-linkedin"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default ContactUs;
