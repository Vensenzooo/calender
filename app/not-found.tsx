import Link from "next/link"
import Image from "next/image"

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4 drop-shadow-md">Page Not Found</h2>
        <p className="text-xl text-white/90 mb-8 max-w-md mx-auto drop-shadow-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors shadow-lg"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
