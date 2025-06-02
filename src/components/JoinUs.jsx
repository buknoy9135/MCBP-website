import React, { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const serviceId = "service_cef7q6l";
    const templateId = "template_q9vagn8";
    const publicKey = "ivT0ST0Y0nxOXHs14";

    emailjs
      .send(serviceId, templateId, formData, publicKey)
      .then(() => {
        alert("Form submitted successfully!");
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
          Become part of a growing network of professionals committed to
          community safety and resilience.
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
                  placeholder="Enter phone number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter your address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default PersonalDetailsForm;
