'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import Image from 'next/image'

// Dynamically import Spline to avoid SSR issues and reduce initial bundle size
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => null,
})

const SPLINE_SCENE_URL =
  'https://prod.spline.design/f58cebd7-7c3b-4f95-b608-24d925db94ce/scene.splinecode'

interface SplineCharacterProps {
  /** Fallback SVG avatar path shown while Spline loads or on error */
  fallbackSrc: string
  /** Alt text for the fallback image */
  fallbackAlt: string
  /** Width/height of the container in px */
  size?: number
  /** Accent color for the spinner ring */
  accentColor?: string
}

function FallbackAvatar({
  src,
  alt,
  size,
}: {
  src: string
  alt: string
  size: number
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated', borderRadius: 8 }}
    />
  )
}

function LoadingRing({ size, color }: { size: number; color: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: size * 0.6,
          height: size * 0.6,
          borderRadius: '50%',
          border: `3px solid ${color}33`,
          borderTop: `3px solid ${color}`,
          animation: 'spin 0.9s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function SplineViewer({
  fallbackSrc,
  fallbackAlt,
  size,
  accentColor = 'var(--color-coral)',
}: SplineCharacterProps & { size: number }) {
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(true)

  if (failed) {
    return <FallbackAvatar src={fallbackSrc} alt={fallbackAlt} size={size} />
  }

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LoadingRing size={size} color={accentColor} />
        </div>
      )}
      <Spline
        scene={SPLINE_SCENE_URL}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false)
          setFailed(true)
        }}
        style={{
          width: size,
          height: size,
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}
      />
    </div>
  )
}

export default function SplineCharacter({
  fallbackSrc,
  fallbackAlt,
  size = 200,
  accentColor = 'var(--color-coral)',
}: SplineCharacterProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 12,
      }}
    >
      <Suspense fallback={<LoadingRing size={size} color={accentColor} />}>
        <SplineViewer
          fallbackSrc={fallbackSrc}
          fallbackAlt={fallbackAlt}
          size={size}
          accentColor={accentColor}
        />
      </Suspense>
    </div>
  )
}
