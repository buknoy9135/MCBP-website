import React, { useState } from "react";
import { Form, Button, Row, Col, Modal } from "react-bootstrap";
import emailjs from "@emailjs/browser";
import "../css/JoinUs.css";

function PersonalDetailsForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [filloutModal, setFilloutModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const serviceId = "service_xpianxi";
    const templateId = "template_q9vagn8";
    const publicKey = "ivT0ST0Y0nxOXHs14";

    emailjs
      .send(serviceId, templateId, formData, publicKey)
      .then(() => {
        setShowModal(true);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
        });
      })
      .catch((error) => {
        alert("Submission failed. Please try again.");
        console.error("EmailJS error:", error);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <section id="join" className="join-us-section">
      <div className="container">
        <div className="join-us-split">

          {/* ── INFO PANEL ── */}
          <div className="join-us-info-panel">
            <span className="join-us-eyebrow">Membership</span>
            <h2 className="join-us-info-heading">Join the MCBP Family</h2>
            <p className="join-us-info-subtext">
              Become part of a growing movement of civic-minded individuals
              dedicated to uplifting communities through service, leadership,
              and collaboration.
            </p>
            <ul className="join-us-benefits">
              <li>
                <span className="benefit-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </span>
                Serve your community through meaningful programs
              </li>
              <li>
                <span className="benefit-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                  </svg>
                </span>
                Build leadership and professional skills
              </li>
              <li>
                <span className="benefit-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </span>
                Join a network of civic-minded professionals
              </li>
              <li>
                <span className="benefit-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </span>
                Support emergency response and public safety
              </li>
            </ul>
          </div>

          {/* ── FORM PANEL ── */}
          <div className="join-us-form-panel">
            <div className="thematic-form">
              <h3 className="form-heading">Express Your Interest</h3>
              <p className="form-subtext">
                Fill out the quick form below and we'll reach out to you shortly.
              </p>

              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="firstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter first name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="lastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter last name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Col xs={12} md={6}>
                    <Form.Group controlId="email">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6}>
                    <Form.Group controlId="phone">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="Enter 11-digit phone number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        pattern="^\d{11}$"
                        maxLength="11"
                        title="e.g. 09451234567"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-2" controlId="address">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter your address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </Form>

              {/* Fillout link */}
              <div className="my-4 text-center text-muted">
                <div className="join-divider">
                  <span className="divider-text">or click below for detailed application</span>
                </div>
                <div className="text-center mt-2">
                  <span
                    onClick={() => setFilloutModal(true)}
                    className="apply-here-animated"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setFilloutModal(true);
                    }}
                  >
                    Apply Here
                    <span className="underline-bar"></span>
                  </span>
                </div>
              </div>

              {/* Success Modal */}
              <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                dialogClassName="custom-modal"
              >
                <Modal.Body className="text-center pt-3 pb-2 px-3">
                  <Modal.Header className="justify-content-center py-1">
                    <h5 className="modal-title mb-2">Thank You!</h5>
                  </Modal.Header>
                  <p className="my-2 small text-muted">
                    Your details have been sent. We'll be in touch soon.
                  </p>
                </Modal.Body>
                <Modal.Footer className="justify-content-center py-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>

              {/* Fillout Modal */}
              <Modal
                show={filloutModal}
                onHide={() => setFilloutModal(false)}
                centered
                size="lg"
                dialogClassName="fillout-modal"
              >
                <Modal.Header closeButton className="border-0 pb-0">
                  <Modal.Title className="w-100 text-center"></Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                  <iframe
                    src="https://forms.fillout.com/t/7t1gL5cHusus?pdf=xxxxx"
                    title="Fillout Join Us Form"
                    width="100%"
                    height="600"
                    style={{ border: "none", borderRadius: "0 0 12px 12px" }}
                  ></iframe>
                </Modal.Body>
              </Modal>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default PersonalDetailsForm;
