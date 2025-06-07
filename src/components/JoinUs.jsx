import React, { useState, useRef } from "react";
import { Form, Button, Row, Col, Modal } from "react-bootstrap";
import emailjs from "@emailjs/browser";
import "../css/JoinUs.css";

function PersonalDetailsForm() {
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fileError, setFileError] = useState("");
  const formRef = useRef();

  const validateFile = (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "image/jpeg",
      "image/png",
    ];
    const maxSizeMB = 5;

    if (file && !allowedTypes.includes(file.type)) {
      return "Allowed files: PDF, DOC, DOCX, JPG, PNG.";
    }

    if (file && file.size > maxSizeMB * 1024 * 1024) {
      return `File must be under ${maxSizeMB}MB.`;
    }

    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFileError("");

    const fileInput = formRef.current.attachment;
    const file = fileInput?.files?.[0];
    const error = validateFile(file);

    if (error) {
      setFileError(error);
      setSubmitting(false);
      return;
    }

    emailjs
      .sendForm("service_xpianxi", "template_q9vagn8", formRef.current, "ivT0ST0Y0nxOXHs14")
      .then(() => {
        setShowModal(true);
        formRef.current.reset();
      })
      .catch((error) => {
        console.error("EmailJS error:", error);
        alert("Submission failed. Please try again.");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="join-us-wrapper" style={{ paddingTop: "50px", scrollMarginTop: "80px" }}>
      <div className="thematic-form">
        <h2 className="form-heading">Join Us</h2>
        <p className="form-subtext">
          Become part of a growing movement of civic-minded individuals
          dedicated to uplifting communities through service, leadership, and
          collaboration.
        </p>

        <Form ref={formRef} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} xs={12} md={6} controlId="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" name="firstName" placeholder="Enter first name" required />
            </Form.Group>

            <Form.Group as={Col} xs={12} md={6} controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" name="lastName" placeholder="Enter last name" required />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} xs={12} md={6} controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="email" name="email" placeholder="Enter email" required />
            </Form.Group>

            <Form.Group as={Col} xs={12} md={6} controlId="phone">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                placeholder="Enter 11-digit phone number"
                required
                pattern="^\d{11}$"
                maxLength="11"
                title="e.g. 09451234567"
              />
            </Form.Group>
          </Row>

          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              name="address"
              rows={2}
              placeholder="Enter your address"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="notes">
            <Form.Label>Notes (Optional)</Form.Label>
            <Form.Control as="textarea" name="notes" rows={2} placeholder="Write your message..." />
          </Form.Group>

          <Form.Group className="mb-3" controlId="attachment">
            <Form.Label>Attachment</Form.Label>
            <Form.Control
              type="file"
              name="attachment"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
             <small className="file-help-text">(PDF, DOC, DOCX, JPG, PNG only – max 5MB)</small>
            {fileError && <div className="text-danger small mt-1">{fileError}</div>}
          </Form.Group>

          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </Form>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered dialogClassName="custom-modal">
          <Modal.Body className="text-center pt-3 pb-2 px-3">
            <Modal.Header className="justify-content-center py-1">
              <h5 className="modal-title mb-2">Thank You!</h5>
            </Modal.Header>
            <p className="my-2 small text-muted">
              Your details have been sent. We'll be in touch soon.
            </p>
          </Modal.Body>
          <Modal.Footer className="justify-content-center py-1">
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default PersonalDetailsForm;
