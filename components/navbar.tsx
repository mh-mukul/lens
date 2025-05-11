"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { gsap } from "gsap"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      setIsLoggedIn(!!data.session)
    }

    checkUser()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setIsLoggedIn(true)
      } else if (event === "SIGNED_OUT") {
        setIsLoggedIn(false)
      }
    })

    // Animation for nav items
    gsap.fromTo(
      ".nav-item",
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power2.out" },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const toggleMenu = () => setIsOpen(!isOpen)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    if (pathname === "/upload") {
      router.push("/")
    }
  }

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Gallery", path: "/gallery" },
    { name: "About", path: "/#about" },
    { name: "Contact", path: "/#contact" },
  ]

  return (
    <header className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link href="/" className="font-bold text-xl">
          LENS
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.path}
              className={`nav-item transition-colors hover:text-primary ${
                pathname === item.path ? "text-primary" : "text-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}

          {isLoggedIn && (
            <>
              <Link href="/upload" className="nav-item">
                <Button variant="outline" size="sm">
                  Upload
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="nav-item">
                Logout
              </Button>
            </>
          )}

          <div className="nav-item">
            <ModeToggle />
          </div>
        </div>

        <button className="md:hidden" onClick={toggleMenu}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute w-full bg-background border-b">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                className={`transition-colors hover:text-primary ${
                  pathname === item.path ? "text-primary" : "text-foreground"
                }`}
                onClick={toggleMenu}
              >
                {item.name}
              </Link>
            ))}

            {isLoggedIn && (
              <>
                <Link href="/upload" onClick={toggleMenu}>
                  <Button variant="outline" size="sm" className="w-full">
                    Upload
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleLogout()
                    toggleMenu()
                  }}
                  className="w-full"
                >
                  Logout
                </Button>
              </>
            )}

            <div className="flex justify-end">
              <ModeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
