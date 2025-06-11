import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGithub } from 'react-icons/fa'

const Hero = () => {
  const cardRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const socialIconsRef = useRef<HTMLDivElement>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Initial state - card is scaled down and content is invisible
    gsap.set(cardRef.current, {
      scale: 0.5,
      opacity: 0,
      transformOrigin: 'center center'
    })

    gsap.set(contentRef.current, {
      opacity: 0,
      y: 30
    })

    gsap.set(socialIconsRef.current, {
      opacity: 0,
      y: 20
    })

    // Animation timeline
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.to(cardRef.current, {
      scale: 1,
      opacity: 1,
      duration: 1.2,
      delay: 0.3
    })
    .to(contentRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8
    }, '-=0.5') // Start slightly before the card animation finishes
    .to(socialIconsRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1
    }, '-=0.3')

  }, [])

  const scrollToSection = (id: string) => () => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Track mouse position for glow effect
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    // Calculate mouse position relative to the card
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate rotation values (smaller values for more subtle effect)
    const rotateY = ((x / rect.width) - 0.5) * 5; // -2.5 to 2.5 degrees (subtle)
    const rotateX = ((y / rect.height) - 0.5) * -5; // 2.5 to -2.5 degrees (inverted)

    // Apply transform
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

    // Update mouse position for glow effect
    setMousePosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  // Reset transform on mouse leave
  const handleCardMouseLeave = () => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    setIsHovering(false);
  };

  // Handle mouse enter
  const handleCardMouseEnter = () => {
    setIsHovering(true);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-screen flex items-center justify-center overflow-hidden px-4 py-12 pointer-events-none"
      aria-label="Hero Section"
      itemScope
      itemType="https://schema.org/AboutPage"
    >
      {/* Background with subtle pattern or noise */}
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700/10 to-primary-500/10" />
        <div className="absolute h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiMyMjIiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')]" />
      </div>

      {/* Animated background circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-700/20 rounded-full filter blur-3xl animate-blob animation-delay-2000" aria-hidden="true" />
      <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-200/30 rounded-full filter blur-3xl animate-blob" aria-hidden="true" />

      {/* Card container for 3D effect */}
      <div
        ref={cardContainerRef}
        className="w-full max-w-7xl pointer-events-auto magic-card-container"
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        onMouseEnter={handleCardMouseEnter}
      >
        {/* Glow effect */}
        <div
          className="magic-glow absolute -inset-10 opacity-0 transition-opacity duration-500 rounded-[30px]"
          style={{
            opacity: isHovering ? 0.15 : 0,
            background: `radial-gradient(800px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(120, 119, 198, 0.8), transparent 40%)`,
          }}
        />

        {/* Border glow */}
        <div
          className={`absolute inset-0.5 rounded-2xl opacity-0 transition-opacity duration-500 bg-gradient-to-br from-primary-700 to-primary-500 p-px blur-sm ${isHovering ? 'opacity-60' : ''}`}
        />

        {/* Magic shine effect */}
        <div
          className={`absolute inset-0 rounded-2xl overflow-hidden ${isHovering ? 'magic-shine' : ''}`}
          style={{
            '--x': `${mousePosition.x}%`,
            '--y': `${mousePosition.y}%`
          } as React.CSSProperties}
        />

        {/* Glassmorphic Card - centered with flex */}
        <div
          ref={cardRef}
          className="magic-card w-full max-w-7xl backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] overflow-hidden relative z-10 will-change-transform transition-[transform] duration-[400ms] ease-[cubic-bezier(0.03,0.98,0.52,0.99)]"
          style={{transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'}}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 sm:p-12">
            {/* Left Column - Content */}
            <div ref={contentRef} className="flex flex-col justify-center" itemProp="mainContentOfPage">
              <h2 className="text-xl sm:text-2xl text-white/80 font-light mb-2">
                Hello I'M A
              </h2>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6" itemProp="headline">
                <span className="text-white">Web </span>
                <span className="bg-gradient-to-r from-primary-200 to-primary-500 bg-clip-text text-primary-900" itemProp="specialty">
                  Developer.
                </span>
              </h1>

              <p className="text-lg text-gray-300 font-light mb-8 max-w-xl" itemProp="description">
                Hi I'm Albaz Aqther, a passionate Developer based in Dubai, Welcome to my world.
              </p>

              {/* Social Media Icons */}
              <div ref={socialIconsRef} className="flex space-x-4 mb-8" itemProp="sameAs">
                <a
                  href="https://www.facebook.com/albaz.alba.12/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-primary-700/35 flex items-center justify-center text-white hover:bg-primary-800 transition-colors pointer-events-auto"
                  aria-label="Facebook Profile"
                >
                  <FaFacebookF size={20} />
                  <span className="sr-only">Facebook</span>
                </a>
                <a
                  href="https://twitter.com/albazalba10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-primary-700/35 flex items-center justify-center text-white hover:bg-primary-800 transition-colors pointer-events-auto"
                  aria-label="Twitter Profile"
                >
                  <FaTwitter size={20} />
                  <span className="sr-only">Twitter</span>
                </a>
                <a
                  href="https://www.instagram.com/albazakthar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-primary-700/35 flex items-center justify-center text-white hover:bg-primary-800 transition-colors pointer-events-auto"
                  aria-label="Instagram Profile"
                >
                  <FaInstagram size={20} />
                  <span className="sr-only">Instagram</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/albazaqther/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-primary-700/35 flex items-center justify-center text-white hover:bg-primary-800 transition-colors pointer-events-auto"
                  aria-label="LinkedIn Profile"
                >
                  <FaLinkedinIn size={20} />
                  <span className="sr-only">LinkedIn</span>
                </a>
                <a
                  href="https://github.com/albazalba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-primary-700/35 flex items-center justify-center text-white hover:bg-primary-800 transition-colors pointer-events-auto"
                  aria-label="GitHub Profile"
                >
                  <FaGithub size={20} />
                  <span className="sr-only">GitHub</span>
                </a>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={scrollToSection('projects')}
                  className="wave-button relative z-10 px-6 border-0 py-3 bg-gradient-to-r from-primary-700 to-primary-500 text-white font-medium rounded-lg hover:opacity-100 pointer-events-auto overflow-hidden"
                  aria-label="View my projects"
                  style={{"--button-color-start": "#3db4ff", "--button-color-end": "#6a73ff"} as React.CSSProperties}
                >
                  <span className="relative z-10">View Projects</span>
                </button>
                <button
                  onClick={scrollToSection('contact')}
                  className="wave-button relative z-10 px-6 py-3 border border-white/30 text-white font-medium rounded-lg hover:opacity-100 pointer-events-auto overflow-hidden"
                  aria-label="Contact me"
                  style={{"--button-color-start": "#0E6BA8", "--button-color-end": "#0b5a8e"} as React.CSSProperties}
                >
                  <span className="relative z-10">Contact Me</span>
                </button>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative">
                <div className="">
                  {/* Profile photo */}
                  <div className="h-96">
                    <img
                      src="/toy.png"
                      alt="Albaz Aqther - Web Developer"
                      className="w-full h-full object-cover"
                      itemProp="image"
                      loading="eager"
                      width="384"
                      height="384"
                    />
                  </div>
                </div>
                <div className="absolute -top-5 -right-5 w-24 h-24 bg-primary-500/30 rounded-full filter blur-xl" aria-hidden="true" />
                <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-primary-700/30 rounded-full filter blur-xl" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Card decoration */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary-700/30 rounded-full filter blur-xl" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-primary-500/30 rounded-full filter blur-xl" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

export default Hero
