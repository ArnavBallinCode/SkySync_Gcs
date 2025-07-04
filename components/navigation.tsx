"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/" },
    { name: "Position", href: "/position" },
    { name: "Attitude", href: "/attitude" },
    { name: "Parameters", href: "/parameters" },
    { name: "Telemetry", href: "/telemetry" },
    { name: "Radio", href: "/radio" },
    { name: "Calibration", href: "/calibration" },
    { name: "Safe Spots", href: "/safe-spots" },
    { name: "History", href: "/history" },
    { name: "Arena", href: "/arena" },
    { name: "About", href: "/about" },
    { name: "Docs", href: "/docs" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-900 bg-opacity-90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white">
              SKY <span className="text-blue-400">Sync</span>
            </Link>
          </div>
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link 
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href 
                    ? "text-white bg-blue-600" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}