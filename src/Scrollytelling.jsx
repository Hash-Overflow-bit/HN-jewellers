import React, { useRef, useEffect, useState } from 'react';
import './Scrollytelling.css';

const Scrollytelling = ({ frameCount, framePattern }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  // Preload images
  useEffect(() => {
    const loadedImages = [];
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      // ezgif-frame-001.jpg format
      const paddedIndex = i.toString().padStart(3, '0');
      img.src = framePattern.replace('###', paddedIndex);
      
      img.onload = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);
        // Draw the first frame when it loads
        if (i === 1 && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      };
      
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, [frameCount, framePattern]);

  // Handle scroll and drawing frames
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !canvasRef.current || images.length === 0) return;

      const container = containerRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Calculate the scroll progress relative to the container
      const rect = container.getBoundingClientRect();
      
      // If the container is above the viewport by more than its height (minus 1 viewport), we are at the end.
      // If it's below the viewport, we are at the beginning.
      // We want to track progress while it's pinned (sticky).
      
      const scrollDistance = rect.height - window.innerHeight;
      
      // Rect.top is 0 when the sticky section hits the top of the viewport.
      let progress = -rect.top / scrollDistance;
      
      // Clamp progress between 0 and 1
      progress = Math.max(0, Math.min(1, progress));

      // Determine which frame to show
      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(progress * frameCount)
      );

      const img = images[frameIndex];
      // Check if image is loaded and valid before drawing
      if (img && img.complete && img.naturalHeight !== 0) {
        // Draw image maintaining its original aspect ratio, sized to look like a physical luxury watch
        // Calculate the standard "contain" scale
        const containScale = Math.min(
          canvas.width / img.width, 
          canvas.height / img.height
        );
        
        // Cap the height to roughly 600px so it feels like a normal watch size on screen
        const maxWatchHeight = 600;
        const watchScale = Math.min(containScale, maxWatchHeight / img.height);

        const drawWidth = img.width * watchScale;
        const drawHeight = img.height * watchScale;
        
        const offsetX = (canvas.width - drawWidth) / 2;
        const offsetY = (canvas.height - drawHeight) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Hide watermark by cropping the bottom 6% of the source image frames
        const cropRatio = 0.06;
        const sourceWidth = img.width;
        const sourceHeight = img.height * (1 - cropRatio);
        const adjustedDrawHeight = drawHeight * (1 - cropRatio);
        
        ctx.drawImage(
          img,
          0, 0, sourceWidth, sourceHeight,           // Source crop x, y, width, height
          offsetX, offsetY, drawWidth, adjustedDrawHeight // Destination x, y, width, height
        );
      }
    };

    // Use requestAnimationFrame for smooth drawing
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener);
    // Initial draw
    handleScroll();

    return () => window.removeEventListener('scroll', scrollListener);
  }, [images, frameCount]);

  // Handle canvas sizing
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial size
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div className="scrollytelling-container" ref={containerRef}>
      <div className="sticky-wrapper">
        <canvas ref={canvasRef} className="scrollytelling-canvas" />
        
        {/* Loading overlay for premium feel while large images load */}
        {imagesLoaded < frameCount && (
          <div className="loading-overlay">
            <span className="loader">INITIALIZING {Math.round((imagesLoaded / frameCount) * 100)}%</span>
          </div>
        )}
        
        {/* We can inject elements mapped to specific scroll points inside here or manage it from parent */}
      </div>
    </div>
  );
};

export default Scrollytelling;
