// src/pages/PrivacyPolicy.jsx

import React, { useEffect } from "react";
import "../css/PrivacyPolicy.css";

function PrivacyPolicy() {
  useEffect(() => {
    // This ensures the scroll is reset when the page loads
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <div
      className="container py-5 privacy-policy-container page-background px-3 px-md-5"
    >
        <div style={{ height: "40px" }}></div>
      <h1 className="mb-4 text-primary">Privacy Policy</h1>
      <p>
        <strong>Effective Date:</strong> June 4, 2025
      </p>
      <p>
        At <strong>Metro Cebu Businessmen and Professionals (MCBP)</strong>,
        your privacy is a priority. We are committed to handling your personal
        data with transparency and in accordance with the Data Privacy Act of
        2012 (RA 10173).
      </p>

      <h5 className="mt-4 text-primary">1. What We Collect</h5>
      <p>
        When you contact us through our website, we may collect the following
        information:
      </p>
      <ul>
        <li>Full Name</li>
        <li>Email Address</li>
        <li>Mobile Number</li>
        <li>Complete Address</li>
      </ul>

      <p>
        We do not use tracking cookies or third-party analytics at this time.
      </p>

      <h5 className="mt-4 text-primary">2. How Your Information is Used</h5>
      <p>Your information is used strictly for:</p>
      <ul>
        <li>Responding to your inquiries</li>
        <li>Providing relevant updates or assistance if requested</li>
        <li>Internal communication and documentation</li>
      </ul>
      <p>We do not share or sell your information to third parties.</p>

      <h5 className="mt-4 text-primary">3. How We Protect Your Data</h5>
      <p>
        We implement appropriate safeguards to ensure the security of your data.
        Your information is retained only as long as necessary to serve the
        purpose for which it was collected.
      </p>

      <h5 className="mt-4 text-primary">4. Your Rights</h5>
      <p>In line with the Data Privacy Act, you have the right to:</p>
      <ul>
        <li>Know how your data is being used</li>
        <li>Request access to your data</li>
        <li>Request corrections or deletion of your data</li>
        <li>Withdraw consent or object to processing</li>
      </ul>
      <p>To exercise your rights, please reach out to us directly.</p>

      <h5 className="mt-4 text-primary">5. Contact Information</h5>
      <p>
        📧 Email: <a href="mailto:mbc.org@gmail.com">contact@mcbp-org.com</a>
        <br />
        📍 Address: 2688 Sitio Mahayahay, Brgy. Bankal, Lapulapu City, Cebu,
        Philippines
        <br />
        📞 Phone: <a href="tel:+639176553110">+63 917 655 3110</a>
      </p>
    </div>
  );
}

export default PrivacyPolicy;
