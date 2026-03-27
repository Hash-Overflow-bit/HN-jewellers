import { useEffect, useState, useCallback } from 'react'
import IntroAnimation from './IntroAnimation'
import Scrollytelling from './Scrollytelling'
import './App.css'

function App() {
  const [scrolled, setScrolled] = useState(false)
  const [introComplete, setIntroComplete] = useState(false)
  const [showContent, setShowContent] = useState(false)

  // Prevent scrolling during intro
  useEffect(() => {
    if (!introComplete) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [introComplete])

  // Add a scroll listener just for the header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
    // Small delay before revealing content for smooth transition
    setTimeout(() => {
      setShowContent(true)
    }, 100)
  }, [])

  return (
    <div className="app-container">
      {/* Intro Animation Overlay */}
      {!introComplete && <IntroAnimation onComplete={handleIntroComplete} />}

      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${showContent ? 'navbar-visible' : 'navbar-hidden'}`}>
        <div className="logo">AURA TIMEPIECES</div>
        <div className="nav-links">
          <a href="#collection">Collection</a>
          <a href="#craftsmanship">Craftsmanship</a>
          <a href="#concierge">Concierge</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`hero ${showContent ? 'hero-revealed' : ''}`}>
        {/* Floating Watch Images */}
        <div className="hero-watches">
          <img src="/assets/hero_watch_1.png" alt="" className="floating-watch watch-1" />
          <img src="/assets/hero_watch_2.png" alt="" className="floating-watch watch-2" />
          <img src="/assets/hero_watch_3.png" alt="" className="floating-watch watch-3" />
        </div>

        <div className="hero-content">
          <p className="hero-subtitle">The new Genesis Chronograph. Engineered for those who command time.</p>
          <h1>Eternity in Motion.</h1>
        </div>

        {/* Scroll indicator — outside hero-content so it's not behind heading */}
        <div className="scroll-indicator">
          <span>Discover</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* Scrollytelling Section */}
      <section className="product-showcase">
        <Scrollytelling 
          frameCount={240} 
          framePattern="/frames/ezgif-frame-###.jpg" 
        />
        
        {/* Overlay textual elements */}
        <div className="overlay-text overlay-1">
          <h2>Precision Engineering</h2>
          <p>240 meticulously crafted components working in perfect harmony.</p>
        </div>
        
        <div className="overlay-text overlay-2">
          <h2>18K Rose Gold</h2>
          <p>Hand-polished case echoing the brilliance of a setting sun.</p>
        </div>
        
        <div className="overlay-text overlay-3">
          <h2>Sapphire Crystal</h2>
          <p>Anti-reflective coating revealing the mesmerizing tourbillon.</p>
        </div>
      </section>

      {/* Masterclass Collection Section */}
      <section className="masterclass-collection" id="collection">
        <div className="section-header">
          <h2>The Masterclass Collection</h2>
          <p>Bespoke timepieces crafted for the world's elite.</p>
        </div>
        <div className="watch-grid">
          <div className="watch-card">
            <div className="img-wrapper">
              <img src="/assets/watch_masterpiece_1_1774568954443.png" alt="Skeleton Tourbillon" />
            </div>
            <h3>Skeleton Vanguard</h3>
            <p className="price">$450,000</p>
          </div>
          <div className="watch-card">
            <div className="img-wrapper">
              <img src="/assets/watch_masterpiece_2_1774568971300.png" alt="Meteorite Rose Gold" />
            </div>
            <h3>Celestial Rose</h3>
            <p className="price">$325,000</p>
          </div>
          <div className="watch-card">
            <div className="img-wrapper">
              <img src="/assets/watch_masterpiece_3_1774568983996.png" alt="Futuristic Sapphire" />
            </div>
            <h3>Sapphire Horizon</h3>
            <p className="price">$610,000</p>
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="craftsmanship" id="craftsmanship">
        <div className="craft-content">
          <h2>The Art of Precision</h2>
          <p>Forged from aerospace-grade titanium and hand-polished to an immaculate mirror finish. Every internal and external component of the Genesis Chronograph is assembled under microscopic scrutiny, ensuring absolute and flawless chronometry.</p>
        </div>
      </section>

      {/* Specifications Section */}
      <section className="specifications">
        <div className="specs-grid">
          <div className="spec-card">
            <h3>Movement</h3>
            <p>Caliber AX-7 Tourbillon</p>
          </div>
          <div className="spec-card">
            <h3>Power Reserve</h3>
            <p>120 Hours</p>
          </div>
          <div className="spec-card">
            <h3>Water Resistance</h3>
            <p>100 Meters / 10 ATM</p>
          </div>
          <div className="spec-card">
            <h3>Case Material</h3>
            <p>18K Rose Gold & Carbon</p>
          </div>
        </div>
      </section>

      {/* Finishing Section */}
      <section className="footer-cta" id="concierge">
        <div className="cta-content">
          <h2>Your Legacy Awaits.</h2>
          <button className="btn-primary">Reserve Now</button>
        </div>
        <footer>
          <p>&copy; 2026 Aura Timepieces. All rights reserved.</p>
        </footer>
      </section>
    </div>
  )
}

export default App
