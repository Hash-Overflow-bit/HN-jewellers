import { useEffect, useRef, useState, useCallback } from 'react'
import './IntroAnimation.css'

const IntroAnimation = ({ onComplete }) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [phase, setPhase] = useState('entering') // entering -> holding -> dissolving -> done
  const particlesRef = useRef([])
  const animFrameRef = useRef(null)
  const textElementsRef = useRef([])

  // Capture text elements as DOM references
  const textLine1Ref = useRef(null)
  const textLine2Ref = useRef(null)
  const textLine3Ref = useRef(null)
  const dividerRef = useRef(null)

  const createParticlesFromElement = useCallback((element, canvas) => {
    if (!element || !canvas) return []

    const rect = element.getBoundingClientRect()
    const canvasRect = canvas.getBoundingClientRect()

    // Create an offscreen canvas to render the text
    const offscreen = document.createElement('canvas')
    const scale = 2 // Higher resolution sampling
    offscreen.width = rect.width * scale
    offscreen.height = rect.height * scale
    const offCtx = offscreen.getContext('2d')
    offCtx.scale(scale, scale)

    // Get computed styles
    const styles = window.getComputedStyle(element)
    offCtx.font = styles.font
    offCtx.fillStyle = styles.color
    offCtx.textAlign = 'center'
    offCtx.textBaseline = 'middle'

    // For the divider, draw a rectangle
    if (element.classList.contains('intro-divider')) {
      const gradient = offCtx.createLinearGradient(0, 0, rect.width, 0)
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(0.3, '#d4af37')
      gradient.addColorStop(0.7, '#d4af37')
      gradient.addColorStop(1, 'transparent')
      offCtx.fillStyle = gradient
      offCtx.fillRect(0, rect.height / 2 - 0.5, rect.width, 1)
    } else {
      // Draw text
      const text = element.textContent
      offCtx.fillText(text, rect.width / 2, rect.height / 2)
    }

    // Sample pixels
    const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height)
    const pixels = imageData.data
    const particles = []
    const samplingGap = 2 // Sample every N pixels

    for (let y = 0; y < offscreen.height; y += samplingGap) {
      for (let x = 0; x < offscreen.width; x += samplingGap) {
        const i = (y * offscreen.width + x) * 4
        const alpha = pixels[i + 3]
        if (alpha > 30) {
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]

          // Map position to canvas coordinates
          const canvasX = (rect.left - canvasRect.left) + (x / scale)
          const canvasY = (rect.top - canvasRect.top) + (y / scale)

          particles.push({
            x: canvasX,
            y: canvasY,
            originX: canvasX,
            originY: canvasY,
            color: `rgba(${r}, ${g}, ${b}, ${alpha / 255})`,
            size: Math.random() * 1.5 + 0.5,
            // Dissolve physics
            vx: (Math.random() - 0.5) * 4 + (Math.random() > 0.5 ? 2 : -2),
            vy: (Math.random() - 0.8) * 3 - 1, // Mostly upward
            gravity: -0.02 + Math.random() * 0.01,
            friction: 0.98 + Math.random() * 0.015,
            opacity: 1,
            fadeSpeed: 0.003 + Math.random() * 0.012,
            delay: Math.random() * 30, // Stagger the dissolve
            turbulenceX: Math.random() * 0.5,
            turbulenceY: Math.random() * 0.5,
            turbulencePhase: Math.random() * Math.PI * 2,
          })
        }
      }
    }
    return particles
  }, [])

  // Phase 1: Text entrance animation is CSS-based, just manage timing
  useEffect(() => {
    // Let the CSS entrance animations play
    const holdTimer = setTimeout(() => {
      setPhase('holding')
    }, 2800) // Wait for all text to animate in

    return () => clearTimeout(holdTimer)
  }, [])

  // Phase 2: Hold briefly then dissolve
  useEffect(() => {
    if (phase !== 'holding') return

    const dissolveTimer = setTimeout(() => {
      setPhase('dissolving')
    }, 1200)

    return () => clearTimeout(dissolveTimer)
  }, [phase])

  // Phase 3: Dissolve into dust particles
  useEffect(() => {
    if (phase !== 'dissolving') return

    const canvas = canvasRef.current
    if (!canvas) return
    
    // Set canvas to full screen
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')

    // Collect particles from all text elements
    const elements = [
      textLine1Ref.current,
      dividerRef.current,
      textLine2Ref.current,
      textLine3Ref.current,
    ].filter(Boolean)

    let allParticles = []
    elements.forEach(el => {
      const p = createParticlesFromElement(el, canvas)
      allParticles = allParticles.concat(p)
    })

    particlesRef.current = allParticles

    // Hide the original text elements — must kill CSS animation first
    // because animation-fill-mode: forwards overrides inline styles
    elements.forEach(el => {
      el.style.animation = 'none'
      el.style.opacity = '0'
      el.style.visibility = 'hidden'
    })
    // Also hide the text container itself to be absolutely sure
    const textContainer = containerRef.current?.querySelector('.intro-text-container')
    if (textContainer) {
      textContainer.style.visibility = 'hidden'
    }

    let frame = 0
    let allFaded = false

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      let aliveCount = 0

      particlesRef.current.forEach(p => {
        if (p.delay > 0) {
          // Still waiting to start dissolving, draw at original position
          p.delay--
          ctx.fillStyle = p.color
          ctx.fillRect(p.originX, p.originY, p.size, p.size)
          aliveCount++
          return
        }

        if (p.opacity <= 0) return

        aliveCount++

        // Apply turbulence
        const turbX = Math.sin(frame * 0.02 + p.turbulencePhase) * p.turbulenceX
        const turbY = Math.cos(frame * 0.03 + p.turbulencePhase) * p.turbulenceY

        p.vx += turbX * 0.1
        p.vy += p.gravity + turbY * 0.1
        p.vx *= p.friction
        p.vy *= p.friction

        p.x += p.vx
        p.y += p.vy
        p.opacity -= p.fadeSpeed

        if (p.opacity > 0) {
          ctx.globalAlpha = Math.max(0, p.opacity)
          ctx.fillStyle = p.color
          ctx.fillRect(p.x, p.y, p.size, p.size)
        }
      })

      ctx.globalAlpha = 1
      frame++

      if (aliveCount > 0 && !allFaded) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        allFaded = true
        setPhase('done')
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [phase, createParticlesFromElement])

  // Phase 4: Complete — trigger callback
  useEffect(() => {
    if (phase !== 'done') return
    const exitTimer = setTimeout(() => {
      onComplete()
    }, 400)
    return () => clearTimeout(exitTimer)
  }, [phase, onComplete])

  return (
    <div
      ref={containerRef}
      className={`intro-overlay ${phase === 'done' ? 'intro-exit' : ''}`}
    >
      {/* Ambient glow */}
      <div className="intro-ambient-glow" />

      {/* Text content */}
      <div className="intro-text-container">
        <p ref={textLine1Ref} className="intro-tagline">
          A Legacy of Elegance
        </p>
        <div ref={dividerRef} className="intro-divider" />
        <h1 ref={textLine2Ref} className="intro-title">
          HN Jewellers
        </h1>
        <p ref={textLine3Ref} className="intro-subtitle">
          Where Luxury Meets Timelessness
        </p>
      </div>

      {/* Canvas for particle dissolution */}
      <canvas
        ref={canvasRef}
        className={`intro-canvas ${phase === 'dissolving' ? 'active' : ''}`}
      />

      {/* Subtle grain overlay */}
      <div className="intro-grain" />
    </div>
  )
}

export default IntroAnimation
