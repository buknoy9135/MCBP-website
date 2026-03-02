import { useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import slide1 from "../assets/carousel-images/slide1.jpg";
import slide2 from "../assets/carousel-images/slide2.jpg";
import slide3 from "../assets/carousel-images/slide3.jpg";
import slide4 from "../assets/carousel-images/slide4.jpg";
import "../css/CarouselArea.css";

const slides = [slide4, slide1, slide2, slide3];

const slideContent = [
  {
    heading: "One Organization, One Vision",
    text: "Bound by shared values and dressed in pride, our members stand united in service to the nation.",
  },
  {
    heading: "Empowering Communities, Building Futures",
    text: "MCBP is dedicated to creating lasting impact through education, innovation, and support.",
  },
  {
    heading: "Our Mission, Your Future",
    text: "We partner with individuals and organizations to drive meaningful change.",
  },
  {
    heading: "Join the Movement",
    text: "Be a part of a network that believes in progress, purpose, and people.",
  },
];

function CarouselArea() {
  const [index, setIndex] = useState(0);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [captionKey, setCaptionKey] = useState(0);

  function handleSlid(selectedIndex) {
    setCaptionIndex(selectedIndex);
    setCaptionKey((k) => k + 1);
  }

  return (
    <div className="carousel-wrapper">
      <Carousel
        activeIndex={index}
        onSelect={setIndex}
        onSlid={handleSlid}
        className="custom-carousel"
        fade
        interval={5500}
        pause="hover"
      >
        {slides.map((slide, i) => (
          <Carousel.Item key={i}>
            <div className="carousel-image-container">
              <img
                src={slide}
                alt={`Slide ${i + 1}`}
                className="carousel-image"
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Single caption overlay — lives outside carousel items so it never crossfades */}
      <div className="carousel-overlay">
        <div className="carousel-caption">
          <div className="carousel-caption-inner" key={captionKey}>
            <h3 className="carousel-title">{slideContent[captionIndex].heading}</h3>
            <p className="carousel-text">{slideContent[captionIndex].text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarouselArea;
