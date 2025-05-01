import React, { useRef } from 'react';
import gsap from 'gsap';
import { ServiceType } from '../../types/service';

interface ServiceCardProps {
  service: ServiceType;
  index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Hover animation effect
  const handleMouseEnter = () => {
    if (!cardRef.current || !iconContainerRef.current || !contentRef.current) return;

    gsap.to(iconContainerRef.current, {
      y: -10,
      scale: 1.1,
      duration: 0.4,
      ease: 'power2.out'
    });

    gsap.to(contentRef.current, {
      y: 5,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || !iconContainerRef.current || !contentRef.current) return;

    gsap.to(iconContainerRef.current, {
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: 'power2.out'
    });

    gsap.to(contentRef.current, {
      y: 0,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  return (
    <div
      ref={cardRef}
      className={`group relative backdrop-blur-lg bg-white/5 border-l-4 ${service.accent} rounded-xl overflow-hidden p-6 h-full shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transition-all duration-300 hover:bg-white/10`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated Icon Container */}
      <div
        ref={iconContainerRef}
        className={`${service.highlight} w-20 h-20 rounded-2xl mb-6 flex items-center justify-center
                    shadow-lg transform transition-transform relative`}
      >
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-2xl border border-white/20 opacity-70"></div>
        {/* Animated Glow */}
        <div className={`absolute inset-0 rounded-2xl ${service.accent} opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-500`}></div>
        {service.icon}
      </div>

      {/* Content */}
      <div ref={contentRef} className="relative z-10 transition-transform">
        <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
        <p className="text-gray-300">{service.description}</p>
      </div>

      {/* Hover highlight effect */}
      <div className={`absolute bottom-0 left-0 h-1 ${service.accent.replace('border', 'bg')} w-0 group-hover:w-full transition-all duration-500 ease-out`}></div>

      {/* Background accent */}
      <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
           style={{ background: `linear-gradient(135deg, ${getColorFromClass(service.accent)} 0%, transparent 70%)` }}>
      </div>
    </div>
  );
};

// Helper function to get actual color from tailwind class
const getColorFromClass = (className: string): string => {
  const colorMap: Record<string, string> = {
    'border-blue-500': '#3B82F6',
    'border-green-500': '#22C55E',
    'border-purple-500': '#A855F7',
    'border-amber-500': '#F59E0B',
    'border-teal-500': '#14B8A6',
    'border-pink-500': '#EC4899',
  };

  return colorMap[className] || '#6366F1';
};

export default ServiceCard;
