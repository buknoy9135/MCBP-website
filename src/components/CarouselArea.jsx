import Carousel from "react-bootstrap/Carousel";
import slide1 from "../assets/carousel-images/slide1.jpg";
import slide2 from "../assets/carousel-images/slide2.jpg";
import slide3 from "../assets/carousel-images/slide3.jpg";
import "../css/CarouselArea.css";

const slideContent = [
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
  return (
    <Carousel className="custom-carousel" fade>
      {[slide1, slide2, slide3].map((slide, index) => (
        <Carousel.Item interval={4000} key={index}>
          <div className="carousel-image-container">
            <img
              src={slide}
              alt={`Slide ${index + 1}`}
              className="carousel-image"
            />
            <div className="carousel-overlay">
              <div className="carousel-caption">
                <h3>{slideContent[index].heading}</h3>
                <p>{slideContent[index].text}</p>
              </div>
            </div>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default CarouselArea;
