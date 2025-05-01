import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { FaCode } from 'react-icons/fa';
import { ExperienceType } from '../../types/experience';

interface ExperienceDetailProps {
  experience: ExperienceType;
}

const ExperienceDetail: React.FC<ExperienceDetailProps> = ({ experience }) => {
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (detailRef.current) {
      gsap.fromTo(
        detailRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [experience.id]);

  return (
    <div ref={detailRef} className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4">{experience.position} at {experience.company}</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white/80 mb-3">Responsibilities</h3>
        <ul className="space-y-2">
          {experience.responsibilities.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="inline-block mr-2 mt-1 text-primary-400">•</span>
              <span className="text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white/80 mb-3">Technologies</h3>
        <div className="flex flex-wrap gap-2">
          {experience.technologies.map((tech, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary-700/30 text-white rounded-full text-sm flex items-center"
            >
              <FaCode className="mr-1" size={12} />
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetail;
