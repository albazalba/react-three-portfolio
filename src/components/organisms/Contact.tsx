import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { IoMail, IoMailOutline } from 'react-icons/io5'
import { FaLinkedinIn } from 'react-icons/fa'
import { SiMedium } from 'react-icons/si'

const Contact = () => {
  const cardRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const socialLinksRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

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

    gsap.set(socialLinksRef.current, {
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
    }, '-=0.5')
    .to(socialLinksRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1
    }, '-=0.3')

  }, [])

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 py-20"
    >
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
          {/* Left Column - Big Text */}
          <div className="flex flex-col justify-center">
            <h2 className="text-9xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
              Shall<br />we?
            </h2>
          </div>

          {/* Right Column - Content */}
          <div ref={contentRef} className="flex flex-col justify-center">
            <p className="text-lg text-gray-300 font-light mb-8 max-w-xl">
              Based in Dubai, I work with English, Malayalam and Hindi-speaking teams to
              create accessible digital experiences and adopt inclusive practices.
              Want to work together?
            </p>

            <div className="flex flex-col gap-6">
              {/* Email button */}
              <a
                href="mailto:contact@example.com"
                className="px-6 border-0 py-3 bg-gradient-to-r from-primary-700 to-primary-500 !text-white font-medium rounded-lg hover:opacity-90 transition-opacity inline-flex items-center pointer-events-auto w-fit"
              >
                <IoMail className="mr-2" size={20} />
                Email me
              </a>

              {/* Social links */}
              <div ref={socialLinksRef} className="flex space-x-4 mb-8">
                <a href="#newsletter" className="w-12 h-12 rounded-full bg-primary-700/35 flex items-center justify-center text-white hover:bg-primary-800 transition-colors pointer-events-auto">
                  <IoMailOutline size={20} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-primary-700/35 flex items-center justify-center text-white hover:bg-primary-800 transition-colors pointer-events-auto">
                  <FaLinkedinIn size={20} />
                </a>
                <a href="https://medium.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-primary-700/35 flex items-center justify-center text-white hover:bg-primary-800 transition-colors pointer-events-auto">
                  <SiMedium size={20} />
                </a>
              </div>
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

export default Contact
