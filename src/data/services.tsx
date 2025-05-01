import React from 'react';
import { FaCode, FaReact, FaServer, FaMobileAlt, FaDatabase, FaCloudversify } from 'react-icons/fa';
import { ServiceType } from '../types/service';

// Service data
const services: ServiceType[] = [
  {
    id: 1,
    title: 'Frontend Development',
    description: 'Building responsive and interactive user interfaces with modern frameworks like React, Next.js, and Vue.',
    icon: <FaReact size={44} className="text-blue-400" />,
    accent: 'border-blue-500',
    highlight: 'bg-blue-500/20',
  },
  {
    id: 2,
    title: 'Backend Development',
    description: 'Developing robust server-side applications with Node.js, Express, and other modern technologies.',
    icon: <FaServer size={44} className="text-green-400" />,
    accent: 'border-green-500',
    highlight: 'bg-green-500/20',
  },
  {
    id: 3,
    title: 'Full Stack Development',
    description: 'Creating end-to-end solutions that integrate both frontend and backend technologies.',
    icon: <FaCode size={44} className="text-purple-400" />,
    accent: 'border-purple-500',
    highlight: 'bg-purple-500/20',
  },
  {
    id: 4,
    title: 'Responsive Web Design',
    description: 'Designing websites that work seamlessly across all devices and screen sizes.',
    icon: <FaMobileAlt size={44} className="text-amber-400" />,
    accent: 'border-amber-500',
    highlight: 'bg-amber-500/20',
  },
  {
    id: 5,
    title: 'Database Design',
    description: 'Designing and implementing efficient database structures for optimal data storage and retrieval.',
    icon: <FaDatabase size={44} className="text-teal-400" />,
    accent: 'border-teal-500',
    highlight: 'bg-teal-500/20',
  },
  {
    id: 6,
    title: 'Cloud Solutions',
    description: 'Implementing cloud-based solutions using AWS, Firebase, and other cloud platforms.',
    icon: <FaCloudversify size={44} className="text-pink-400" />,
    accent: 'border-pink-500',
    highlight: 'bg-pink-500/20',
  },
];

export default services;
