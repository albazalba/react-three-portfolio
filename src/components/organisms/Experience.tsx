import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaBriefcase } from 'react-icons/fa';

// Import components and data
import TimelineItem from '../molecules/TimelineItem';
import ExperienceDetail from '../molecules/ExperienceDetail';
import experiences from '../../data/experiences';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

const Experience: React.FC = () => {
  const [activeExperience, setActiveExperience] = useState(experiences[0].id);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

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
        timelineRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.2'
      )
      .fromTo(
        detailRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.8'
      );

    return () => {
      // Clean up
      if (tl) tl.kill();
    };
  }, []);

  const currentExperience = experiences.find(exp => exp.id === activeExperience) || experiences[0];

  return (
    <section
      id="experience"
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
            My Experience
          </span>
        </h2>
        <p ref={subtitleRef} className="text-lg text-gray-300 mx-auto">
          My professional journey as a developer, building innovative web solutions and leading development teams.
        </p>
      </div>

      {/* Two-column layout for timeline and details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto z-10 w-full">
        {/* Timeline - Left column */}
        <div ref={timelineRef} className="lg:col-span-5 order-2 lg:order-1">
          <div className="relative pl-4">
            <div className="flex items-center mb-6">
              <FaBriefcase size={22} className="text-primary-400 mr-2" />
              <h3 className="text-xl font-bold text-white">Work Timeline</h3>
            </div>

            {experiences.map(experience => (
              <TimelineItem
                key={experience.id}
                experience={experience}
                isActive={activeExperience === experience.id}
                onClick={() => setActiveExperience(experience.id)}
              />
            ))}
          </div>
        </div>

        {/* Experience details - Right column */}
        <div ref={detailRef} className="lg:col-span-7 order-1 lg:order-2">
          <ExperienceDetail experience={currentExperience} />
        </div>
      </div>
    </section>
  );
};

export default Experience;
