import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

// Define TypeScript interfaces
interface ProjectData {
  id: number;
  title: string;
  description: string;
  techStack: string[];
  link: string;
  githubLink: string;
  image: string | null;
}

// Project data
const projects: ProjectData[] = [
  {
    id: 1,
    title: 'Cyberpwn',
    description: 'Modern web application built with Next.js and Tailwind CSS, featuring Strapi CMS integration and Mailchimp for newsletter functionality.',
    techStack: ['Next JS', 'Tailwind', 'Strapi', 'Mailchimp', 'ShadCn'],
    link: 'https://antstack-website-one.vercel.app/',
    githubLink: '',
    image: '/cyberpwn.png',
  },
  {
    id: 2,
    title: 'Feedback App',
    description: 'Comprehensive feedback application with advanced UI components and state management using Redux.',
    techStack: ['React JS', 'Tailwind', 'Tantstack Query', 'Material UI', 'Tantstack Table', 'AWS', 'Redux'],
    link: 'https://pulse.antstack.org',
    githubLink: '',
    image: '/feedback.png',
  },
  {
    id: 3,
    title: 'Leave Tracker',
    description: 'Employee leave management system with a modern UI built using React and styled components.',
    techStack: ['React JS', 'Styled component', 'Tantstack Query', 'Material UI', 'Tantstack Table', 'AWS', 'Redux'],
    link: 'https://www.onleave.today',
    githubLink: '',
    image: '/onleave.png',
  },
  {
    id: 4,
    title: 'Antstack.com',
    description: 'Company website built with Astro and integrated with Strapi CMS and Mailchimp for newsletter functionality.',
    techStack: ['Astro', 'Strapi', 'mailchimp'],
    link: 'https://www.antstack.com/',
    githubLink: '',
    image: '/antstack.png',
  },
  {
    id: 5,
    title: 'Real Estate App',
    description: 'Full-stack real estate application built with the MERN stack (MongoDB, Express, React, Node.js).',
    techStack: ['MERN'],
    link: 'https://corplac.onrender.com/',
    githubLink: 'https://github.com/albazalba/corplac',
    image: '/Corplac.png',
  },
  {
    id: 6,
    title: 'Restaurant Finder',
    description: 'Next.js application for finding and exploring restaurants with a modern, responsive design.',
    techStack: ['Next JS'],
    link: 'https://retaurantfinder.netlify.app',
    githubLink: 'https://github.com/albazalba/restaurant-finder',
    image: '/restaurant.png',
  },
  {
    id: 7,
    title: 'Crypto Head',
    description: 'React application for tracking and analyzing cryptocurrency data with a clean user interface.',
    techStack: ['React JS'],
    link: 'https://crypto-head.netlify.app',
    githubLink: 'https://github.com/albazalba/crypto-head',
    image: '/crypto-head.png',
  },
  {
    id: 8,
    title: 'Burger Joint',
    description: 'Food delivery application inspired by Swiggy, built with React JS featuring a responsive design.',
    techStack: ['React JS'],
    link: 'https://burger-joint.netlify.app',
    githubLink: 'https://github.com/albazalba/swiggy-clone',
    image: '/burger-joint.png',
  },
  {
    id: 9,
    title: 'Hulu Clone',
    description: 'Next.js application replicating the Hulu streaming service interface with responsive design.',
    techStack: ['Next JS'],
    link: 'https://popcorn-movie.vercel.app',
    githubLink: 'https://github.com/albazalba/popcorn-movie-app',
    image: '/Hulu.png',
  },
];

