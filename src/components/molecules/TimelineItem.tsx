import React, { useEffect, useRef } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import { ExperienceType } from '../../types/experience';

interface TimelineItemProps {
  experience: ExperienceType;
  isActive: boolean;
  onClick: () => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ experience, isActive, onClick }) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isActive]);

  const getColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'blue': 'border-blue-500 bg-blue-500/10 text-blue-400',
      'purple': 'border-purple-500 bg-purple-500/10 text-purple-400',
      'green': 'border-green-500 bg-green-500/10 text-green-400',
    };
    return colorMap[color] || 'border-primary-500 bg-primary-500/10 text-primary-400';
  };

  return (
    <div
      ref={itemRef}
      className={`relative cursor-pointer mb-8 transition-all duration-300 ${isActive ? 'scale-100' : 'opacity-70 hover:opacity-100'}`}
      onClick={onClick}
    >
      {/* Timeline connector */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700"></div>

      {/* Timeline dot */}
      <div className={`absolute left-2 top-2 w-5 h-5 rounded-full border-2 ${getColor(experience.color).split(' ')[0]} z-10 ${isActive ? 'animate-pulse' : ''}`}></div>

      {/* Content */}
      <div className={`pl-12 transition-all duration-300 ${isActive ? 'transform-gpu' : ''}`}>
        <div className={`py-2 px-3 inline-block rounded mb-1 font-medium ${getColor(experience.color)}`}>
          {experience.position}
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{experience.company}</h3>
        <div className="flex items-center text-gray-400 mb-2">
          <FaCalendarAlt className="mr-2" />
          <span>{experience.period}</span>
          <span className="mx-2">•</span>
          <span>{experience.location}</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;
