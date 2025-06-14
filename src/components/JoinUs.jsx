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
    <div
      className="join-us-wrapper"
      style={{ paddingTop: "80px", scrollMarginTop: "80px" }}
    >
      <div className="thematic-form">
        <h2 className="form-heading">Join Us</h2>
        <p className="form-subtext">
          Become part of a growing movement of civic-minded individuals
          dedicated to uplifting communities through service, leadership, and
          collaboration.
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

        {/* Fillout Modal Link */}
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
              src="https://forms.fillout.com/t/7t1gL5cHusus?pdf=xxxxx" // ← Replace this with your real Fillout form URL
              title="Fillout Join Us Form"
              width="100%"
              height="600"
              style={{
                border: "none",
                borderRadius: "0 0 12px 12px",
              }}
            ></iframe>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default PersonalDetailsForm;
