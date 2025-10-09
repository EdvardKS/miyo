'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  shape: 'circle' | 'square' | 'triangle'
  color: string
}

export default function Particles({ 
  count = 50, 
  className = '',
  variant = 'dark' 
}: { 
  count?: number
  className?: string
  variant?: 'dark' | 'light'
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Crear partículas
    const particles: Particle[] = []
    const colors = variant === 'dark' 
      ? ['#FFD700', '#FFA500', '#FF8C00', '#DAA520', '#B8860B'] // Dorados oscuros
      : ['#FFD700', '#FFED4E', '#FFF59D', '#FFEB3B', '#FFC107'] // Dorados claros

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as Particle['shape'],
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    const drawParticle = (particle: Particle) => {
      ctx.save()
      ctx.globalAlpha = particle.opacity
      ctx.fillStyle = particle.color
      ctx.strokeStyle = particle.color
      ctx.lineWidth = 1

      switch (particle.shape) {
        case 'circle':
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'square':
          ctx.fillRect(
            particle.x - particle.size,
            particle.y - particle.size,
            particle.size * 2,
            particle.size * 2
          )
          break
        case 'triangle':
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y - particle.size)
          ctx.lineTo(particle.x - particle.size, particle.y + particle.size)
          ctx.lineTo(particle.x + particle.size, particle.y + particle.size)
          ctx.closePath()
          ctx.fill()
          break
      }

      ctx.restore()
    }

    const updateParticle = (particle: Particle) => {
      particle.x += particle.speedX
      particle.y += particle.speedY

      // Rebotar en los bordes
      if (particle.x < 0 || particle.x > canvas.width) {
        particle.speedX = -particle.speedX
      }
      if (particle.y < 0 || particle.y > canvas.height) {
        particle.speedY = -particle.speedY
      }

      // Mantener partículas dentro del canvas
      particle.x = Math.max(0, Math.min(canvas.width, particle.x))
      particle.y = Math.max(0, Math.min(canvas.height, particle.y))
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(particle => {
        updateParticle(particle)
        drawParticle(particle)
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [count, variant])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    />
  )
}