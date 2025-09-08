import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const Header = () => {
  const headerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const navItemsRef = useRef<HTMLUListElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Set initial states
    gsap.set(headerRef.current, {
      y: -100,
      opacity: 0
    })

    gsap.set(logoRef.current, {
      scale: 0.8,
      opacity: 0
    })

    gsap.set('.nav-item', {
      y: -20,
      opacity: 0
    })

    gsap.set(hamburgerRef.current, {
      scale: 0.8,
      opacity: 0
    })

    // Create animation timeline
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.to(headerRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      delay: 0.2
    })
      .to(logoRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.6
      }, '-=0.4')
      .to('.nav-item', {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.1
      }, '-=0.3')
      .to(hamburgerRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.6
      }, '-=0.5')

    // Hover animations for nav items
    const navItems = document.querySelectorAll('.nav-item')
    const enterHandlers: Record<number, (e: Event) => void> = {}
    const leaveHandlers: Record<number, (e: Event) => void> = {}

    navItems.forEach((item, index) => {
      // Create unique handler functions for each item
      enterHandlers[index] = (e: Event) => {
        gsap.to(item, {
          y: -3,
          duration: 0.2,
          ease: 'power2.out'
        })
      }

      leaveHandlers[index] = (e: Event) => {
        gsap.to(item, {
          y: 0,
          duration: 0.2,
          ease: 'power2.out'
        })
      }

      // Add the event listeners
      item.addEventListener('mouseenter', enterHandlers[index])
      item.addEventListener('mouseleave', leaveHandlers[index])
    })

    // Clean up event listeners on unmount
    return () => {
      navItems.forEach((item, index) => {
        item.removeEventListener('mouseenter', enterHandlers[index])
        item.removeEventListener('mouseleave', leaveHandlers[index])
      })
    }
  }, [])

  // Mobile menu animation
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (isMobileMenuOpen) {
        gsap.to(mobileMenuRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        })
        gsap.to('.mobile-nav-item', {
          y: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.1,
          delay: 0.1
        })
      } else {
        gsap.to(mobileMenuRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.3,
          ease: 'power2.in'
        })
      }
    }
  }, [isMobileMenuOpen])

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    // Close mobile menu when navigating
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 mx-auto my-2 md:my-4 max-w-7xl px-2 md:px-4">
        <div
          ref={headerRef}
          className="flex items-center justify-between rounded-full backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
        >
          {/* Logo */}
          <div
            ref={logoRef}
            className="font-bold text-white text-lg sm:text-xl md:text-xl relative cursor-pointer group"
            onClick={scrollToSection('hero')}
          >
            <div className="max-w-10 max-h-10 sm:w-12 md:w-16 bg-cover overflow-hidden transition-transform duration-300 group-hover:scale-110">
              <img src="/AQ.png" alt="Albaz Aqther" className="invert h-full bg-cover" />
            </div>
            <div className="absolute inset-0 bg-primary-500/20 rounded-full filter blur-md -z-10 scale-[1.8] opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul ref={navItemsRef} className="flex space-x-6 text-base">
              <li className="nav-item hover:text-primary-500"><a href="#hero" onClick={scrollToSection('hero')} className="!text-white hover:text-primary-500 transition block py-1">Home</a></li>
              <li className="nav-item hover:text-primary-500"><a href="#whatido" onClick={scrollToSection('whatido')} className="!text-white hover:text-primary-500 transition block py-1">Services</a></li>
              <li className="nav-item hover:text-primary-500"><a href="#experience" onClick={scrollToSection('experience')} className="!text-white hover:text-primary-500 transition block py-1">Experience</a></li>
              <li className="nav-item hover:text-primary-500"><a href="#projects" onClick={scrollToSection('projects')} className="!text-white hover:text-primary-500 transition block py-1">Projects</a></li>
              <li className="nav-item hover:text-primary-500"><a href="#contact" onClick={scrollToSection('contact')} className="!text-white hover:text-primary-500 transition block py-1">Contact</a></li>
            </ul>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            ref={hamburgerRef}
            onClick={toggleMobileMenu}
            className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-full backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer group transition-all duration-300"
            aria-label="Toggle mobile menu"
          >
            <div className="flex flex-col items-center justify-center space-y-1">
              <span className={`w-5 h-0.5 bg-white transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-white transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-white transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        </div>
      )}

      {/* Mobile Navigation Menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-14 sm:top-16 left-2 right-2 z-50 md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
      >
        <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden">
          <nav className="py-4">
            <ul className="space-y-1">
              <li className="mobile-nav-item opacity-0 translate-y-4">
                <a
                  href="#hero"
                  onClick={scrollToSection('hero')}
                  className="block px-6 py-3 text-white hover:text-primary-500 hover:bg-white/10 hover:backdrop-blur-lg transition-all duration-200 rounded-lg mx-2"
                >
                  Home
                </a>
              </li>
              <li className="mobile-nav-item opacity-0 translate-y-4">
                <a
                  href="#whatido"
                  onClick={scrollToSection('whatido')}
                  className="block px-6 py-3 text-white hover:text-primary-500 hover:bg-white/10 hover:backdrop-blur-lg transition-all duration-200 rounded-lg mx-2"
                >
                  Services
                </a>
              </li>
              <li className="mobile-nav-item opacity-0 translate-y-4">
                <a
                  href="#experience"
                  onClick={scrollToSection('experience')}
                  className="block px-6 py-3 text-white hover:text-primary-500 hover:bg-white/10 hover:backdrop-blur-lg transition-all duration-200 rounded-lg mx-2"
                >
                  Experience
                </a>
              </li>
              <li className="mobile-nav-item opacity-0 translate-y-4">
                <a
                  href="#projects"
                  onClick={scrollToSection('projects')}
                  className="block px-6 py-3 text-white hover:text-primary-500 hover:bg-white/10 hover:backdrop-blur-lg transition-all duration-200 rounded-lg mx-2"
                >
                  Projects
                </a>
              </li>
              <li className="mobile-nav-item opacity-0 translate-y-4">
                <a
                  href="#contact"
                  onClick={scrollToSection('contact')}
                  className="block px-6 py-3 text-white hover:text-primary-500 hover:bg-white/10 hover:backdrop-blur-lg transition-all duration-200 rounded-lg mx-2"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Header
