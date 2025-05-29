import Carousel from 'react-bootstrap/Carousel';
import slide1 from '../assets/carousel-images/slide1.jpg';
import slide2 from '../assets/carousel-images/slide2.jpg';
import slide3 from '../assets/carousel-images/slide3.jpg';
import '../css/CarouselArea.css'

function CarouselArea() {
  const imgStyleMobile = {
    width: '300px',
    height: '200px',
    objectFit: 'fill',
    backgroundColor: 'white',
    opacity: 0.8,
    transition: 'opacity 0.3s ease-in-out',
  };

  const imgStyleDesktop = {
    width: '950px',
    height: '650px',
    objectFit: 'fill',
    backgroundColor: 'white',
    opacity: 0.8,
    transition: 'opacity 0.3s ease-in-out',
  };

  return (
    <Carousel className="pt-3 pt-lg-5 mt-5">
      {[slide1, slide2, slide3].map((slide, index) => (
        <Carousel.Item interval={3000} key={index}>
          {/* Mobile view */}
          <img
            src={slide}
            alt={`Slide ${index + 1}`}
            className="d-block d-lg-none mx-auto pt-3 carousel-image"
            style={imgStyleMobile}
          />
          {/* Desktop view */}
          <img
            src={slide}
            alt={`Slide ${index + 1}`}
            className="d-none d-lg-block mx-auto pt-0 carousel-image"
            style={imgStyleDesktop}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default CarouselArea;
