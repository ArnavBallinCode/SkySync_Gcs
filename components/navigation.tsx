"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-900 bg-opacity-90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white">
              TEAM <span className="text-blue-400">NJORDE</span>
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link 
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/" 
                  ? "text-white bg-blue-600" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/about"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/about" 
                  ? "text-white bg-blue-600" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              About
            </Link>
            <Link 
              href="/docs"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/docs" 
                  ? "text-white bg-blue-600" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 