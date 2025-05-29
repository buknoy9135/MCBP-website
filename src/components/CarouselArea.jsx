import Carousel from 'react-bootstrap/Carousel';
import slide1 from '../assets/carousel-images/slide1.jpg';
import slide2 from '../assets/carousel-images/slide2.jpg';
import slide3 from '../assets/carousel-images/slide3.jpg';
import '../css/CarouselArea.css'

function CarouselArea() {
  const imgStyleMobile = {
    width: '350px',
    height: '235px',
    objectFit: 'fill',
    backgroundColor: 'white',
    opacity: 0.8,
    filter: 'brightness(70%)', 
    transition: 'opacity 0.3s ease-in-out',
  };

  const imgStyleDesktop = {
    width: '950px',
    height: '650px',
    objectFit: 'fill',
    backgroundColor: 'white',
    opacity: 0.8,
    filter: 'brightness(70%)', 
    transition: 'opacity 0.3s ease-in-out',
  };

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


  return (
    <Carousel className="pt-3 pt-lg-5 mt-5" style={{ paddingTop: '80px', scrollMarginTop: '80px' }}>
      {[slide1, slide2, slide3].map((slide, index) => (
  <Carousel.Item interval={3000} key={index}>
    <div className="carousel-image-container">
      {/* Mobile image */}
      <img
        src={slide}
        alt={`Slide ${index + 1}`}
        className="d-block d-lg-none mx-auto carousel-image"
        style={imgStyleMobile}
      />
      {/* Desktop image */}
      <img
        src={slide}
        alt={`Slide ${index + 1}`}
        className="d-none d-lg-block mx-auto pt-0 carousel-image"
        style={imgStyleDesktop}
      />

      {/* Dark overlay */}
      <div className="carousel-overlay"></div>

      {/* Text */}
      <div className="carousel-caption">
        <h3>{slideContent[index].heading}</h3>
        <p>{slideContent[index].text}</p>
      </div>
    </div>
  </Carousel.Item>
))}

    </Carousel>
  );
}

export default CarouselArea;
