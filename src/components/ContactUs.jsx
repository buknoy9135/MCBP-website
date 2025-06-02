import React from "react";
import "../css/ContactUs.css";

function ContactUs() {
  return (
    <footer>
      <div className="container d-flex flex-wrap justify-content-between align-items-center">
        <div>
          <i className="bi bi-geo-alt-fill me-2"></i>
          <a
            href="https://maps.app.goo.gl/TLtxG9zeSyzTW3pK8"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              all: "unset", // reset inherited browser styles
              cursor: "pointer", // keep pointer for UX
              display: "inline", // keep it inline
            }}
          >
            2688 Sitio Mahayahay, Brgy. Bankal, 6015 Lapulapu City, Cebu,
            Philippines
          </a>
        </div>
        <div>
          <i className="bi bi-telephone-fill me-2"></i>
          <a
            href="tel:+639176553110"
            style={{
              all: "unset",
              cursor: "pointer",
              display: "inline",
            }}
          >
            +63 917 655 3110
          </a>
        </div>
        <div>
          <i className="bi bi-envelope-fill me-2"></i>
          <a
            href="mailto:mcbp.org@gmail.com"
            style={{
              all: "unset",
              cursor: "pointer",
              display: "inline",
            }}
          >
            contact@mcbp.ph
          </a>
        </div>

        <div>
          <a
            href="https://www.facebook.com/share/g/16D7hSj6Fy/?mibextid=controlMsg"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <i className="bi bi-facebook"></i>
          </a>
          <a
            href="https://twitter.com/mcbp"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
          >
            <i className="bi bi-twitter"></i>
          </a>
          <a
            href="https://linkedin.com/company/mcbp"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <i className="bi bi-linkedin"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default ContactUs;
