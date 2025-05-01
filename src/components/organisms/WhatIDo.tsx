import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import components and data
import ServiceCard from '../molecules/ServiceCard';
import services from '../../data/services';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

const WhatIDo: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    // Animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 70%',
        end: 'center center',
        toggleActions: 'play none none reverse',
      },
    });

    // Animate the title and subtitle
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo(
        cardsRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out'
        },
        '-=0.2'
      );

    return () => {
      // Clean up
      if (tl) tl.kill();
    };
  }, []);

  return (
    <section
      id="whatido"
      ref={sectionRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 py-20"
    >
      {/* Background elements */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-700/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl"></div>

      {/* Section header */}
      <div className="text-center mb-16 z-10 max-w-3xl">
        <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
            What I Do
          </span>
        </h2>
        <p ref={subtitleRef} className="text-lg text-gray-300 mx-auto">
          I specialize in building modern web applications using cutting-edge technologies.
          My expertise spans from frontend development to backend solutions, creating
          seamless digital experiences.
        </p>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto z-10">
        {services.map((service, index) => (
          <div
            key={service.id}
            ref={(el) => {
              cardsRef.current[index] = el;
            }}
          >
            <ServiceCard service={service} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhatIDo;