// ProjectCard component with optimized tilt effect
const ProjectCard: React.FC<{ project: ProjectData; index: number }> = ({ project, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltTimeoutRef = useRef<number | null>(null);

  // Debounced handler to reduce number of updates
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;

    if (tiltTimeoutRef.current) {
      window.cancelAnimationFrame(tiltTimeoutRef.current);
    }

    tiltTimeoutRef.current = window.requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Reduce tilt amount to improve performance
      const tiltX = (y - centerY) / 20;
      const tiltY = (centerX - x) / 20;

      // Use transform directly for better performance
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;

    if (tiltTimeoutRef.current) {
      window.cancelAnimationFrame(tiltTimeoutRef.current);
    }

    // Reset transform with hardware acceleration
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    card.style.transition = 'transform 0.5s ease-out';
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Add will-change hint for better performance
    card.style.willChange = 'transform';

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      if (tiltTimeoutRef.current) {
        window.cancelAnimationFrame(tiltTimeoutRef.current);
      }
    };
  }, [handleMouseMove, handleMouseLeave]);

  // Generate a gradient background as fallback for images
  const generateGradientBackground = (index: number) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-400 to-blue-500',
      'from-purple-500 to-pink-500',
      'from-yellow-400 to-orange-500',
      'from-teal-400 to-blue-500',
      'from-red-500 to-pink-500',
    ];

    return gradients[index % gradients.length];
  };

  return (
    <div
      ref={cardRef}
      className="min-w-[300px] relative backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl overflow-hidden h-[400px] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] pointer-events-auto transition-all duration-300 hover:shadow-[0_15px_35px_0_rgba(31,38,135,0.5)]"
      style={{
        transformStyle: 'preserve-3d',
        transform: 'perspective(1000px)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      {/* Background gradient and image */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-700/30 to-primary-500/30 mix-blend-overlay"></div>

      {/* Fallback gradient if no image */}
      <div className={`absolute inset-0 bg-gradient-to-br ${generateGradientBackground(index)} opacity-20`}></div>

      {/* Try to load image if available */}
      {project.image && (
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${project.image})` }}></div>
      )}

      {/* Glassmorphic content */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
          <p className="text-gray-300 mb-4">{project.description}</p>
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {project.techStack.map((tech, i) => (
              <span key={i} className="px-3 py-1 text-xs bg-primary-700/50 backdrop-blur-md text-white rounded-full">
                {tech}
              </span>
            ))}
          </div>

          <div className="flex gap-3">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-primary-700/50 backdrop-blur-md !text-white rounded-full hover:bg-primary-500/50 transition-colors"
            >
              <FaExternalLinkAlt />
            </a>
            <a
              href={project.githubLink}
              className="p-3 bg-primary-700/50 backdrop-blur-md !text-white rounded-full hover:bg-primary-500/50 transition-colors"
            >
              <FaGithub color='white' />
            </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-500/30 rounded-full filter blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary-700/30 rounded-full filter blur-xl"></div>
      </div>
    </div>
  );
};

const Projects: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    // Reduce the number of animations and optimize ScrollTrigger
    const tl = gsap.timeline({
      paused: true,
      defaults: {
        ease: 'power2.out',
        duration: 0.7,
        clearProps: 'opacity'  // Clear props after animation for better memory management
      }
    });

    // Create single batch animation rather than individual ones
    tl.fromTo(titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0 }
    )
    .fromTo(cardsRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, stagger: 0.15 },
      '-=0.3'
    );

    // Only create one ScrollTrigger instance
    const scrollTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 70%',
      onEnter: () => tl.play(),
      onLeaveBack: () => tl.reverse(),
      once: false  // Set to true to run once if performance is still an issue
    });

    return () => {
      // Clean up
      tl.kill();
      scrollTrigger.kill();
    };
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 py-20"
    >
      {/* Reduced number of background elements */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-700/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl" />

      {/* Section header */}
      <div ref={titleRef} className="text-center mb-16 z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
            My Recent Works
          </span>
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Check out some of my latest projects and achievements
        </p>
      </div>

      {/* Project cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto z-10">
        {projects.map((project, index) => (
          <div
            key={project.id}
            ref={(el) => {
              cardsRef.current[index] = el;
            }}
          >
            <ProjectCard project={project} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
