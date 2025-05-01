import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGithub } from 'react-icons/fa'

const Hero = () => {
  const cardRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const socialIconsRef = useRef<HTMLDivElement>(null)

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

  return (
    <section id="hero" className="relative min-h-screen w-screen flex items-center justify-center overflow-hidden px-4 py-12 pointer-events-none">
      {/* Background with subtle pattern or noise */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700/10 to-primary-500/10" />
        <div className="absolute h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiMyMjIiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')]" />
      </div>

      {/* Animated background circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-700/20 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-200/30 rounded-full filter blur-3xl animate-blob" />

      {/* Glassmorphic Card - centered with flex */}
      <div
        ref={cardRef}
        className="w-full max-w-7xl backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] overflow-hidden relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 sm:p-12">
          {/* Left Column - Content */}
          <div ref={contentRef} className="flex flex-col justify-center">
            <h2 className="text-xl sm:text-2xl text-white/80 font-light mb-2">
              Hello I'M A
            </h2>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Web </span>
              <span className="bg-gradient-to-r from-primary-200 to-primary-500 bg-clip-text text-primary-900">
                Developer.
              </span>
            </h1>

            <p className="text-lg text-gray-300 font-light mb-8 max-w-xl">
              Hi I'm Albaz Aqther, a passionate Developer based in Dubai, Welcome to my world.
            </p>

            {/* Social Media Icons */}
            <div ref={socialIconsRef} className="flex space-x-4 mb-8">
              <a href="https://www.facebook.com/albaz.alba.12/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-primary-700/35 flex items-center justify-center text-white hover:bg-primary-800 transition-colors pointer-events-auto">
                <FaFacebookF size={20} />
              </a>
              <a href="https://twitter.com/albazalba10" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-primary-700/35 flex items-center justify-center text-white hover:bg-primary-800 transition-colors pointer-events-auto">
                <FaTwitter size={20} />
              </a>
              <a href="https://www.instagram.com/albazakthar/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-primary-700/35 flex items-center justify-center text-white hover:bg-primary-800 transition-colors pointer-events-auto">
                <FaInstagram size={20} />
              </a>
              <a href="https://www.linkedin.com/in/albazaqther/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-primary-700/35 flex items-center justify-center text-white hover:bg-primary-800 transition-colors pointer-events-auto">
                <FaLinkedinIn size={20} />
              </a>
              <a href="https://github.com/albazalba" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-primary-700/35 flex items-center justify-center text-white hover:bg-primary-800 transition-colors pointer-events-auto">
                <FaGithub size={20} />
              </a>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={scrollToSection('projects')}
                className="px-6 border-0 py-3 bg-gradient-to-r from-primary-700 to-primary-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity pointer-events-auto"
              >
                View Projects
              </button>
              <button
                onClick={scrollToSection('contact')}
                className="px-6 py-3 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-colors pointer-events-auto"
              >
                Contact Me
              </button>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative">
              <div className="">
                {/* Profile photo */}
                <div className="h-96">
                  <img src="/toy.png" alt="Albaz Aqther" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="absolute -top-5 -right-5 w-24 h-24 bg-primary-500/30 rounded-full filter blur-xl" />
              <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-primary-700/30 rounded-full filter blur-xl" />
            </div>
          </div>
        </div>

        {/* Card decoration */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary-700/30 rounded-full filter blur-xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-primary-500/30 rounded-full filter blur-xl" />
      </div>
    </section>
  )
}

export default Hero
