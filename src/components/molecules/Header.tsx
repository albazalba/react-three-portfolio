import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

const Header = () => {
  const headerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const navItemsRef = useRef<HTMLUListElement>(null)

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

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 mx-auto my-4 max-w-7xl px-4">
      <div
        ref={headerRef}
        className="flex items-center justify-between rounded-full backdrop-blur-md bg-white/10 border border-white/20 shadow-lg px-8 py-6 hover:bg-white/15 transition-colors duration-300"
      >
        <div
          ref={logoRef}
          className="font-bold text-white text-xl relative cursor-pointer"
          onClick={scrollToSection('hero')}
        >
          <div className="!w-16 bg-cover overflow-hidden  ">
            <img src="/AQ.png" alt="Albaz Aqther" className="invert h-full bg-cover" />
          </div>
          <div className="absolute inset-0 bg-primary-500/20 rounded-full filter blur-sm -z-10 scale-[1.6] opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <nav>
          <ul ref={navItemsRef} className="flex space-x-6 text-base">
            <li className="nav-item"><a href="#hero" onClick={scrollToSection('hero')} className="!text-white hover:text-white/80 transition block py-1">Home</a></li>
            <li className="nav-item"><a href="#whatido" onClick={scrollToSection('whatido')} className="!text-white hover:text-white/80 transition block py-1">Services</a></li>
            <li className="nav-item"><a href="#experience" onClick={scrollToSection('experience')} className="!text-white hover:text-white/80 transition block py-1">Experience</a></li>
            <li className="nav-item"><a href="#projects" onClick={scrollToSection('projects')} className="!text-white hover:text-white/80 transition block py-1">Projects</a></li>
            <li className="nav-item"><a href="#contact" onClick={scrollToSection('contact')} className="!text-white hover:text-white/80 transition block py-1">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
