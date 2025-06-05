import React, { useEffect, useRef, useMemo } from "react";
import { useSwipeable } from "react-swipeable";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

// import "../css/ImageModal.css";

const ImageModal = ({ images, currentIndex, setCurrentIndex, onClose }) => {
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  //to fix thumbnail not starting at the first one in the strip

  const thumbContainerRef = useRef(null);

  useEffect(() => {
    if (thumbContainerRef.current) {
      thumbContainerRef.current.scrollLeft = 0;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  //to fix thumbnail strip not synching with selected image
  const thumbnailRefs = useRef([]);

  useEffect(() => {
    const activeThumb = thumbnailRefs.current[currentIndex];
    if (activeThumb && activeThumb.scrollIntoView) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentIndex]);

  return createPortal(
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.85)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1050,
        padding: "1rem",
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: "fixed",
          top: "1rem",
          right: window.innerWidth > 768 ? "15rem" : "1rem",
          background: "rgba(0,0,0,0.6)",
          border: "none",
          color: "#fff",
          fontSize: "2rem",
          fontWeight: "bold",
          borderRadius: "999px",
          width: "44px",
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1100,
          touchAction: "manipulation",
        }}
        aria-label="Close"
      >
        ×
      </button>

      <div
        {...handlers}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "95vw",
          maxHeight: "95vh",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          style={{
            maxWidth: "100%",
            maxHeight: "70vh",
            borderRadius: "8px",
            boxShadow: "0 0 30px rgba(0, 0, 0, 0.6)",
            backgroundColor: "#fff",
          }}
        />

        <div
          style={{
            marginTop: "0.75rem",
            fontSize: "0.95rem",
            color: "#ccc",
          }}
        >
          {currentIndex + 1} / {images.length}
          <span
            className="d-block d-md-none"
            style={{
              fontSize: "0.85rem",
              marginTop: "0.25rem",
            }}
          >
            ← Swipe | Tap →
          </span>
        </div>

        {/* Navigation Arrows */}
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            justifyContent: "center",
            gap: "2.5rem",
          }}
        >
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={{
              background: "none",
              border: "none",
              color: currentIndex === 0 ? "#777" : "#fff",
              fontSize: "2rem",
              cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            }}
          >
            <ChevronLeft size={44} />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === images.length - 1}
            style={{
              background: "none",
              border: "none",
              color: currentIndex === images.length - 1 ? "#777" : "#fff",
              fontSize: "2rem",
              cursor:
                currentIndex === images.length - 1 ? "not-allowed" : "pointer",
            }}
          >
            <ChevronRight size={44} />
          </button>
        </div>

        {/* Thumbnails */}
        <div
          ref={thumbContainerRef}
          style={{
            marginTop: "1.5rem",
            display: "flex",
            justifyContent: "flex-start", // this is key
            overflowX: "auto",
            gap: "0.5rem",
            paddingBottom: "0.5rem",
          }}
        >
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              ref={(el) => (thumbnailRefs.current[idx] = el)}
              alt={`Thumb ${idx + 1}`}
              onClick={() => setCurrentIndex(idx)}
              style={{
                height: "50px",
                borderRadius: "4px",
                border:
                  idx === currentIndex
                    ? "2px solid #fff"
                    : "2px solid transparent",
                cursor: "pointer",
                opacity: idx === currentIndex ? 1 : 0.7,
                transition: "transform 0.2s",
              }}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageModal;
