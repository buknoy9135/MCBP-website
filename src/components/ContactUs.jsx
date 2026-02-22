import React from "react";
import "../css/ContactUs.css";
import { Link } from "react-router-dom";

function ContactUs() {
  return (
    <footer
      style={{
        backgroundColor: "#fff",
        borderTop: "3px solid #79b4f7", // ⬅️ top border instead of bottom
        transition: "border-color 0.3s ease",
      }}
    >
      <div className="container d-flex flex-wrap align-items-center custom-footer-container">
        <div>
          <i className="bi bi-geo-alt-fill me-2"></i>
          <a
            href="https://maps.app.goo.gl/TLtxG9zeSyzTW3pK8"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              all: "unset",
              cursor: "pointer",
              display: "inline",
            }}
          >
            Lapulapu City, Cebu, Philippines
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
            +63 917 800 0444
          </a>
        </div>
        <div>
          <i className="bi bi-envelope-fill me-2"></i>
          <a
            href="mailto:contact@mcbp-org.com"
            style={{
              all: "unset",
              cursor: "pointer",
              display: "inline",
            }}
          >
            contact@mcbp-org.com
          </a>
        </div>
        <div className="d-flex gap-3 mt-2">
          <a
            href="https://www.facebook.com/people/Metro-Cebu-Businessmen-and-Professionals-MCBP-Accert-Chartered-Chapter/61574580928967/"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <i className="bi bi-facebook"></i>
          </a>
          <a
            href="https://twitter.com/your-mcbp-handle" // Replace with actual link or remove
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
          >
            <i className="bi bi-twitter"></i>
          </a>
          <a
            href="https://www.linkedin.com/company/your-mcbp-link" // Replace with actual link or remove
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <i className="bi bi-linkedin"></i>
          </a>
          <a
            href="https://www.youtube.com/@MetroCebuBusinessmenandProfess" // Replace with your actual channel link
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
          >
            <i
              className="bi bi-youtube text-danger"
              style={{ fontSize: "1.3rem" }}
            ></i>
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="copyright">
          © {new Date().getFullYear()} Metro Cebu Businessmen and
          Professionals.
          <span className="mobile-break"></span> All rights reserved. |{" "}
          <Link
            to="/privacy-policy"
            className="privacy-link"
            style={{ marginInline: "7px" }}
          >
            Privacy Policy
          </Link>
          <span>| created by:</span>
          <span>
            <a
              href="https://www.facebook.com/jalil.abulais"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                all: "unset",
                cursor: "pointer",
                display: "inline",
                textDecoration: "underline",
                paddingLeft: "4px",
              }}
            >
              Jalil Abulais
            </a>
          </span>
        </span>
      </div>
    </footer>
  );
}

export default ContactUs;
