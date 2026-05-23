'use client'
import { useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface MathRendererProps {
  latex: string
  displayMode?: boolean
  className?: string
}

export function MathRenderer({ latex, displayMode = false, className = '' }: MathRendererProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(latex, ref.current, {
          displayMode,
          throwOnError: false,
          trust: true,
          strict: false,
          macros: {
            '\\R': '\\mathbb{R}',
            '\\N': '\\mathbb{N}',
            '\\Z': '\\mathbb{Z}',
          },
        })
      } catch {
        if (ref.current) ref.current.textContent = latex
      }
    }
  }, [latex, displayMode])

  return (
    <div
      ref={ref}
      className={`katex-container ${className}`}
      style={{ color: 'white' }}
    />
  )
}
