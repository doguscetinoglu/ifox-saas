'use client'

import { useRef, type MouseEvent, type ReactNode } from 'react'

interface Card3DProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Card3D({ children, className = '', style }: Card3DProps) {
  const ref = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rx = (py - 0.5) * -15
    const ry = (px - 0.5) * 15
    el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.04,1.04,1.04)`
    el.style.transition = 'transform 0.08s ease'
    if (shineRef.current) {
      shineRef.current.style.opacity = '1'
      shineRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.22) 0%, transparent 55%)`
    }
  }

  function onLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
    el.style.transition = 'transform 0.65s cubic-bezier(0.23,1,0.32,1)'
    if (shineRef.current) {
      shineRef.current.style.opacity = '0'
    }
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative overflow-hidden cursor-default ${className}`}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform', ...style }}
    >
      <div ref={shineRef} className="absolute inset-0 pointer-events-none rounded-[inherit] z-10 opacity-0 transition-opacity duration-200" />
      {children}
    </div>
  )
}
